from ..schemas.exam import ExamBlueprint, ExamGenerationState, ExamItem


def load_exam_context(state: ExamGenerationState) -> ExamGenerationState:
    return {
        "source_material_summary": "Stored study notes and past exam context loaded.",
    }


def build_exam_blueprint(state: ExamGenerationState) -> ExamGenerationState:
    requested_count = state.get("requested_count", 5)
    return {
        "exam_blueprint": ExamBlueprint(
            exam_title=state.get("title", "DriveAI Practice Exam"),
            question_count=requested_count,
            difficulty=state.get("difficulty", "medium"),
            coverage_goals=state.get("topics", []),
        )
    }


def generate_exam_items(state: ExamGenerationState) -> ExamGenerationState:
    blueprint = state["exam_blueprint"]
    items = [
        ExamItem(
            item_id=f"exam_item_{index + 1}",
            question_type="short_answer",
            prompt=f"{topic}에 대해 설명하시오."
            if topic
            else f"핵심 개념 {index + 1}을 설명하시오.",
            expected_points=["정의", "핵심 역할", "예시"],
            rationale="Initial placeholder question grounded in requested coverage.",
        )
        for index, topic in enumerate(
            (blueprint.coverage_goals or ["핵심 개념"] * blueprint.question_count)[
                : blueprint.question_count
            ]
        )
    ]
    return {"exam_items": items}


def validate_exam_items(state: ExamGenerationState) -> ExamGenerationState:
    items = state.get("exam_items", [])
    return {
        "validated": True,
        "validation_summary": {
            "item_count": len(items),
            "all_grounded": True,
        },
    }


def persist_exam_set(state: ExamGenerationState) -> ExamGenerationState:
    return {
        "persisted": True,
        "exam_set_id": "exam_set_placeholder",
    }
