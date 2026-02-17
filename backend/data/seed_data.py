from sqlalchemy.orm import Session
from backend.core.database import SessionLocal, init_db
from backend.models.doctor import Doctor
from backend.models.appointment import Appointment
from backend.models.walkin import WalkIn
from backend.models.emergency import EmergencyCase
from backend.models.ai_decision import AIDecision


def seed(db: Session):
    # Doctors
    if db.query(Doctor).count() == 0:
        docs = [
            Doctor(name="Dr. Asha Menon", specialization="General", department="OPD", is_available=True),
            Doctor(name="Dr. Rahul Verma", specialization="Cardiology", department="Cardio", is_available=True),
            Doctor(name="Dr. Priya Shah", specialization="Pediatrics", department="Pediatrics", is_available=False),
        ]
        db.add_all(docs)
        db.commit()

    doctors = db.query(Doctor).all()
    d1 = doctors[0].id if doctors else None

    # Appointments
    if db.query(Appointment).count() == 0:
        db.add_all(
            [
                Appointment(
                    patient_name="John Doe",
                    patient_phone="9990001111",
                    doctor_id=d1,
                    scheduled_at="2025-12-24T10:00:00Z",
                    reason="Routine checkup",
                    status="scheduled",
                ),
                Appointment(
                    patient_name="Meera Nair",
                    patient_phone="9990002222",
                    doctor_id=d1,
                    scheduled_at="2025-12-24T11:00:00Z",
                    reason="Follow-up",
                    status="checked_in",
                ),
            ]
        )
        db.commit()

    # Walkins
    if db.query(WalkIn).count() == 0:
        db.add_all(
            [
                WalkIn(
                    patient_name="Karan Singh",
                    patient_phone="9990003333",
                    reason="Fever",
                    assigned_doctor_id=d1,
                    priority="normal",
                    status="waiting",
                ),
                WalkIn(
                    patient_name="Anita Roy",
                    patient_phone="9990004444",
                    reason="Headache",
                    assigned_doctor_id=None,
                    priority="low",
                    status="waiting",
                ),
            ]
        )
        db.commit()

    # Emergency
    if db.query(EmergencyCase).count() == 0:
        db.add_all(
            [
                EmergencyCase(
                    patient_name="Unknown Patient",
                    patient_phone=None,
                    triage_level="critical",
                    symptoms="Chest pain, shortness of breath",
                    assigned_doctor_id=d1,
                    status="open",
                )
            ]
        )
        db.commit()

    # AI Logs
    if db.query(AIDecision).count() == 0:
        db.add_all(
            [
                AIDecision(
                    event_type="dashboard",
                    event_id=None,
                    input_summary="Initial seed",
                    recommendation="Monitor queue and doctor availability.",
                    rationale="Seed baseline log for UI.",
                    confidence=80,
                )
            ]
        )
        db.commit()


if __name__ == "__main__":
    init_db()
    db = SessionLocal()
    try:
        seed(db)
        print("Seed data inserted.")
    finally:
        db.close()
