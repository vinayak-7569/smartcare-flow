# backend/routes/appointments.py

from datetime import date, datetime, time
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.ai_agent.agent import ai_agent
from backend.core.database import get_db
from backend.core.logger import get_logger
from backend.models.appointment import Appointment
from backend.services.doctor_service import DoctorService
from backend.services.appointment_service import (
    create_appointment,
    update_status,
)

router = APIRouter()
logger = get_logger(__name__)
doctor_service = DoctorService()


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------
def _parse_scheduled_at(preferred_date: str, preferred_time: Optional[str]) -> datetime:
    try:
        d = date.fromisoformat(preferred_date)
        t = time.fromisoformat(preferred_time) if preferred_time else time(9, 0)
        return datetime.combine(d, t)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date/time format: {e}")


def _to_dict(appt: Appointment) -> Dict[str, Any]:
    return {
        "id": appt.id,
        "patient_name": appt.patient_name,
        "patient_phone": appt.patient_phone,
        "doctor_id": appt.doctor_id,
        "scheduled_at": appt.scheduled_at.isoformat(),
        "appointment_type": appt.appointment_type,
        "status": appt.status,
        "ai_decision_id": appt.ai_decision_id,
        "estimated_wait_time": appt.estimated_wait_time,
        "notes": appt.notes,
    }


# ------------------------------------------------------------------
# Request Models  (DEPARTMENT REMOVED ON PURPOSE)
# ------------------------------------------------------------------
class AppointmentBookingRequest(BaseModel):
    patient_name: str
    patient_phone: str
    doctor_id: str                 # ← REQUIRED
    preferred_date: str
    preferred_time: Optional[str] = None
    appointment_type: str = "NEW"
    notes: Optional[str] = None


class AppointmentStatusUpdateRequest(BaseModel):
    status: str


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------
@router.post("/book")
async def book_appointment(
    request: AppointmentBookingRequest,
    db: Session = Depends(get_db),
):
    try:
        # ----------------------------------------------------------
        # 1) GET DEPARTMENT FROM DOCTOR (SINGLE SOURCE OF TRUTH)
        #    Use the correct DoctorService method (get_doctor_by_id)
        # ----------------------------------------------------------
        doctor = doctor_service.get_doctor_by_id(db, request.doctor_id)

        if not doctor:
            raise HTTPException(status_code=400, detail="Invalid doctor_id")

        # doctor_service returns a dict, so use key access
        department = doctor["department"]   # ← ONLY SOURCE

        scheduled_at = _parse_scheduled_at(
            request.preferred_date,
            request.preferred_time,
        )

        # ---------------- AI SAFE CALL ----------------
        try:
            ai_decision = ai_agent.process_appointment(
                patient_data={
                    "name": request.patient_name,
                    "phone": request.patient_phone,
                },
                department=department,
                preferred_time=request.preferred_time,
            )
        except Exception as ai_err:
            logger.warning(f"AI fallback triggered: {ai_err}")
            ai_decision = {
                "doctor_id": request.doctor_id,
                "status": "SCHEDULED",
                "estimated_wait_time": None,
                "ai_decision_id": None,
                "ai_optimized": False,
                "recommendation": "Manual scheduling",
            }

        payload = {
            "patient_name": request.patient_name,
            "patient_phone": request.patient_phone,
            "doctor_id": request.doctor_id,
            "scheduled_at": scheduled_at,
            "appointment_type": request.appointment_type.upper(),
            "status": ai_decision.get("status", "SCHEDULED").upper(),
            "ai_decision_id": ai_decision.get("ai_decision_id"),
            "estimated_wait_time": ai_decision.get("estimated_wait_time"),
            "notes": request.notes,
        }

        appt = create_appointment(db, payload)

        # Queue increment ONLY after appointment exists
        if appt.doctor_id:
            doctor_service.update_queue_length(
                db=db,
                doctor_id=appt.doctor_id,
                increment=1,
            )

        db.commit()
        db.refresh(appt)

        logger.info(f"Appointment booked | ID={appt.id}")

        return {
            "success": True,
            "appointment": _to_dict(appt),
            "ai_optimized": ai_decision.get("ai_optimized", False),
            "ai_recommendation": ai_decision.get("recommendation"),
        }

    except HTTPException:
        raise
    except Exception:
        logger.exception("Appointment booking failed")
        raise HTTPException(status_code=500, detail="Appointment booking failed")


@router.patch("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: int,
    request: AppointmentStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    appt = update_status(
        db=db,
        appointment_id=appointment_id,
        new_status=request.status.upper(),
    )

    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.commit()
    db.refresh(appt)

    return {"success": True, "appointment": _to_dict(appt)}


@router.get("/")
async def list_appointments(
    date: Optional[str] = None,
    department: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
):
    q = db.query(Appointment)

    if status:
        q = q.filter(Appointment.status == status.upper())

    if date:
        d = date.fromisoformat(date)
        q = q.filter(
            Appointment.scheduled_at >= datetime.combine(d, time.min),
            Appointment.scheduled_at <= datetime.combine(d, time.max),
        )

    return {
        "success": True,
        "appointments": [_to_dict(a) for a in q.order_by(Appointment.id.desc()).all()],
    }


@router.get("/{appointment_id}")
async def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
):
    appt = db.get(Appointment, appointment_id)
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")

    return {"success": True, "appointment": _to_dict(appt)}
