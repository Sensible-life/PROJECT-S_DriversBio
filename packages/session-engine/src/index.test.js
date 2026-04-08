import test from "node:test";
import assert from "node:assert/strict";

import { createStudyArtifacts, evaluateQuizAnswer } from "./index.js";

test("createStudyArtifacts returns chunk and quiz items", () => {
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

test("evaluateQuizAnswer scores matching keywords", () => {
  const evaluation = evaluateQuizAnswer({
    quizItem: {
      expectedKeywords: ["tcp", "연결", "프로토콜"],
    },
    transcript: "TCP는 연결 기반 프로토콜이야.",
  });

  assert.equal(evaluation.isCorrect, true);
  assert.ok(evaluation.score >= 0.66);
});
