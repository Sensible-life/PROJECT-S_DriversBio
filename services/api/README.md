# API Service

## Purpose

Core backend service that exposes study-source and session APIs.

## Responsibilities

- Persist study sources and sessions
- Normalize content
- Call worker jobs for chunking and quiz generation
- Evaluate answers through the provider layer
- Return concise spoken feedback payloads

## Suggested initial modules

- `sources`
- `sessions`
- `evaluation`
- `providers`
- `weak-points`

