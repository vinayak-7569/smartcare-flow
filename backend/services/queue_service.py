# backend/services/queue_service.py

from __future__ import annotations

from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy import select, func, update

from backend.models.queue import QueueItem
from backend.core.logger import get_logger

logger = get_logger(__name__)

# Queue statuses
STATUS_WAITING = "WAITING"
STATUS_IN_PROGRESS = "IN_PROGRESS"
STATUS_COMPLETED = "COMPLETED"


# ------------------------------------------------------------------
# Read
# ------------------------------------------------------------------
def list_queue(
    db: Session,
    doctor_id: Optional[str] = None,
    only_waiting: bool = True,
) -> List[QueueItem]:
    stmt = select(QueueItem)

    if doctor_id:
        stmt = stmt.where(QueueItem.doctor_id == doctor_id)

    if only_waiting:
        stmt = stmt.where(QueueItem.status == STATUS_WAITING)

    stmt = stmt.order_by(
        QueueItem.priority.desc(),   # Higher priority first (5 > 4 > 3 > 1)
        QueueItem.position.asc(),    # FIFO inside same priority
        QueueItem.id.asc(),
    )

    return db.execute(stmt).scalars().all()


# ------------------------------------------------------------------
# Enqueue (PRIORITY SAFE)
# ------------------------------------------------------------------
def enqueue(
    db: Session,
    source_type: str,
    source_id: int,
    doctor_id: Optional[str] = None,
    priority: int = 3,
) -> QueueItem:
    """
    Adds an item to queue.

    Priority:
    - 5 = CRITICAL
    - 4 = HIGH
    - 3 = NORMAL
    - 1 = LOW
    """

    # Only count WAITING items for clean queue positions
    max_pos = db.execute(
        select(func.max(QueueItem.position)).where(
            QueueItem.doctor_id == doctor_id,
            QueueItem.status == STATUS_WAITING,
        )
    ).scalar()

    position = int(max_pos or 0) + 1

    item = QueueItem(
        source_type=source_type,
        source_id=source_id,
        doctor_id=doctor_id,
        priority=int(priority) if priority is not None else 3,
        position=position,
        status=STATUS_WAITING,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    logger.info(
        f"Enqueued | Type={source_type} | Source={source_id} | "
        f"Doctor={doctor_id} | Priority={item.priority} | Pos={item.position}"
    )

    return item


# ------------------------------------------------------------------
# Start Processing
# ------------------------------------------------------------------
def mark_in_progress(db: Session, queue_item_id: int) -> Optional[QueueItem]:
    item = db.get(QueueItem, queue_item_id)
    if not item:
        return None

    item.status = STATUS_IN_PROGRESS
    db.commit()
    db.refresh(item)
    return item


# ------------------------------------------------------------------
# Complete / Exit Queue
# ------------------------------------------------------------------
def complete_item(db: Session, queue_item_id: int) -> Optional[QueueItem]:
    item = db.get(QueueItem, queue_item_id)
    if not item:
        return None

    item.status = STATUS_COMPLETED
    db.commit()
    db.refresh(item)
    return item


# ------------------------------------------------------------------
# Emergency Jump (CRITICAL)
# ------------------------------------------------------------------
def emergency_jump(
    db: Session,
    source_type: str,
    source_id: int,
    doctor_id: Optional[str] = None,
) -> QueueItem:
    """
    Force emergency to top of queue.
    ✅ Moves all WAITING items down by +1 position.
    ✅ Inserts CRITICAL item at position=0
    """

    # Shift waiting items down (only for same doctor queue)
    db.execute(
        update(QueueItem)
        .where(
            QueueItem.doctor_id == doctor_id,
            QueueItem.status == STATUS_WAITING,
        )
        .values(position=QueueItem.position + 1)
    )

    item = QueueItem(
        source_type=source_type,
        source_id=source_id,
        doctor_id=doctor_id,
        priority=5,
        position=0,
        status=STATUS_WAITING,
    )

    db.add(item)
    db.commit()
    db.refresh(item)

    logger.warning(f"EMERGENCY JUMP | Source={source_id} | Doctor={doctor_id}")

    return item
