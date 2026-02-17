# backend/models/appointment.py

from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.core.database import Base


class Appointment(Base):
    __tablename__ = "appointments"

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

    # ------------------------------------------------------------------
    # Doctor (Department comes from doctors table)
    # ------------------------------------------------------------------
    doctor_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("doctors.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ------------------------------------------------------------------
    # Scheduling
    # ------------------------------------------------------------------
    scheduled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )

    actual_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # ------------------------------------------------------------------
    # Appointment Details
    # ------------------------------------------------------------------
    appointment_type: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="NEW",
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="scheduled",  # scheduled | checked_in | completed | cancelled
        index=True,
    )

    reason: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True,
    )

    notes: Mapped[str | None] = mapped_column(
        String(300),
        nullable=True,
    )

    # ------------------------------------------------------------------
    # AI & Queue Metrics
    # ------------------------------------------------------------------
    estimated_wait_time: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    ai_decision_id: Mapped[str | None] = mapped_column(
        String(64),
        nullable=True,
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
