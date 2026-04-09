from typing import Any, Literal, TypedDict

from pydantic import BaseModel, Field


class ExamGenerationRequest(BaseModel):
    user_id: str
    title: str
    topics: list[str] = Field(default_factory=list)
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    requested_count: int = 5


class ExamBlueprint(BaseModel):
    exam_title: str
    question_count: int
    difficulty: str
    coverage_goals: list[str]


class ExamItem(BaseModel):
    item_id: str
    question_type: str
    prompt: str
    expected_points: list[str]
    rationale: str


class ExamGenerationState(TypedDict, total=False):
    user_id: str
    title: str
    topics: list[str]
    difficulty: str
    requested_count: int
    source_material_summary: str
    exam_blueprint: ExamBlueprint
    exam_items: list[ExamItem]
    validated: bool
    validation_summary: dict[str, Any]
    persisted: bool
    exam_set_id: str
