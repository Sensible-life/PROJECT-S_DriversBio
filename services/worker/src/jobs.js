import {
  buildSessionSummary,
  collectWeakPoints,
  createStudyArtifacts,
} from "../../../packages/session-engine/src/index.js";

export function processSourceJob({ source, createId }) {
  return createStudyArtifacts({
    sourceId: source.id,
    title: source.title,
    content: source.content,
    createId,
  });
}

export function summarizeSessionJob({ session, quizItems, attempts, weakPoints }) {
  return buildSessionSummary({
    session,
    quizItems,
    attempts,
    weakPoints,
  });
}

export function deriveWeakPointsJob({ sourceId, quizItem, evaluation }) {
  return collectWeakPoints({ sourceId, quizItem, evaluation });
}
