from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Resume Ranker API"
    environment: str = "development"
    database_url: str = "sqlite:///./resume_ranker.db"
    redis_url: str = "redis://localhost:6379/0"
    sentence_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    max_upload_mb: int = Field(default=20, ge=1, le=100)
    enable_heavy_models: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
