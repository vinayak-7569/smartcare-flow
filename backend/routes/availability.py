# backend/routes/availability.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from backend.core.database import get_db
from backend.utils.response_utils import ok

router = APIRouter()


@router.get("/")
def get_availability(db: Session = Depends(get_db)):
    """
    Lightweight polling endpoint for frontend auto-refresh.

    Final URL:
    GET /api/availability
    """

    rows = (
        db.execute(
            text(
                """
                SELECT
                    id AS doctor_id,
                    name,
                    specialization,
                    department,
                    is_available,
                    shift_start,
                    shift_end
                FROM doctors
                WHERE deleted_at IS NULL
                ORDER BY name ASC
                """
            )
        )
        .mappings()
        .all()
    )

    return ok(list(rows))
