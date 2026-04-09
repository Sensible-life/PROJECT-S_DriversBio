from langchain_openai import ChatOpenAI

from .config import settings
from .tools.notifications import NotificationGateway
from .tools.past_exams import PastExamRepository
from .tools.repositories import StudyRepository
from .tools.retrievers import StudyRetriever


def build_chat_model() -> ChatOpenAI:
    return ChatOpenAI(model=settings.driveai_model)


def build_study_repository() -> StudyRepository:
    return StudyRepository()


def build_past_exam_repository() -> PastExamRepository:
    return PastExamRepository()


def build_notification_gateway() -> NotificationGateway:
    return NotificationGateway(provider=settings.driveai_notification_provider)


def build_study_retriever() -> StudyRetriever:
    return StudyRetriever()
