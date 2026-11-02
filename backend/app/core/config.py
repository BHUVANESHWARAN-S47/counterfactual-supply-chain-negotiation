import os
from typing import List, Optional
from pydantic import ConfigDict
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Counterfactual Multi-Agent Supply Chain System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "counterfactual-supply-chain-super-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Database: Default to SQLite for zero-friction local execution; can be set to PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./supply_chain.db")
    
    # Centralized LLM Provider Architecture
    LLM_PRIMARY_PROVIDER: str = os.getenv("LLM_PRIMARY_PROVIDER", "groq")  # "groq" or "ollama"
    LLM_FALLBACK_ENABLED: bool = os.getenv("LLM_FALLBACK_ENABLED", "true").lower() in ("true", "1", "yes")
    LLM_REQUEST_TIMEOUT: float = float(os.getenv("LLM_REQUEST_TIMEOUT", "12.0"))
    
    # Groq Cloud API Models
    GROQ_API_KEY: Optional[str] = os.getenv("GROQ_API_KEY", None)
    GROQ_PRIMARY_MODEL: str = os.getenv("GROQ_PRIMARY_MODEL", "llama-3.3-70b-versatile")
    GROQ_FALLBACK_MODEL: str = os.getenv("GROQ_FALLBACK_MODEL", "llama-3.1-8b-instant")
    
    # Local LLM / Ollama settings
    OLLAMA_BASE_URL: str = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
    OLLAMA_MODEL: str = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
    OLLAMA_FALLBACK_MODEL: str = os.getenv("OLLAMA_FALLBACK_MODEL", "llama3")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "*",
    ]

    model_config = SettingsConfigDict(
        env_file=[
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../.env")),
            os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.env")),
            ".env"
        ],
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

settings = Settings()

