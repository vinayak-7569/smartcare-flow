from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.core.database import get_db
from backend.core.settings import settings
from backend.utils.response_utils import ok

router = APIRouter()


def _safe_count(db: Session, query: str, params: dict | None = None) -> int:
    """
    Executes COUNT(*) safely.
    If table/column is missing, returns 0 instead of crashing.
    """
    try:
        return int(db.execute(text(query), params or {}).scalar() or 0)
    except Exception:
        return 0


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    # ------------------------------------------------
    # Doctors
    # ------------------------------------------------
    doctors_total = _safe_count(
        db,
        """
        SELECT COUNT(*)
        FROM doctors
        WHERE deleted_at IS NULL
        """,
    )

    doctors_available = _safe_count(
        db,
        """
        SELECT COUNT(*)
        FROM doctors
        WHERE status = :available
          AND deleted_at IS NULL
        """,
        {"available": getattr(settings, "STATUS_AVAILABLE", "available")},
    )

    # ------------------------------------------------
    # Appointments (OPEN = scheduled + checked_in)
    # ------------------------------------------------
    appointments_open = _safe_count(
        db,
        """
        SELECT COUNT(*)
        FROM appointments
        WHERE status IN ('SCHEDULED', 'CHECKED_IN')
        """,
    )

    # ------------------------------------------------
    # Walk-ins (safe)
    # ------------------------------------------------
    walkins_waiting = _safe_count(
        db,
        """
        SELECT COUNT(*)
        FROM walkins
        WHERE status IN ('WAITING', 'waiting')
        """,
    )

    # ------------------------------------------------
    # Emergency cases (safe)
    # ------------------------------------------------
    emergency_open = _safe_count(
        db,
        """
        SELECT COUNT(*)
        FROM emergencies
        WHERE status IN ('OPEN', 'open')
        """,
    )

    # ------------------------------------------------
    # Queue (waiting only) (safe)
    # ------------------------------------------------
    queue_waiting = _safe_count(
        db,
        """
        SELECT COUNT(*)
        FROM queue
        WHERE status IN ('WAITING', 'waiting')
        """,
    )

    return ok(
        {
            "doctors": {
                "total": doctors_total,
                "available": doctors_available,
            },
            "counts": {
                "appointments_open": appointments_open,
                "walkins_waiting": walkins_waiting,
                "emergency_open": emergency_open,
                "queue_waiting": queue_waiting,
            },
        }
    )


# ✅ BACKWARD COMPATIBILITY:
# If frontend is calling /api/dashboard/overview
# we return the same response.
@router.get("/overview")
def get_dashboard_overview(db: Session = Depends(get_db)):
    return get_dashboard_summary(db)
