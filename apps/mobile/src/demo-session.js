import { readFile } from "node:fs/promises";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const API_BASE = process.env.DRIVEAI_API_BASE || "http://127.0.0.1:3030";

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return payload;
}

async function ensureDemoSource() {
  const sources = await fetchJson("/study-sources");
  if (sources.items.length > 0) {
    return sources.items[0];
  }

  const content = await readFile(new URL("./demo-content.md", import.meta.url), "utf8");
  const created = await fetchJson("/study-sources", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      title: "TCP와 UDP",
      content,
    }),
  });

  await fetchJson(`/study-sources/${created.item.id}/process`, { method: "POST" });
  return created.item;
}

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    const health = await fetchJson("/health");
    console.log(`DriveAI mobile demo connected: provider=${health.provider}`);

    const source = await ensureDemoSource();
    const details = await fetchJson(`/study-sources/${source.id}`);

    if (details.item.status !== "processed") {
      await fetchJson(`/study-sources/${source.id}/process`, { method: "POST" });
    }

    const sessionResponse = await fetchJson("/sessions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sourceId: source.id,
        limit: 3,
      }),
    });

    let session = sessionResponse.item;

    console.log(`\nSession started: ${details.item.title}`);

    while (session.currentQuizItem) {
      console.log(`\nQuestion: ${session.currentQuizItem.prompt}`);
      const transcript = await rl.question("Your answer (or type stop): ");

      if (transcript.trim().toLowerCase() === "stop") {
        break;
      }

      const answerResponse = await fetchJson(`/sessions/${session.id}/answers`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          transcript,
        }),
      });

      console.log(`Feedback: ${answerResponse.evaluation.spokenFeedback}`);
      if (answerResponse.evaluation.missingPoints.length > 0) {
        console.log(`Missing: ${answerResponse.evaluation.missingPoints.join(", ")}`);
      }

      session = answerResponse.session;
    }

    const latest = await fetchJson(`/sessions/${session.id}`);
    if (latest.item.summary) {
      console.log("\nSession summary");
      console.log(JSON.stringify(latest.item.summary, null, 2));
    } else {
      console.log("\nSession ended before completion.");
    }
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
