# API Design Draft

## Primary resources

- `POST /study-sources`
- `GET /study-sources`
- `GET /study-sources/:id`
- `POST /study-sources/:id/process`
- `POST /sessions`
- `GET /sessions/:id`
- `POST /sessions/:id/answers`
- `GET /weak-points`

## Example entities

### StudySource

```json
{
  "id": "src_123",
  "title": "Operating Systems Chapter 1",
  "kind": "markdown",
  "status": "processed"
}
```

### SessionAnswer

```json
{
  "quizItemId": "quiz_123",
  "transcript": "커널은 하드웨어와 프로그램 사이를 관리합니다.",
  "mode": "voice"
}
```

## Evaluation response shape

```json
{
  "isCorrect": false,
  "score": 0.64,
  "missingPoints": [
    "자원 스케줄링 역할"
  ],
  "incorrectClaims": [
    "커널이 애플리케이션 계층이라고 설명함"
  ],
  "spokenFeedback": "핵심 방향은 맞지만 자원 관리와 스케줄링 설명이 빠졌어."
}
```

## API principles

- Keep mobile payloads small.
- Store raw transcript and normalized transcript separately.
- Return both machine-readable evaluation fields and short spoken feedback.

