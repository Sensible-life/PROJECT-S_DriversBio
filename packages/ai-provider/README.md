# AI Provider Package

## Purpose

Provider abstraction so OpenAI and Gemini can be swapped without changing session logic.

## Interface direction

- `generateQuiz`
- `evaluateAnswer`
- `fillExplanationGap`
- `checkTruth`

## Notes

The API service should depend on interfaces here, not vendor-specific SDK calls spread across the codebase.

