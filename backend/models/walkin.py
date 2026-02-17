# backend/models/walkin.py

from datetime import datetime

from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.core.database import Base


class WalkIn(Base):
    __tablename__ = "walkins"

    # ------------------------------------------------------------------
    # Primary Key
    # ------------------------------------------------------------------
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ------------------------------------------------------------------
    # Patient Info
    # ------------------------------------------------------------------
    patient_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    patient_phone: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )

    reason: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True,
    )

    # ------------------------------------------------------------------
    # Doctor & Queue
    # ------------------------------------------------------------------
    assigned_doctor_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("doctors.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Priority (integer):
    # 5 = CRITICAL, 4 = HIGH, 3 = NORMAL, 1 = LOW
    priority: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=3,  # NORMAL
        index=True,
    )

    # WAITING | IN_PROGRESS | COMPLETED | CANCELLED
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="WAITING",
        index=True,
    )

    # ------------------------------------------------------------------
    # Timestamps
    # ------------------------------------------------------------------
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
