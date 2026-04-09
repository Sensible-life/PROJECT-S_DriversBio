from typing import Any, TypedDict

from pydantic import BaseModel, Field


class NotificationRequest(BaseModel):
    user_id: str
    candidate_topics: list[str] = Field(default_factory=list)
    weak_points: list[str] = Field(default_factory=list)


class NotificationQuizDraft(BaseModel):
    title: str
    body: str
    answer_hint: str | None = None


class DeliveryWindow(BaseModel):
    window_label: str
    earliest_hour: int
    latest_hour: int


class NotificationState(TypedDict, total=False):
    user_id: str
    candidate_topics: list[str]
    weak_points: list[str]
    selected_topic: str
    quiz_draft: NotificationQuizDraft
    delivery_window: DeliveryWindow
    queued: bool
    queue_result: dict[str, Any]
