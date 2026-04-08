import {
  SessionStatuses,
  SourceStatuses,
  createAnswerAttempt,
  createStudySession,
  createStudySource,
  nowIso,
} from "../../../packages/shared-types/src/index.js";

export function createMemoryStore() {
  const state = {
    sources: new Map(),
    chunks: new Map(),
    quizItems: new Map(),
    sessions: new Map(),
    attempts: new Map(),
    weakPoints: new Map(),
    counters: new Map(),
  };

  function createId(prefix) {
    const current = state.counters.get(prefix) || 0;
    const next = current + 1;
    state.counters.set(prefix, next);
    return `${prefix}_${next}`;
  }

  return {
    createId,

    createStudySource(input) {
      const source = createStudySource({
        id: createId("source"),
        title: input.title,
        content: input.content,
        metadata: input.metadata || {},
      });

      state.sources.set(source.id, source);
      return source;
    },

    listStudySources() {
      return [...state.sources.values()];
    },

    getStudySource(id) {
      return state.sources.get(id) || null;
    },

    saveProcessedSource(sourceId, artifacts) {
      const source = state.sources.get(sourceId);
      if (!source) {
        return null;
      }

      source.status = SourceStatuses.PROCESSED;
      source.updatedAt = nowIso();
      source.chunkIds = [];
      source.quizItemIds = [];

      for (const chunk of artifacts.chunks) {
        state.chunks.set(chunk.id, chunk);
        source.chunkIds.push(chunk.id);
      }

      for (const quizItem of artifacts.quizItems) {
        state.quizItems.set(quizItem.id, quizItem);
        source.quizItemIds.push(quizItem.id);
      }

      return source;
    },

    getChunk(id) {
      return state.chunks.get(id) || null;
    },

    getQuizItem(id) {
      return state.quizItems.get(id) || null;
    },

    listQuizItemsBySource(sourceId) {
      const source = state.sources.get(sourceId);
      if (!source) {
        return [];
      }

      return source.quizItemIds.map((id) => state.quizItems.get(id)).filter(Boolean);
    },

    createSession({ sourceId, mode, quizItemIds }) {
      const session = createStudySession({
        id: createId("session"),
        sourceId,
        mode,
        quizItemIds,
      });

      state.sessions.set(session.id, session);
      return session;
    },

    getSession(id) {
      return state.sessions.get(id) || null;
    },

    updateSession(sessionId, patch) {
      const session = state.sessions.get(sessionId);
      if (!session) {
        return null;
      }

      Object.assign(session, patch, { updatedAt: nowIso() });

      if (patch.status === SessionStatuses.COMPLETED && !session.completedAt) {
        session.completedAt = nowIso();
      }

      return session;
    },

    createAttempt({ sessionId, quizItemId, transcript, evaluation }) {
      const attempt = createAnswerAttempt({
        id: createId("attempt"),
        sessionId,
        quizItemId,
        transcript,
        evaluation,
      });

      state.attempts.set(attempt.id, attempt);

      const session = state.sessions.get(sessionId);
      if (session) {
        session.attemptIds.push(attempt.id);
        session.updatedAt = nowIso();
      }

      return attempt;
    },

    listAttemptsBySession(sessionId) {
      const session = state.sessions.get(sessionId);
      if (!session) {
        return [];
      }

      return session.attemptIds.map((id) => state.attempts.get(id)).filter(Boolean);
    },

    incrementWeakPoint({ sourceId, label, scorePenalty, quizItemId }) {
      const key = `${sourceId}:${label}`;
      const current = state.weakPoints.get(key) || {
        id: createId("weak"),
        sourceId,
        label,
        quizItemIds: [],
        hits: 0,
        averagePenalty: 0,
        updatedAt: nowIso(),
      };

      current.hits += 1;
      current.quizItemIds = [...new Set([...current.quizItemIds, quizItemId])];
      current.averagePenalty = Number(
        ((current.averagePenalty * (current.hits - 1) + scorePenalty) / current.hits).toFixed(2),
      );
      current.updatedAt = nowIso();

      state.weakPoints.set(key, current);
      return current;
    },

    listWeakPoints(sourceId = null) {
      const items = [...state.weakPoints.values()];

      return items
        .filter((item) => !sourceId || item.sourceId === sourceId)
        .sort((left, right) => {
          if (right.hits !== left.hits) {
            return right.hits - left.hits;
          }

          return right.averagePenalty - left.averagePenalty;
        });
    },
  };
}
