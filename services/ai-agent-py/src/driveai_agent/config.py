from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="", extra="ignore")

    openai_api_key: str | None = None
    langsmith_api_key: str | None = None
    langsmith_tracing: bool = False
    driveai_model: str = "gpt-4.1-mini"
    driveai_embedding_model: str = "text-embedding-3-large"
    driveai_database_url: str = "postgresql+psycopg://user:password@localhost:5432/driveai"
    driveai_node_api_base: str = "http://127.0.0.1:3030"
    driveai_notification_provider: str = "mock"


settings = Settings()
