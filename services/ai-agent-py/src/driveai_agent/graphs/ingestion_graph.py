from langgraph.graph import END, START, StateGraph

from ..nodes.ingestion import (
    extract_emphasis_signals,
    normalize_source,
    persist_source_artifacts,
    rank_study_points,
    segment_document,
)
from ..schemas.ingestion import IngestionState


def build_ingestion_graph():
    graph = StateGraph(IngestionState)
    graph.add_node("normalize_source", normalize_source)
    graph.add_node("extract_emphasis_signals", extract_emphasis_signals)
    graph.add_node("segment_document", segment_document)
    graph.add_node("rank_study_points", rank_study_points)
    graph.add_node("persist_source_artifacts", persist_source_artifacts)

    graph.add_edge(START, "normalize_source")
    graph.add_edge("normalize_source", "extract_emphasis_signals")
    graph.add_edge("extract_emphasis_signals", "segment_document")
    graph.add_edge("segment_document", "rank_study_points")
    graph.add_edge("rank_study_points", "persist_source_artifacts")
    graph.add_edge("persist_source_artifacts", END)
    return graph.compile()
