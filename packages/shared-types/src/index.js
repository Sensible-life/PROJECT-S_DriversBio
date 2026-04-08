export const SessionModes = Object.freeze({
  QUIZ: "quiz",
  EXPLAIN: "explain",
  TRUTH_CHECK: "truth_check",
});

export const SourceStatuses = Object.freeze({
  DRAFT: "draft",
  PROCESSED: "processed",
});

export const SessionStatuses = Object.freeze({
  READY: "ready",
  ACTIVE: "active",
  COMPLETED: "completed",
});

export function nowIso() {
  return new Date().toISOString();
}

export function slugifyTitle(title) {
  return String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createStudySource({
  id,
  title,
  content,
  metadata = {},
  status = SourceStatuses.DRAFT,
}) {
  return {
    id,
    title,
    slug: slugifyTitle(title),
    content,
    metadata,
    status,
    chunkIds: [],
    quizItemIds: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

export function createStudySession({
  id,
  sourceId,
  mode = SessionModes.QUIZ,
  quizItemIds,
}) {
  return {
    id,
    sourceId,
    mode,
    quizItemIds,
    attemptIds: [],
    currentQuizItemId: quizItemIds[0] || null,
    status: quizItemIds.length ? SessionStatuses.ACTIVE : SessionStatuses.READY,
    summary: null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    completedAt: null,
  };
}

export function createAnswerAttempt({
  id,
  sessionId,
  quizItemId,
  transcript,
  evaluation,
}) {
  return {
    id,
    sessionId,
    quizItemId,
    transcript,
    evaluation,
    createdAt: nowIso(),
  };
}
