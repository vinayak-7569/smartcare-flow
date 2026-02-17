# backend/services/appointment_service.py

from typing import Any, Dict, List, Optional

from sqlalchemy.orm import Session

from backend.core.logger import get_logger
from backend.models.appointment import Appointment
from backend.services.doctor_service import DoctorService

logger = get_logger(__name__)
doctor_service = DoctorService()

# Statuses that REMOVE a patient from the queue
QUEUE_EXIT_STATUSES = {"completed", "cancelled", "no_show"}


# -----------------------------------------------------------------------------
# Create
# -----------------------------------------------------------------------------
def create_appointment(db: Session, payload: Dict[str, Any]) -> Appointment:
    """
    Create an appointment ORM row.

    - Does NOT commit (route commits)
    - Flushes so ID is available immediately
    - Queue is NOT touched here
    """
    appt = Appointment(**payload)
    db.add(appt)
    db.flush()
    return appt


# -----------------------------------------------------------------------------
# Read
# -----------------------------------------------------------------------------
def list_appointments(db: Session, limit: int = 200) -> List[Appointment]:
    return (
        db.query(Appointment)
        .order_by(Appointment.id.desc())
        .limit(limit)
        .all()
    )


# -----------------------------------------------------------------------------
# Update Status (CRITICAL – QUEUE SAFE)
# -----------------------------------------------------------------------------
def update_status(
    db: Session,
    appointment_id: int,
    new_status: str,
) -> Optional[Appointment]:
    """
    Update appointment status safely.

    Queue logic:
    - Decrement doctor queue ONLY when moving INTO exit state
    - Prevents double-decrement
    """

    appt = db.get(Appointment, appointment_id)
    if not appt:
        return None

    if not hasattr(appt, "status"):
        raise AttributeError("Appointment model has no 'status' column")

    # Normalize status
    new_status = new_status.lower()
    old_status = (appt.status or "").lower()

    # No-op if status unchanged
    if old_status == new_status:
        logger.info(
            f"Appointment status unchanged | "
            f"Appointment={appointment_id} | Status={new_status}"
        )
        return appt

    appt.status = new_status

    # ---------------- Queue handling ----------------
    if (
        appt.doctor_id
        and old_status not in QUEUE_EXIT_STATUSES
        and new_status in QUEUE_EXIT_STATUSES
    ):
        doctor_service.update_queue_length(
            db=db,
            doctor_id=appt.doctor_id,
            increment=-1,
        )
        logger.info(
            f"Doctor queue decremented | "
            f"Doctor={appt.doctor_id} | Appointment={appointment_id}"
        )

    db.flush()
    return appt
