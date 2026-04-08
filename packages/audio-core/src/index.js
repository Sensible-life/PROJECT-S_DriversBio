export const VoiceCommands = Object.freeze({
  NEXT: "next",
  REPEAT: "repeat",
  STOP: "stop",
  START: "start",
  EXPLAIN: "explain",
});

const COMMAND_PATTERNS = [
  { command: VoiceCommands.NEXT, patterns: [/다음/, /next/i, /넘어가/] },
  { command: VoiceCommands.REPEAT, patterns: [/다시/, /repeat/i] },
  { command: VoiceCommands.STOP, patterns: [/종료/, /그만/, /stop/i] },
  { command: VoiceCommands.START, patterns: [/시작/, /start/i] },
  { command: VoiceCommands.EXPLAIN, patterns: [/설명/, /explain/i] },
];

export function normalizeTranscript(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectVoiceCommand(text) {
  const input = String(text || "");

  for (const candidate of COMMAND_PATTERNS) {
    if (candidate.patterns.some((pattern) => pattern.test(input))) {
      return candidate.command;
    }
  }

  return null;
}

export function clipSpokenFeedback(text, maxLength = 140) {
  const value = String(text || "").trim();

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}…`;
}
