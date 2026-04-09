from ..schemas.notification import DeliveryWindow, NotificationQuizDraft, NotificationState


def load_notification_context(state: NotificationState) -> NotificationState:
    return {
        "candidate_topics": state.get("candidate_topics", []),
        "weak_points": state.get("weak_points", []),
    }


def choose_quiz_candidate(state: NotificationState) -> NotificationState:
    topics = state.get("weak_points") or state.get("candidate_topics") or ["핵심 개념"]
    return {"selected_topic": topics[0]}


def draft_notification_quiz(state: NotificationState) -> NotificationState:
    topic = state["selected_topic"]
    return {
        "quiz_draft": NotificationQuizDraft(
            title=f"{topic} 퀵 퀴즈",
            body=f"{topic}를 10초 안에 설명해볼래?",
            answer_hint="정의, 역할, 예시를 떠올려봐.",
        )
    }


def decide_delivery_window(state: NotificationState) -> NotificationState:
    return {
        "delivery_window": DeliveryWindow(
            window_label="random_daytime",
            earliest_hour=10,
            latest_hour=18,
        )
    }


def queue_notification(state: NotificationState) -> NotificationState:
    return {
        "queued": True,
        "queue_result": {
            "title": state["quiz_draft"].title,
            "window": state["delivery_window"].window_label,
        },
    }
