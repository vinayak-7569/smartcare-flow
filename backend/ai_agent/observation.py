# backend/ai_agent/observation.py
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from pydantic import BaseModel, Field, ConfigDict


class Observation(BaseModel):
    """
    Structured observation the decision engine consumes.
    Keep vitals strict, allow extensibility via **extra**.
    """
    model_config = ConfigDict(extra="forbid")

    patient_id: str = Field(..., min_length=1)
    observed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    age: Optional[int] = Field(default=None, ge=0, le=130)

    heart_rate: Optional[int] = Field(default=None, ge=0, le=300)  # bpm
    respiratory_rate: Optional[int] = Field(default=None, ge=0, le=120)  # breaths/min
    systolic_bp: Optional[int] = Field(default=None, ge=0, le=300)  # mmHg
    diastolic_bp: Optional[int] = Field(default=None, ge=0, le=200)  # mmHg
    spo2: Optional[int] = Field(default=None, ge=0, le=100)  # %
    temperature_c: Optional[float] = Field(default=None, ge=25, le=45)

    symptoms_text: Optional[str] = Field(default=None, max_length=2000)

    extra: Dict[str, Any] = Field(default_factory=dict)
