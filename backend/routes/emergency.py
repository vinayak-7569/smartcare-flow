# backend/routes/emergency.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.core.database import get_db
from backend.core.logger import get_logger
from backend.models.walkin import WalkIn
from backend.services.emergency_service import (
    list_emergencies,
    create_emergency,
    update_status,
)
from backend.utils.response_utils import ok, fail
from backend.utils.validators import not_empty

router = APIRouter()
logger = get_logger(__name__)


# -------------------------------------------------
# GET: List emergencies (raw list)
# Final URL: GET /api/emergency/
# -------------------------------------------------
@router.get("/")
def get_emergencies(db: Session = Depends(get_db)):
    cases = list_emergencies(db)

    data = [
        {
            "id": e.id,
            "patient_name": getattr(e, "patient_name", None),
            "patient_phone": getattr(e, "patient_phone", None),
            "triage_level": getattr(e, "triage_level", None),
            "priority": getattr(e, "priority", None),
            "symptoms": getattr(e, "symptoms", None),
            "department": getattr(e, "department", None),
            "assigned_doctor_id": getattr(e, "assigned_doctor_id", None),
            "status": getattr(e, "status", None),
            "created_at": e.created_at.isoformat() if getattr(e, "created_at", None) else None,
        }
        for e in cases
    ]

    return ok(data)


# -------------------------------------------------
# GET: Emergency Queue (frontend-friendly view)
# Final URL: GET /api/emergency/queue
#
# ✅ Includes:
#   1) real emergency cases
#   2) CRITICAL walk-ins (priority=5)
# -------------------------------------------------
@router.get("/queue")
def get_emergency_queue(db: Session = Depends(get_db)):
    # -------------------------
    # 1) Emergency Cases
    # -------------------------
    cases = list_emergencies(db)

    active_emergencies = [
        e
        for e in cases
        if str(getattr(e, "status", "")).strip().lower()
        in ("open", "active", "waiting", "")
    ]

    emergency_payload = [
        {
            "id": f"emergency-{e.id}",
            "patient_name": getattr(e, "patient_name", "Emergency Patient"),
            "department": getattr(e, "department", "Emergency"),
            "arrival_time": (
                e.created_at.strftime("%H:%M") if getattr(e, "created_at", None) else "—"
            ),
            "assigned_doctor": getattr(e, "assigned_doctor_id", None),
            "priority": "critical",
            "source": "emergency",
        }
        for e in active_emergencies
    ]

    # -------------------------
    # 2) Critical Walk-ins
    # -------------------------
    critical_walkins = (
        db.execute(
            select(WalkIn)
            .where(WalkIn.status == "WAITING")
            .where(WalkIn.priority >= 5)
            .order_by(WalkIn.created_at.desc())
        )
        .scalars()
        .all()
    )

    walkin_payload = [
        {
            "id": f"walkin-{w.id}",
            "patient_name": w.patient_name,
            "department": getattr(w, "department", None) or "General",
            "arrival_time": (
                w.created_at.strftime("%H:%M") if getattr(w, "created_at", None) else "—"
            ),
            "assigned_doctor": w.assigned_doctor_id,
            "priority": "critical",
            "source": "walkin",
        }
        for w in critical_walkins
    ]

    # ✅ Merge both
    data = emergency_payload + walkin_payload

    return ok(data)


# -------------------------------------------------
# POST: Create emergency
# Final URL: POST /api/emergency/
# -------------------------------------------------
@router.post("/", status_code=201)
def post_emergency(payload: dict, db: Session = Depends(get_db)):
    try:
        not_empty(payload.get("patient_name"), "patient_name")

        emergency = create_emergency(db, payload)

        logger.info(
            f"Emergency created | ID={emergency.id} | "
            f"Triage={getattr(emergency, 'triage_level', None)}"
        )

        return ok({"id": emergency.id}, message="emergency_created")

    except ValueError as ex:
        return fail(str(ex), 422)
    except Exception:
        logger.exception("Emergency creation failed")
        raise HTTPException(status_code=500, detail="Emergency creation failed")


# -------------------------------------------------
# PATCH: Update emergency status
# Final URL: PATCH /api/emergency/{emergency_id}/status
# -------------------------------------------------
@router.patch("/{emergency_id}/status")
def patch_emergency_status(
    emergency_id: int,
    payload: dict,
    db: Session = Depends(get_db),
):
    status = payload.get("status")
    if not status:
        return fail("status_is_required", 422)

    emergency = update_status(db, emergency_id, status.upper())
    if not emergency:
        return fail("emergency_not_found", 404)

    logger.info(
        f"Emergency status updated | ID={emergency_id} | Status={emergency.status}"
    )

    return ok({"id": emergency.id, "status": emergency.status}, message="emergency_updated")
