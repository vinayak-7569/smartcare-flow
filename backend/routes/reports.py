# backend/routes/reports.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from backend.core.database import get_db
from backend.models.appointment import Appointment
from backend.models.walkin import WalkIn
from backend.models.emergency import EmergencyCase
from backend.utils.response_utils import ok

router = APIRouter()


@router.get("/overview")
def get_reports_overview(db: Session = Depends(get_db)):
    """
    Final URL:
    GET /api/reports/overview
    """
    appt_total = db.execute(select(func.count(Appointment.id))).scalar() or 0
    walkin_total = db.execute(select(func.count(WalkIn.id))).scalar() or 0
    emergency_total = db.execute(select(func.count(EmergencyCase.id))).scalar() or 0

    by_appt_status = dict(
        db.execute(
            select(Appointment.status, func.count(Appointment.id)).group_by(Appointment.status)
        ).all()
    )
    by_walkin_status = dict(
        db.execute(select(WalkIn.status, func.count(WalkIn.id)).group_by(WalkIn.status)).all()
    )
    by_emergency_status = dict(
        db.execute(
            select(EmergencyCase.status, func.count(EmergencyCase.id)).group_by(EmergencyCase.status)
        ).all()
    )

    return ok(
        {
            "totals": {
                "appointments": appt_total,
                "walkins": walkin_total,
                "emergencies": emergency_total,
            },
            "breakdown": {
                "appointments": by_appt_status,
                "walkins": by_walkin_status,
                "emergencies": by_emergency_status,
            },
        }
    )


# ✅ FRONTEND COMPATIBILITY
@router.get("/analytics")
def get_reports_analytics(db: Session = Depends(get_db)):
    """
    Final URL:
    GET /api/reports/analytics

    Frontend expects this endpoint.
    We can return same overview data for now.
    """
    return get_reports_overview(db)
