# backend/routes/ai_logs.py

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select

from backend.core.database import get_db
from backend.models.ai_decision import AIDecision
from backend.utils.response_utils import ok, fail

router = APIRouter()


# -------------------------------------------------
# GET: AI Logs
# Final URL: GET /api/ai-logs
# -------------------------------------------------
@router.get("/")
def get_ai_logs(db: Session = Depends(get_db)):
    logs = (
        db.execute(select(AIDecision).order_by(AIDecision.id.desc()).limit(200))
        .scalars()
        .all()
    )

    data = [
        {
            "id": str(l.id),
            "timestamp": str(l.created_at) if l.created_at else None,
            "triggerEvent": l.event_type,
            "observation": l.input_summary,
            "recommendation": l.recommendation,
            "reason": l.rationale,
            "outcome": None,
            "acceptedByStaff": True,  # default
            "confidence": l.confidence,
        }
        for l in logs
    ]

    return ok(data)


# -------------------------------------------------
# POST: Create AI Log
# Final URL: POST /api/ai-logs
# -------------------------------------------------
@router.post("/")
def post_ai_log(payload: dict, db: Session = Depends(get_db)):
    et = payload.get("event_type")
    if not et:
        return fail("event_type_is_required", 422)

    log = AIDecision(
        event_type=et,
        event_id=payload.get("event_id"),
        input_summary=payload.get("input_summary"),
        recommendation=payload.get("recommendation"),
        rationale=payload.get("rationale"),
        confidence=int(payload.get("confidence", 70)),
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return ok({"id": log.id}, message="ai_log_created")


# -------------------------------------------------
# ✅ COMPATIBILITY ENDPOINT (Frontend expects this)
# Final URL: GET /api/ai-logs/decisions
# -------------------------------------------------
@router.get("/decisions")
def get_ai_decisions(db: Session = Depends(get_db)):
    return get_ai_logs(db)
