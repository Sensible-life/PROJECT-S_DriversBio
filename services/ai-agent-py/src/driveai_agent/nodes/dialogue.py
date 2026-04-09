from ..schemas.dialogue import DialoguePlan, DialogueState, RetrievedContext


def load_learner_context(state: DialogueState) -> DialogueState:
    return {
        "learner_profile": {
            "user_id": state["user_id"],
            "exam_mode": state.get("exam_mode", False),
        }
    }


def retrieve_study_context(state: DialogueState) -> DialogueState:
    contexts = [
        RetrievedContext(
            source_id="source_1",
            chunk_id="chunk_1",
            text="Retrieved context placeholder from stored study notes.",
            relevance_score=0.72,
            citation_label="Source 1 / Chunk 1",
        )
    ]
    return {"retrieved_contexts": contexts}


def plan_tutor_turn(state: DialogueState) -> DialogueState:
    contexts = state.get("retrieved_contexts", [])
    return {
        "dialogue_plan": DialoguePlan(
            goal="Help the learner answer while grounding the response in saved material.",
            response_style="short_spoken_feedback",
            should_ask_follow_up=True,
            grounding_chunk_ids=[context.chunk_id for context in contexts],
        )
    }


def respond_to_user(state: DialogueState) -> DialogueState:
    plan = state["dialogue_plan"]
    response_text = (
        "핵심 방향은 좋아. 한 가지 빠진 포인트를 먼저 보강해보자."
        if plan.should_ask_follow_up
        else "좋아. 지금 설명은 기준 자료와 잘 맞아."
    )
    return {
        "agent_response_text": response_text,
        "follow_up_question": "이 개념이 왜 중요한지도 짧게 말해볼래?"
        if plan.should_ask_follow_up
        else None,
    }


def save_dialogue_turn(state: DialogueState) -> DialogueState:
    return {
        "saved_turn": True,
        "turn_summary": {
            "response_length": len(state.get("agent_response_text", "")),
            "retrieval_count": len(state.get("retrieved_contexts", [])),
        },
    }
