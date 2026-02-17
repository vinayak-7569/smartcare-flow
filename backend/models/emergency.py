from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.core.database import Base


class EmergencyCase(Base):
    __tablename__ = "emergency_cases"

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

    symptoms: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    # ------------------------------------------------------------------
    # Emergency Severity
    # ------------------------------------------------------------------
    triage_level: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="URGENT",  # NON_URGENT | URGENT | CRITICAL
        index=True,
    )

    priority: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=5,  # 5=CRITICAL, 4=URGENT, 2=NON_URGENT
        index=True,
    )

    # ------------------------------------------------------------------
    # Doctor Assignment
    # ------------------------------------------------------------------
    assigned_doctor_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("doctors.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ------------------------------------------------------------------
    # Status Lifecycle
    # ------------------------------------------------------------------
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="OPEN",  # OPEN | STABILIZED | CLOSED
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
