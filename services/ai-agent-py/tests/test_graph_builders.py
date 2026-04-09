from driveai_agent.graphs.dialogue_graph import build_dialogue_graph
from driveai_agent.graphs.exam_graph import build_exam_graph
from driveai_agent.graphs.ingestion_graph import build_ingestion_graph
from driveai_agent.graphs.notification_graph import build_notification_graph


def test_graph_builders_compile():
    assert build_ingestion_graph() is not None
    assert build_dialogue_graph() is not None
    assert build_notification_graph() is not None
    assert build_exam_graph() is not None
