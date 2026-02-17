# backend/ai_agent/recommendations.py
from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Literal

from pydantic import BaseModel, Field, ConfigDict

Priority = Literal["low", "medium", "high", "critical"]


class Recommendation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = Field(..., min_length=1)
    title: str = Field(..., min_length=1)
    message: str = Field(..., min_length=1)

    priority: Priority = "medium"
    actions: List[str] = Field(default_factory=list)
    confidence: float = Field(default=0.7, ge=0.0, le=1.0)

    triggered_by: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class DecisionResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    decision_id: str = Field(..., min_length=8)
    patient_id: str
    created_at: datetime

    priority: Priority
    score: int = Field(..., ge=0)

    recommendations: List[Recommendation] = Field(default_factory=list)
    reasons: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)

    triggered_rules: List[str] = Field(default_factory=list)

    version: str = "2.0.0"
    meta: Dict[str, str] = Field(default_factory=dict)
