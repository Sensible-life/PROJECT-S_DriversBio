import {
  createStudyArtifacts,
  evaluateQuizAnswer,
} from "../../session-engine/src/index.js";

export class MockStudyProvider {
  constructor() {
    this.name = "mock";
  }

  async processStudySource({ source, createId }) {
    return createStudyArtifacts({
      sourceId: source.id,
      title: source.title,
      content: source.content,
      createId,
    });
  }

  async evaluateAnswer({ quizItem, transcript }) {
    return evaluateQuizAnswer({ quizItem, transcript });
  }
}

export class DeferredRemoteProvider {
  constructor(name) {
    this.name = name;
  }

  async processStudySource() {
    throw new Error(
      `${this.name} provider is declared but not wired yet. Use DRIVEAI_PROVIDER=mock for the runnable local prototype.`,
    );
  }

  async evaluateAnswer() {
    throw new Error(
      `${this.name} provider is declared but not wired yet. Use DRIVEAI_PROVIDER=mock for the runnable local prototype.`,
    );
  }
}

export function createProviderFromEnv(env = process.env) {
  const provider = String(env.DRIVEAI_PROVIDER || "mock").toLowerCase();

  if (provider === "openai") {
    return new DeferredRemoteProvider("openai");
  }

  if (provider === "gemini") {
    return new DeferredRemoteProvider("gemini");
  }

  return new MockStudyProvider();
}
