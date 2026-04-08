import { createServer } from "node:http";

import { createProviderFromEnv } from "../../../packages/ai-provider/src/index.js";
import {
  buildSessionSummary,
  collectWeakPoints,
  selectNextQuizItem,
} from "../../../packages/session-engine/src/index.js";
import {
  SessionModes,
  SessionStatuses,
  SourceStatuses,
} from "../../../packages/shared-types/src/index.js";
import { createMemoryStore } from "./store.js";

function json(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
  });
  res.end(JSON.stringify(payload, null, 2));
}

function notFound(res) {
  json(res, 404, { error: "Not found" });
}

async function readJson(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function serializeSession(store, session) {
  const quizItems = session.quizItemIds.map((id) => store.getQuizItem(id)).filter(Boolean);
  const attempts = store.listAttemptsBySession(session.id);
  const currentQuizItem = session.currentQuizItemId ? store.getQuizItem(session.currentQuizItemId) : null;

  return {
    ...session,
    currentQuizItem,
    quizItems,
    attempts,
  };
}

export function createAppContext() {
  return {
    store: createMemoryStore(),
    provider: createProviderFromEnv(process.env),
  };
}

export function createApp(context = createAppContext()) {
  const { store, provider } = context;

  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");

      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
        });
        res.end();
        return;
      }

      if (req.method === "GET" && url.pathname === "/health") {
        json(res, 200, { status: "ok", provider: provider.name });
        return;
      }

      if (req.method === "GET" && url.pathname === "/study-sources") {
        json(res, 200, { items: store.listStudySources() });
        return;
      }

      if (req.method === "POST" && url.pathname === "/study-sources") {
        const body = await readJson(req);

        if (!body.title || !body.content) {
          json(res, 400, { error: "title and content are required" });
          return;
        }

        const source = store.createStudySource(body);
        json(res, 201, { item: source });
        return;
      }

      const sourceMatch = url.pathname.match(/^\/study-sources\/([^/]+)$/);
      if (req.method === "GET" && sourceMatch) {
        const source = store.getStudySource(sourceMatch[1]);

        if (!source) {
          notFound(res);
          return;
        }

        json(res, 200, {
          item: source,
          chunks: source.chunkIds.map((id) => store.getChunk(id)).filter(Boolean),
          quizItems: source.quizItemIds.map((id) => store.getQuizItem(id)).filter(Boolean),
        });
        return;
      }

      const processMatch = url.pathname.match(/^\/study-sources\/([^/]+)\/process$/);
      if (req.method === "POST" && processMatch) {
        const source = store.getStudySource(processMatch[1]);

        if (!source) {
          notFound(res);
          return;
        }

        const artifacts = await provider.processStudySource({
          source,
          createId: store.createId,
        });
        const processed = store.saveProcessedSource(source.id, artifacts);

        json(res, 200, {
          item: processed,
          chunkCount: artifacts.chunks.length,
          quizCount: artifacts.quizItems.length,
        });
        return;
      }

      if (req.method === "POST" && url.pathname === "/sessions") {
        const body = await readJson(req);
        const mode = body.mode || SessionModes.QUIZ;
        const source = store.getStudySource(body.sourceId);

        if (!source) {
          json(res, 404, { error: "Study source not found" });
          return;
        }

        if (source.status !== SourceStatuses.PROCESSED) {
          json(res, 400, { error: "Study source must be processed before creating a session" });
          return;
        }

        const quizItems = store.listQuizItemsBySource(source.id);
        const limit = Math.max(1, Math.min(Number(body.limit || 5), quizItems.length));
        const session = store.createSession({
          sourceId: source.id,
          mode,
          quizItemIds: quizItems.slice(0, limit).map((item) => item.id),
        });

        json(res, 201, { item: serializeSession(store, session) });
        return;
      }

      const sessionMatch = url.pathname.match(/^\/sessions\/([^/]+)$/);
      if (req.method === "GET" && sessionMatch) {
        const session = store.getSession(sessionMatch[1]);
        if (!session) {
          notFound(res);
          return;
        }

        json(res, 200, { item: serializeSession(store, session) });
        return;
      }

      const answerMatch = url.pathname.match(/^\/sessions\/([^/]+)\/answers$/);
      if (req.method === "POST" && answerMatch) {
        const session = store.getSession(answerMatch[1]);
        if (!session) {
          notFound(res);
          return;
        }

        if (!session.currentQuizItemId) {
          json(res, 400, { error: "Session has no active question" });
          return;
        }

        const body = await readJson(req);
        const transcript = String(body.transcript || "").trim();
        if (!transcript) {
          json(res, 400, { error: "transcript is required" });
          return;
        }

        const quizItem = store.getQuizItem(session.currentQuizItemId);
        const evaluation = await provider.evaluateAnswer({
          quizItem,
          transcript,
          mode: session.mode,
        });

        const attempt = store.createAttempt({
          sessionId: session.id,
          quizItemId: quizItem.id,
          transcript,
          evaluation,
        });

        const weakPointInputs = collectWeakPoints({
          sourceId: session.sourceId,
          quizItem,
          evaluation,
        });

        for (const weakPoint of weakPointInputs) {
          store.incrementWeakPoint(weakPoint);
        }

        const attempts = store.listAttemptsBySession(session.id);
        const quizItems = session.quizItemIds.map((id) => store.getQuizItem(id)).filter(Boolean);
        const nextQuizItem = selectNextQuizItem({ quizItems, attempts });
        const weakPoints = store.listWeakPoints(session.sourceId);
        const status = nextQuizItem ? SessionStatuses.ACTIVE : SessionStatuses.COMPLETED;
        const summary =
          status === SessionStatuses.COMPLETED
            ? buildSessionSummary({ session, quizItems, attempts, weakPoints })
            : null;

        const updatedSession = store.updateSession(session.id, {
          currentQuizItemId: nextQuizItem?.id || null,
          status,
          summary,
        });

        json(res, 200, {
          attempt,
          evaluation,
          nextQuizItem,
          session: serializeSession(store, updatedSession),
        });
        return;
      }

      if (req.method === "GET" && url.pathname === "/weak-points") {
        const sourceId = url.searchParams.get("sourceId");
        json(res, 200, { items: store.listWeakPoints(sourceId) });
        return;
      }

      notFound(res);
    } catch (error) {
      json(res, 500, {
        error: error instanceof Error ? error.message : "Unexpected error",
      });
    }
  });
}
