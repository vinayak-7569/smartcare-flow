# backend/models/ai_decision.py
from sqlalchemy import String, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from backend.core.database import Base


class AIDecision(Base):
    __tablename__ = "ai_decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    event_type: Mapped[str] = mapped_column(String(50), nullable=False)  # walkin|emergency|appointment|dashboard
    event_id: Mapped[int] = mapped_column(Integer, nullable=True)

    input_summary: Mapped[str] = mapped_column(String(800), nullable=True)
    recommendation: Mapped[str] = mapped_column(String(1200), nullable=True)
    rationale: Mapped[str] = mapped_column(String(1200), nullable=True)

    confidence: Mapped[int] = mapped_column(Integer, nullable=False, default=70)  # 0-100 heuristic
    created_at: Mapped[str] = mapped_column(DateTime(timezone=True), server_default=func.now())
