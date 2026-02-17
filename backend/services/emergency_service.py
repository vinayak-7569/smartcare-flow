from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.models.emergency import EmergencyCase
from backend.services.doctor_service import DoctorService
from backend.core.logger import get_logger

logger = get_logger(__name__)
doctor_service = DoctorService()

# -------------------------------------------------
# Triage → Priority mapping (CRITICAL FEATURE)
# -------------------------------------------------
TRIAGE_PRIORITY_MAP = {
    "CRITICAL": 5,
    "URGENT": 4,
    "NON_URGENT": 2,
}

EXIT_STATUSES = {"CLOSED"}


# -------------------------------------------------
# Read
# -------------------------------------------------
def list_emergencies(db: Session) -> List[EmergencyCase]:
    return (
        db.execute(
            select(EmergencyCase)
            .order_by(
                EmergencyCase.priority.desc(),
                EmergencyCase.id.desc(),
            )
        )
        .scalars()
        .all()
    )


# -------------------------------------------------
# Create (QUEUE-AWARE)
# -------------------------------------------------
def create_emergency(db: Session, payload: dict) -> EmergencyCase:
    triage = payload.get("triage_level", "URGENT").upper()
    priority = TRIAGE_PRIORITY_MAP.get(triage, 3)

    emergency = EmergencyCase(
        patient_name=payload["patient_name"],
        patient_phone=payload.get("patient_phone"),
        symptoms=payload.get("symptoms"),
        triage_level=triage,
        priority=priority,
        assigned_doctor_id=payload.get("assigned_doctor_id"),
        status=payload.get("status", "OPEN"),
    )

    db.add(emergency)

    # 🔥 Emergency occupies doctor immediately
    if emergency.assigned_doctor_id:
        doctor_service.update_queue_length(
            db=db,
            doctor_id=emergency.assigned_doctor_id,
            increment=1,
        )
        logger.info(
            f"Emergency assigned | Doctor={emergency.assigned_doctor_id}"
        )

    db.commit()
    db.refresh(emergency)
    return emergency


# -------------------------------------------------
# Update Status (QUEUE SAFE)
# -------------------------------------------------
def update_status(
    db: Session,
    emergency_id: int,
    new_status: str,
) -> Optional[EmergencyCase]:

    emergency = db.get(EmergencyCase, emergency_id)
    if not emergency:
        return None

    old_status = emergency.status
    emergency.status = new_status.upper()

    # 🔥 Release doctor when emergency closes
    if (
        emergency.assigned_doctor_id
        and old_status not in EXIT_STATUSES
        and emergency.status in EXIT_STATUSES
    ):
        doctor_service.update_queue_length(
            db=db,
            doctor_id=emergency.assigned_doctor_id,
            increment=-1,
        )
        logger.info(
            f"Emergency closed | Doctor queue decremented | Doctor={emergency.assigned_doctor_id}"
        )

    db.commit()
    db.refresh(emergency)
    return emergency
