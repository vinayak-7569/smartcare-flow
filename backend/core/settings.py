# backend/core/settings.py
from typing import List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="backend/.env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # -----------------------------
    # Server
    # -----------------------------
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    RELOAD: bool = True

    API_PREFIX: str = "/api"
    DATABASE_URL: str = "sqlite:///./data/smartcare.db"

    # -----------------------------
    # CORS
    # -----------------------------
    CORS_ALLOW_ORIGINS: List[str] = Field(
        default_factory=lambda: ["http://localhost:5173"]
    )

    # -----------------------------
    # Doctor / Hospital Config
    # -----------------------------
    DEPARTMENTS: List[str] = Field(default_factory=lambda: [
        "General Medicine",
        "Cardiology",
        "Neurology",
        "Orthopedics",
        "Pediatrics",
        "Dermatology",
        "ENT",
        "Gynecology",
        "Ophthalmology",
        "Psychiatry",
    ])

    STATUS_AVAILABLE: str = "AVAILABLE"
    STATUS_ON_LEAVE: str = "ON_LEAVE"

    # -----------------------------
    # Queue & Workload Logic (🔥 MISSING PART)
    # -----------------------------
    QUEUE_THRESHOLD_LOW: int = 3
    QUEUE_THRESHOLD_MEDIUM: int = 6
    QUEUE_THRESHOLD_HIGH: int = 10

    AVG_CONSULT_TIME_MINUTES: int = 10

    def calculate_workload_status(self, queue_length: int) -> str:
        if queue_length >= self.QUEUE_THRESHOLD_HIGH:
            return "HIGH"
        elif queue_length >= self.QUEUE_THRESHOLD_MEDIUM:
            return "MEDIUM"
        elif queue_length >= self.QUEUE_THRESHOLD_LOW:
            return "LOW"
        return "FREE"

    def calculate_estimated_wait_time(self, queue_length: int) -> int:
        return queue_length * self.AVG_CONSULT_TIME_MINUTES

    # -----------------------------
    # Admin
    # -----------------------------
    ADMIN_API_KEY: str = "change-me"


settings = Settings()


# -----------------------------
# Helpers
# -----------------------------
def parse_origins(value: str) -> List[str]:
    return [x.strip() for x in value.split(",") if x.strip()]


if isinstance(settings.CORS_ALLOW_ORIGINS, str):
    settings.CORS_ALLOW_ORIGINS = parse_origins(settings.CORS_ALLOW_ORIGINS)
