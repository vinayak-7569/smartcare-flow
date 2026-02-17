# backend/services/walkin_service.py

from typing import Optional, Any

from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.models.walkin import WalkIn
from backend.services.doctor_service import DoctorService
from backend.core.logger import get_logger

logger = get_logger(__name__)
doctor_service = DoctorService()

# Walk-in statuses that REMOVE patient from queue
QUEUE_EXIT_STATUSES = {"COMPLETED", "CANCELLED"}


# ------------------------------------------------------------------
# Priority Helper (STORE ONLY INT IN DB)
# ------------------------------------------------------------------
def normalize_priority_to_int(value: Any) -> int:
    """
    Convert incoming priority to integer.
    Supports:
      - "critical" | "high" | "normal" | "low"
      - 5 | 4 | 3 | 1
    DB stores:
      5 = CRITICAL
      4 = HIGH
      3 = NORMAL
      1 = LOW
    """
    if value is None:
        return 3

    if isinstance(value, int):
        if value in (1, 3, 4, 5):
            return value
        return 3

    s = str(value).strip().lower()

    if s in ("critical", "crit", "emergency", "p0"):
        return 5
    if s in ("high", "urgent", "p1"):
        return 4
    if s in ("normal", "medium", "routine", "p2"):
        return 3
    if s in ("low", "p3"):
        return 1

    return 3


# ------------------------------------------------------------------
# Read
# ------------------------------------------------------------------
def list_walkins(db: Session):
    return (
        db.execute(select(WalkIn).order_by(WalkIn.created_at.desc()))
        .scalars()
        .all()
    )


# ------------------------------------------------------------------
# Create
# ------------------------------------------------------------------
def create_walkin(db: Session, payload: dict) -> WalkIn:
    if not payload.get("patient_name"):
        raise ValueError("patient_name is required")

    # ✅ FIX: always store integer priority
    priority_int = normalize_priority_to_int(payload.get("priority"))

    w = WalkIn(
        patient_name=payload["patient_name"],
        patient_phone=payload.get("patient_phone"),
        reason=payload.get("reason"),
        assigned_doctor_id=payload.get("assigned_doctor_id"),
        priority=priority_int,
        status="WAITING",
    )

    db.add(w)
    db.commit()
    db.refresh(w)

    logger.info(
        f"Walk-in created | ID={w.id} | Doctor={w.assigned_doctor_id} | Priority={w.priority}"
    )

    return w


# ------------------------------------------------------------------
# Update Status (QUEUE SAFE)
# ------------------------------------------------------------------
def update_status(
    db: Session,
    walkin_id: int,
    new_status: str,
) -> Optional[WalkIn]:

    w = db.get(WalkIn, walkin_id)
    if not w:
        return None

    old_status = w.status
    new_status = new_status.strip().upper()

    w.status = new_status

    # ---------------- Queue handling ----------------
    if (
        w.assigned_doctor_id
        and old_status not in QUEUE_EXIT_STATUSES
        and new_status in QUEUE_EXIT_STATUSES
    ):
        doctor_service.update_queue_length(
            db=db,
            doctor_id=w.assigned_doctor_id,
            increment=-1,
        )
        logger.info(
            f"Doctor queue decremented | Doctor={w.assigned_doctor_id} | WalkIn={walkin_id}"
        )

    db.commit()
    db.refresh(w)
    return w
