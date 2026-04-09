# Architecture Notes

## Direction

The system is centered on one product surface:

- `apps/mobile`: Flutter app, the main product surface for driving sessions, study-source management, and results review

Supporting services:

- `services/api`: source ingestion, session APIs, provider orchestration
- `services/worker`: background quiz generation, evaluation jobs, analytics
- `services/ai-agent-py`: LangChain Python + LangGraph service for ingestion, tutoring dialogue, notification quiz generation, and exam generation

Shared packages:

- `packages/ai-provider`: provider abstraction for OpenAI and Gemini
- `packages/audio-core`: shared audio session contracts and helpers
- `packages/session-engine`: quiz flow, scoring flow, weak-point logic
- `packages/shared-types`: DTOs and domain models

## High-level flow

1. User saves a study source.
2. API normalizes and chunks the source.
3. Worker generates quiz candidates and reference answers.
4. Mobile app starts a session and requests the next item.
5. User answers by voice.
6. API evaluates the answer through the provider layer.
7. Session engine computes feedback and spaced follow-up priority.
8. Mobile app speaks concise feedback and proceeds.

## Design constraints

- Audio-first interaction
- Short responses while driving
- Provider-neutral AI layer
- Study content and answer logs must be traceable to source material
- Flutter-first client architecture for Android and iOS delivery
