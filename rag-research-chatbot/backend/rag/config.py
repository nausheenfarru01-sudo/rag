"""Application settings, read from environment variables (or a local .env file)."""
import os
from dataclasses import dataclass

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "all-MiniLM-L6-v2")
    chunk_size: int = int(os.getenv("CHUNK_SIZE", "300"))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "60"))
    top_k: int = int(os.getenv("TOP_K", "4"))
    max_upload_mb: int = int(os.getenv("MAX_UPLOAD_MB", "20"))


settings = Settings()
