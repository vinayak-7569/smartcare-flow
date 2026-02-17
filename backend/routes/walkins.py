# backend/routes/walkins.py

from typing import Optional, Union

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.services.walkin_service import list_walkins, create_walkin, update_status
from backend.services.queue_service import enqueue
from backend.utils.response_utils import ok
from backend.utils.validators import not_empty

router = APIRouter()


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------
def normalize_priority_to_int(value: Union[int, str, None]) -> int:
    """
    Accepts: "normal" | "high" | "critical" OR integer values.
    Stores in DB as integer:
      5 = CRITICAL
      4 = HIGH
      3 = NORMAL
      1 = LOW
    """
    if value is None:
        return 3

    if isinstance(value, (int, float)):
        n = int(value)
        if n >= 5:
            return 5
        if n == 4:
            return 4
        if n == 3:
            return 3
        return 1

    s = str(value).strip().lower()

    if s in ("critical", "crit", "emergency", "p0"):
        return 5
    if s in ("high", "urgent", "p1"):
        return 4
    if s in ("normal", "medium", "routine", "standard", "p2"):
        return 3
    if s in ("low", "p3"):
        return 1

    return 3


# ------------------------------------------------------------------
# Request Models
# ------------------------------------------------------------------
class WalkinCreateRequest(BaseModel):
    patient_name: str
    department: Optional[str] = None
    patient_phone: Optional[str] = None
    reason: Optional[str] = None
    assigned_doctor_id: Optional[str] = None
    priority: Union[int, str, None] = 3


class WalkinStatusUpdateRequest(BaseModel):
    status: str


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------
@router.get("/")
def get_walkins(db: Session = Depends(get_db)):
    items = list_walkins(db)

    data = [
        {
            "id": w.id,
            "patient_name": w.patient_name,
            "patient_phone": w.patient_phone,
            "reason": w.reason,
            "assigned_doctor_id": w.assigned_doctor_id,
            "priority": w.priority,
            "status": w.status,
            "created_at": w.created_at.isoformat() if w.created_at else None,
        }
        for w in items
    ]

    return ok(data)


@router.post("/", status_code=201)
def post_walkin(request: WalkinCreateRequest, db: Session = Depends(get_db)):
    try:
        not_empty(request.patient_name, "patient_name")

        payload = request.model_dump()
        payload["priority"] = normalize_priority_to_int(payload.get("priority"))

        # ✅ create walkin (committed inside service)
        walkin = create_walkin(db, payload)

        # ✅ enqueue (committed inside queue service)
        enqueue(
            db=db,
            source_type="walkin",
            source_id=walkin.id,
            doctor_id=walkin.assigned_doctor_id,
            priority=walkin.priority,
        )

        return ok({"id": walkin.id}, message="walkin_created")

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{walkin_id}/status")
def patch_walkin_status(
    walkin_id: int,
    request: WalkinStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    walkin = update_status(db, walkin_id, request.status)
    if not walkin:
        raise HTTPException(status_code=404, detail="walkin_not_found")

    return ok({"id": walkin.id, "status": walkin.status}, message="walkin_updated")
