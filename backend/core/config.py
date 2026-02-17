# backend/core/settings.py
from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Union

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Server
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True
    RELOAD: bool = True

    # Database
    DATABASE_URL: str = "sqlite:///./data/smartcare.db"

    # CORS
    # - Keep both names for back-compat across your codebase
    # - Use default_factory to avoid mutable default list pitfalls
    ALLOWED_ORIGINS: Union[List[str], str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
        ]
    )
    CORS_ALLOW_ORIGINS: Union[List[str], str] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8080",
            "http://127.0.0.1:8080",
        ]
    )

    # Domain constants
    DEPARTMENTS: List[str] = ["CARDIOLOGY", "DENTAL", "DERMATOLOGY", "GENERAL", "ORTHO"]

    STATUS_AVAILABLE: str = "AVAILABLE"
    STATUS_ON_LEAVE: str = "ON_LEAVE"

    # Appointment types
    APPOINTMENT_NEW: str = "NEW"
    APPOINTMENT_FOLLOWUP: str = "FOLLOWUP"

    # Priority levels
    PRIORITY_NORMAL: str = "NORMAL"
    PRIORITY_HIGH: str = "HIGH"
    PRIORITY_CRITICAL: str = "CRITICAL"

    # Queue thresholds
    QUEUE_THRESHOLD_MEDIUM: int = 5
    QUEUE_THRESHOLD_HIGH: int = 10

    @staticmethod
    def get_current_timestamp() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def calculate_estimated_wait_time(queue_position: int) -> int:
        # minutes; tweak as needed
        avg_minutes_per_patient = 10
        return max(0, int(queue_position) * avg_minutes_per_patient)

    @staticmethod
    def calculate_workload_status(queue_length: int) -> str:
        # NOTE: don't instantiate Settings() here (it re-reads env each call).
        # Use class defaults for thresholds.
        if queue_length >= Settings.QUEUE_THRESHOLD_HIGH:
            return "OVERLOADED"
        if queue_length >= Settings.QUEUE_THRESHOLD_MEDIUM:
            return "BUSY"
        return "AVAILABLE"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()


def _normalize_origins(value: Union[List[str], str]) -> List[str]:
    if isinstance(value, list):
        return [str(s).strip() for s in value if str(s).strip()]
    # Allow comma-separated env var
    return [s.strip() for s in str(value).split(",") if s.strip()]


# Normalize both, then ensure ALLOWED_ORIGINS is always present & in sync
settings.CORS_ALLOW_ORIGINS = _normalize_origins(settings.CORS_ALLOW_ORIGINS)
settings.ALLOWED_ORIGINS = _normalize_origins(settings.ALLOWED_ORIGINS)

# If one is empty but the other has values, sync them
if not settings.ALLOWED_ORIGINS and settings.CORS_ALLOW_ORIGINS:
    settings.ALLOWED_ORIGINS = list(settings.CORS_ALLOW_ORIGINS)
if not settings.CORS_ALLOW_ORIGINS and settings.ALLOWED_ORIGINS:
    settings.CORS_ALLOW_ORIGINS = list(settings.ALLOWED_ORIGINS)
