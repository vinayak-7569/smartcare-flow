from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column

from backend.core.database import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        index=True
    )  # UUID

    name: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    specialization: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        default="General"
    )

    department: Mapped[str] = mapped_column(
        String(120),
        nullable=False
    )

    shift_start: Mapped[str] = mapped_column(
        String(16),
        nullable=False
    )

    shift_end: Mapped[str] = mapped_column(
        String(16),
        nullable=False
    )

    status: Mapped[str] = mapped_column(
        String(32),
        nullable=False
    )

    is_available: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True
    )

    current_queue_length: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
