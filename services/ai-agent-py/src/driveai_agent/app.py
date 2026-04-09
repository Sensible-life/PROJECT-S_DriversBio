from fastapi import FastAPI

from .graphs.dialogue_graph import build_dialogue_graph
from .graphs.exam_graph import build_exam_graph
from .graphs.ingestion_graph import build_ingestion_graph
from .graphs.notification_graph import build_notification_graph
from .schemas.dialogue import DialogueRequest
from .schemas.exam import ExamGenerationRequest
from .schemas.ingestion import IngestionRequest
from .schemas.notification import NotificationRequest

app = FastAPI(title="DriveAI AI Agent Service", version="0.1.0")


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": "ai-agent-py"}


@app.post("/agents/ingest")
async def ingest_source(payload: IngestionRequest) -> dict:
    graph = build_ingestion_graph()
    return graph.invoke(payload.model_dump())


@app.post("/agents/dialogue")
async def run_dialogue(payload: DialogueRequest) -> dict:
    graph = build_dialogue_graph()
    return graph.invoke(payload.model_dump())


@app.post("/agents/notifications")
async def create_notification(payload: NotificationRequest) -> dict:
    graph = build_notification_graph()
    return graph.invoke(payload.model_dump())


@app.post("/agents/exams")
async def generate_exam(payload: ExamGenerationRequest) -> dict:
    graph = build_exam_graph()
    return graph.invoke(payload.model_dump())
