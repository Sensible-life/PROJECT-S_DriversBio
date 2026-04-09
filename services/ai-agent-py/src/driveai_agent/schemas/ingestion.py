from typing import Any, TypedDict

from pydantic import BaseModel, Field


class IngestionRequest(BaseModel):
    user_id: str
    source_id: str | None = None
    source_title: str
    source_kind: str = "markdown"
    source_text: str
    professor_priority_notes: list[str] = Field(default_factory=list)


class EmphasisSpan(BaseModel):
    label: str
    signal_type: str
    text: str
    weight: float = Field(ge=0.0, le=1.0)


class StudyChunk(BaseModel):
    chunk_id: str
    heading: str
    body: str


class RankedStudyPoint(BaseModel):
    point_id: str
    title: str
    rationale: str
    priority_score: float = Field(ge=0.0, le=1.0)
    source_chunk_ids: list[str]


class IngestionState(TypedDict, total=False):
    user_id: str
    source_id: str | None
    source_title: str
    source_kind: str
    source_text: str
    professor_priority_notes: list[str]
    normalized_text: str
    emphasis_spans: list[EmphasisSpan]
    chunks: list[StudyChunk]
    ranked_points: list[RankedStudyPoint]
    persisted: bool
    persistence_summary: dict[str, Any]
