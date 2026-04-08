import test from "node:test";
import assert from "node:assert/strict";

import { createAppContext, createApp } from "./app.js";

test("API smoke flow creates source, processes it, runs a session", async () => {
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
