import assert from "node:assert/strict";

import {
  createStudyArtifacts,
  evaluateQuizAnswer,
} from "../packages/session-engine/src/index.js";
import { createAppContext, createApp } from "../services/api/src/app.js";

async function run(name, fn) {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

await run("session engine creates artifacts", async () => {
  let counter = 0;
  const createId = (prefix) => `${prefix}_${++counter}`;

  const artifacts = createStudyArtifacts({
    sourceId: "src_1",
    title: "네트워크 기본",
    content: "TCP는 연결 지향 프로토콜이다.\n\nUDP는 비연결형이며 빠르다.",
    createId,
  });

  assert.equal(artifacts.chunks.length, 2);
  assert.equal(artifacts.quizItems.length, 2);
});

await run("session engine evaluates matching answers", async () => {
  const evaluation = evaluateQuizAnswer({
    quizItem: {
      expectedKeywords: ["tcp", "연결", "프로토콜"],
    },
    transcript: "TCP는 연결 기반 프로토콜이야.",
  });

  assert.equal(evaluation.isCorrect, true);
  assert.ok(evaluation.score >= 0.66);
});

await run("api smoke flow works", async () => {
  const context = createAppContext();
  const server = createApp(context);

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const created = await fetch(`${baseUrl}/study-sources`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title: "운영체제",
        content: "커널은 하드웨어와 프로세스를 관리한다.\n\n스케줄러는 작업 순서를 조정한다.",
      }),
    }).then((response) => response.json());

    assert.ok(created.item.id);

    const processed = await fetch(`${baseUrl}/study-sources/${created.item.id}/process`, {
      method: "POST",
    }).then((response) => response.json());

    assert.equal(processed.item.status, "processed");
    assert.ok(processed.quizCount >= 1);

    const sessionResponse = await fetch(`${baseUrl}/sessions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sourceId: created.item.id,
        limit: 2,
      }),
    }).then((response) => response.json());

    assert.ok(sessionResponse.item.currentQuizItem);

    const answerResponse = await fetch(`${baseUrl}/sessions/${sessionResponse.item.id}/answers`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        transcript: "커널은 하드웨어와 프로세스를 관리하는 역할을 한다.",
      }),
    }).then((response) => response.json());

    assert.ok(typeof answerResponse.evaluation.score === "number");
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
