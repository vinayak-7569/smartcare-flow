# backend/routes/queue.py

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.services.queue_service import (
    list_queue,
    mark_in_progress,
    complete_item,
)
from backend.utils.response_utils import ok
from backend.utils.priority_utils import normalize_priority  # ✅ FIX priority

router = APIRouter()


@router.get("/")
def get_queue(
    doctor_id: str | None = None,
    only_waiting: bool = Query(True),
    db: Session = Depends(get_db),
):
    """
    Final URL:
    GET /api/queue/
    """
    items = list_queue(db=db, doctor_id=doctor_id, only_waiting=only_waiting)

    data = [
        {
            "id": q.id,
            "source_type": q.source_type,
            "source_id": q.source_id,
            "doctor_id": q.doctor_id,

            # ✅ Always return integer priority (5,4,3,1)
            "priority": normalize_priority(q.priority),

            "position": q.position,
            "status": q.status,
            "created_at": q.created_at.isoformat() if q.created_at else None,
        }
        for q in items
    ]

    return ok(data)


@router.patch("/{queue_item_id}/start")
def start_queue_item(queue_item_id: int, db: Session = Depends(get_db)):
    item = mark_in_progress(db, queue_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")

    return ok({"id": item.id, "status": item.status})


@router.patch("/{queue_item_id}/complete")
def complete_queue_item(queue_item_id: int, db: Session = Depends(get_db)):
    item = complete_item(db, queue_item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Queue item not found")

    return ok({"id": item.id, "status": item.status})
