class PastExamRepository:
    """Boundary for stored past exams and answer patterns."""

    def list_exam_context(self, user_id: str, source_ids: list[str] | None = None) -> list[dict]:
        return [
            {
                "exam_id": "exam_1",
                "source_ids": source_ids or [],
                "summary": "Placeholder past exam context.",
            }
        ]
