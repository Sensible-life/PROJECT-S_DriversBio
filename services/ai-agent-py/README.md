# AI Agent Service (Python)

LangChain Python + LangGraph based AI agent service for DriveAI.

## Purpose

This service owns the agentic parts of the product while the Node API remains the app-facing backend.

- `services/api`: app-facing HTTP API and session orchestration
- `services/ai-agent-py`: AI agent execution, retrieval, planning, structured outputs

The Flutter app should never call LangChain directly. It calls the Node API, and the Node API calls this service.

## Initial capabilities

1. Ingest lecture notes or book content and mark important concepts, especially emphasis such as bolded or highlighted text.
2. Run voice-oriented tutoring conversations using stored study data and past exams when available.
3. Create quiz notifications for random moments during the day.
4. Generate exam-style example questions.

## Folder structure

```text
services/ai-agent-py/
  pyproject.toml
  .env.example
  README.md
  src/driveai_agent/
    app.py
    config.py
    dependencies.py
    graphs/
      ingestion_graph.py
      dialogue_graph.py
      notification_graph.py
      exam_graph.py
    nodes/
      ingestion.py
      dialogue.py
      notification.py
      exam.py
    prompts/
      ingestion.py
      dialogue.py
      notification.py
      exam.py
    schemas/
      common.py
      ingestion.py
      dialogue.py
      notification.py
      exam.py
    tools/
      repositories.py
      notifications.py
      past_exams.py
      retrievers.py
  tests/
    test_graph_builders.py
```

## Graph design

### 1. Ingestion graph

Goal: turn uploaded notes/books into structured study data.

Nodes:
- `normalize_source`
- `extract_emphasis_signals`
- `segment_document`
- `rank_study_points`
- `persist_source_artifacts`

Outputs:
- source metadata
- chunk records
- emphasis spans
- ranked study points

### 2. Dialogue graph

Goal: support spoken tutoring with retrieval grounded in stored data and past exams.

Nodes:
- `load_learner_context`
- `retrieve_study_context`
- `plan_tutor_turn`
- `respond_to_user`
- `save_dialogue_turn`

Outputs:
- response text for TTS
- citations / grounding chunks
- follow-up question
- memory updates

### 3. Notification graph

Goal: generate short quiz prompts and decide whether a push should be sent.

Nodes:
- `load_notification_context`
- `choose_quiz_candidate`
- `draft_notification_quiz`
- `decide_delivery_window`
- `queue_notification`

Outputs:
- notification payload
- quiz item
- scheduled delivery window

### 4. Exam generation graph

Goal: create realistic exam-style questions from notes, stored data, and past exams.

Nodes:
- `load_exam_context`
- `build_exam_blueprint`
- `generate_exam_items`
- `validate_exam_items`
- `persist_exam_set`

Outputs:
- exam set
- item rationale
- source grounding

## Design rules

- Keep agent outputs structured with Pydantic models.
- Keep persistence and side effects in tool/repository layers.
- Use LangGraph for orchestration and recovery.
- Use deterministic code for validation, scheduling, and DB writes.
- Use agent reasoning for ranking, tutoring, and question generation.

## Next implementation order

1. Implement repository interfaces and DB models.
2. Wire one real graph first: `dialogue_graph`.
3. Add FastAPI endpoints for the Node service to call.
4. Add LangSmith tracing and evaluation.
