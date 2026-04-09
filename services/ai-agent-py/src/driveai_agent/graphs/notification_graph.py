from langgraph.graph import END, START, StateGraph

from ..nodes.notification import (
    choose_quiz_candidate,
    decide_delivery_window,
    draft_notification_quiz,
    load_notification_context,
    queue_notification,
)
from ..schemas.notification import NotificationState


def build_notification_graph():
    graph = StateGraph(NotificationState)
    graph.add_node("load_notification_context", load_notification_context)
    graph.add_node("choose_quiz_candidate", choose_quiz_candidate)
    graph.add_node("draft_notification_quiz", draft_notification_quiz)
    graph.add_node("decide_delivery_window", decide_delivery_window)
    graph.add_node("queue_notification", queue_notification)

    graph.add_edge(START, "load_notification_context")
    graph.add_edge("load_notification_context", "choose_quiz_candidate")
    graph.add_edge("choose_quiz_candidate", "draft_notification_quiz")
    graph.add_edge("draft_notification_quiz", "decide_delivery_window")
    graph.add_edge("decide_delivery_window", "queue_notification")
    graph.add_edge("queue_notification", END)
    return graph.compile()
