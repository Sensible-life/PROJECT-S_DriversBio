import { clipSpokenFeedback, normalizeTranscript } from "../../audio-core/src/index.js";

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "into",
  "have",
  "will",
  "were",
  "있다",
  "이다",
  "하는",
  "한다",
  "그리고",
  "또한",
  "에서",
  "으로",
  "한다면",
  "대한",
  "위한",
  "정리",
]);

function unique(items) {
  return [...new Set(items)];
}

export function extractKeywords(text, limit = 8) {
  const tokens = normalizeTranscript(text)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token));

  return unique(tokens).slice(0, limit);
}

export function splitSourceIntoChunks(content) {
  const rawSections = String(content || "")
    .split(/\n\s*\n+/)
    .map((section) => section.trim())
    .filter(Boolean);

  if (rawSections.length > 0) {
    return rawSections;
  }

  return String(content || "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((section) => section.trim())
    .filter(Boolean);
}

function sentenceParts(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+|\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function deriveChunkTitle(section, index) {
  const lines = section.split("\n").map((line) => line.trim()).filter(Boolean);
  const heading = lines[0]?.replace(/^#+\s*/, "");

  if (heading && heading.length <= 60) {
    return heading;
  }

  return `Concept ${index + 1}`;
}

export function createStudyArtifacts({ sourceId, title, content, createId }) {
  const sections = splitSourceIntoChunks(content);
  const chunks = sections.map((section, index) => {
    const parts = sentenceParts(section);
    const keyPoints = parts.slice(0, 3);
    const chunkTitle = deriveChunkTitle(section, index);
    const expectedKeywords = extractKeywords(`${chunkTitle} ${keyPoints.join(" ")}`, 10);

    return {
      id: createId("chunk"),
      sourceId,
      index,
      title: chunkTitle,
      body: section,
      keyPoints,
      expectedKeywords,
    };
  });

  const quizItems = chunks.map((chunk) => {
    const focus = chunk.keyPoints[0] || chunk.body;

    return {
      id: createId("quiz"),
      sourceId,
      chunkId: chunk.id,
      prompt: `${title} 기준으로 "${chunk.title}" 개념을 20초 안에 설명해봐.`,
      referenceAnswer: chunk.keyPoints.join(" "),
      expectedKeywords: extractKeywords(`${chunk.title} ${focus}`, 8),
      followUpPrompts: [
        `${chunk.title}의 핵심 역할은 뭐야?`,
        `${chunk.title}와 관련된 중요한 포인트를 하나 더 말해봐.`,
      ],
    };
  });

  return { chunks, quizItems };
}

export function evaluateQuizAnswer({ quizItem, transcript }) {
  const expectedKeywords = quizItem.expectedKeywords || [];
  const normalized = normalizeTranscript(transcript);
  const transcriptKeywords = extractKeywords(transcript, 12);
  const matchedKeywords = expectedKeywords.filter((keyword) => normalized.includes(keyword));
  const missingKeywords = expectedKeywords.filter((keyword) => !normalized.includes(keyword));
  const unsupportedKeywords = transcriptKeywords
    .filter((keyword) => !expectedKeywords.includes(keyword))
    .slice(0, 3);

  const score = expectedKeywords.length
    ? Number((matchedKeywords.length / expectedKeywords.length).toFixed(2))
    : 0;

  const incorrectClaims =
    score < 0.5
      ? unsupportedKeywords.map(
          (keyword) => `"${keyword}" 관련 진술은 현재 기준 자료에서 직접 확인되지 않았어.`,
        )
      : [];

  let spokenFeedback = "";

  if (score >= 0.85) {
    spokenFeedback = `좋아. 핵심은 정확해. ${matchedKeywords.slice(0, 2).join(", ")} 포인트를 잘 짚었어.`;
  } else if (score >= 0.55) {
    spokenFeedback = `방향은 맞아. 다만 ${missingKeywords.slice(0, 2).join(", ")} 부분을 보강하면 더 정확해져.`;
  } else {
    spokenFeedback = `핵심이 아직 부족해. 먼저 ${expectedKeywords.slice(0, 2).join(", ")} 중심으로 다시 설명해봐.`;
  }

  return {
    isCorrect: score >= 0.75,
    score,
    matchedKeywords,
    missingPoints: missingKeywords,
    incorrectClaims,
    spokenFeedback: clipSpokenFeedback(spokenFeedback),
    normalizedTranscript: normalized,
  };
}

export function selectNextQuizItem({ quizItems, attempts }) {
  const attemptsByQuizItem = new Map();

  for (const attempt of attempts) {
    const list = attemptsByQuizItem.get(attempt.quizItemId) || [];
    list.push(attempt);
    attemptsByQuizItem.set(attempt.quizItemId, list);
  }

  const unanswered = quizItems.filter((item) => !attemptsByQuizItem.has(item.id));
  if (unanswered.length > 0) {
    return unanswered[0];
  }

  const retryable = quizItems
    .map((item) => {
      const itemAttempts = attemptsByQuizItem.get(item.id) || [];
      const bestScore = Math.max(...itemAttempts.map((attempt) => attempt.evaluation.score), 0);
      return { item, itemAttempts, bestScore };
    })
    .filter(({ itemAttempts, bestScore }) => itemAttempts.length < 2 && bestScore < 0.75)
    .sort((left, right) => left.bestScore - right.bestScore);

  return retryable[0]?.item || null;
}

export function collectWeakPoints({ sourceId, quizItem, evaluation }) {
  return evaluation.missingPoints.map((point) => ({
    sourceId,
    quizItemId: quizItem.id,
    label: point,
    scorePenalty: Number((1 - evaluation.score).toFixed(2)),
  }));
}

export function buildSessionSummary({ session, quizItems, attempts, weakPoints }) {
  const answerCount = attempts.length;
  const averageScore =
    answerCount === 0
      ? 0
      : Number(
          (
            attempts.reduce((sum, attempt) => sum + (attempt.evaluation.score || 0), 0) /
            answerCount
          ).toFixed(2),
        );
  const correctCount = attempts.filter((attempt) => attempt.evaluation.isCorrect).length;

  return {
    sessionId: session.id,
    totalQuestions: quizItems.length,
    answerCount,
    averageScore,
    correctCount,
    weakPoints: weakPoints.slice(0, 5),
  };
}
