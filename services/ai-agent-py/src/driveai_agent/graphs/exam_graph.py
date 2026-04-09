from langgraph.graph import END, START, StateGraph

from ..nodes.exam import (
    build_exam_blueprint,
    generate_exam_items,
    load_exam_context,
    persist_exam_set,
    validate_exam_items,
)
from ..schemas.exam import ExamGenerationState


def build_exam_graph():
    graph = StateGraph(ExamGenerationState)
    graph.add_node("load_exam_context", load_exam_context)
    graph.add_node("build_exam_blueprint", build_exam_blueprint)
    graph.add_node("generate_exam_items", generate_exam_items)
    graph.add_node("validate_exam_items", validate_exam_items)
    graph.add_node("persist_exam_set", persist_exam_set)

    graph.add_edge(START, "load_exam_context")
    graph.add_edge("load_exam_context", "build_exam_blueprint")
    graph.add_edge("build_exam_blueprint", "generate_exam_items")
    graph.add_edge("generate_exam_items", "validate_exam_items")
    graph.add_edge("validate_exam_items", "persist_exam_set")
    graph.add_edge("persist_exam_set", END)
    return graph.compile()
