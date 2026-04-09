from typing import Any, TypedDict

from pydantic import BaseModel, Field


class DialogueRequest(BaseModel):
    user_id: str
    session_id: str
    transcript: str
    source_ids: list[str] = Field(default_factory=list)
    exam_mode: bool = False


class RetrievedContext(BaseModel):
    source_id: str
    chunk_id: str
    text: str
    relevance_score: float
    citation_label: str


class DialoguePlan(BaseModel):
    goal: str
    response_style: str
    should_ask_follow_up: bool
    grounding_chunk_ids: list[str]


class DialogueState(TypedDict, total=False):
    user_id: str
    session_id: str
    transcript: str
    source_ids: list[str]
    exam_mode: bool
    learner_profile: dict[str, Any]
    retrieved_contexts: list[RetrievedContext]
    dialogue_plan: DialoguePlan
    agent_response_text: str
    follow_up_question: str | None
    saved_turn: bool
    turn_summary: dict[str, Any]
