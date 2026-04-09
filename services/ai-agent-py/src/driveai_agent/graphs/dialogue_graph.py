from langgraph.graph import END, START, StateGraph

from ..nodes.dialogue import (
    load_learner_context,
    plan_tutor_turn,
    respond_to_user,
    retrieve_study_context,
    save_dialogue_turn,
)
from ..schemas.dialogue import DialogueState


def build_dialogue_graph():
    graph = StateGraph(DialogueState)
    graph.add_node("load_learner_context", load_learner_context)
    graph.add_node("retrieve_study_context", retrieve_study_context)
    graph.add_node("plan_tutor_turn", plan_tutor_turn)
    graph.add_node("respond_to_user", respond_to_user)
    graph.add_node("save_dialogue_turn", save_dialogue_turn)

    graph.add_edge(START, "load_learner_context")
    graph.add_edge("load_learner_context", "retrieve_study_context")
    graph.add_edge("retrieve_study_context", "plan_tutor_turn")
    graph.add_edge("plan_tutor_turn", "respond_to_user")
    graph.add_edge("respond_to_user", "save_dialogue_turn")
    graph.add_edge("save_dialogue_turn", END)

    return graph.compile()
