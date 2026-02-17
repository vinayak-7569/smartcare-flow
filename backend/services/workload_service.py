# backend/services/workload_service.py
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from backend.models.doctor import Doctor
from backend.models.appointment import Appointment
from backend.models.walkin import WalkIn
from backend.models.emergency import EmergencyCase


def workload_summary(db: Session):
    # Minimal but useful: counts per module and doctor availability
    doctor_total = db.execute(select(func.count(Doctor.id))).scalar() or 0
    doctor_available = db.execute(select(func.count(Doctor.id)).where(Doctor.is_available.is_(True))).scalar() or 0

    appt_open = db.execute(select(func.count(Appointment.id)).where(Appointment.status.in_(["scheduled", "checked_in"]))).scalar() or 0
    walkin_waiting = 
