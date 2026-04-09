from typing import Literal

from pydantic import BaseModel, Field


class SourceReference(BaseModel):
    source_id: str
    chunk_id: str | None = None
    label: str


class AgentStatus(BaseModel):
    status: Literal["ok", "needs_review", "failed"] = "ok"
    message: str | None = None


class UserPrioritySignal(BaseModel):
    label: str
    strength: float = Field(ge=0.0, le=1.0)
