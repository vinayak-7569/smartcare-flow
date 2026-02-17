from datetime import datetime
from sqlalchemy import String, Integer, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.core.database import Base


class QueueItem(Base):
    __tablename__ = "queue_items"

    # ------------------------------------------------------------------
    # Primary Key
    # ------------------------------------------------------------------
    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    # ------------------------------------------------------------------
    # Source Reference
    # ------------------------------------------------------------------
    source_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        index=True,  # appointment | walkin | emergency
    )

    source_id: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    # ------------------------------------------------------------------
    # Doctor Association
    # ------------------------------------------------------------------
    doctor_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("doctors.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # ------------------------------------------------------------------
    # Queue Mechanics
    # ------------------------------------------------------------------
    priority: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=3,  # 5=emergency, 3=normal, 1=low
        index=True,
    )

    position: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="WAITING",  # WAITING | IN_PROGRESS | COMPLETED
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
