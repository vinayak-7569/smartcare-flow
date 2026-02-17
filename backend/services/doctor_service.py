"""
SmartCare Flow - Doctor Service
Business logic for doctor management
"""

import uuid
from typing import Dict, List, Optional
from datetime import datetime

from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.core.settings import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)


# ---------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------
def _row_to_dict(row) -> Dict:
    return dict(row)


def _queue_threshold() -> int:
    return getattr(settings, "QUEUE_THRESHOLD_HIGH", 10)


def _workload_status(queue_len: int) -> str:
    fn = getattr(settings, "calculate_workload_status", None)
    return fn(queue_len) if callable(fn) else "NORMAL"


def _estimated_wait(queue_len: int) -> int:
    fn = getattr(settings, "calculate_estimated_wait_time", None)
    return fn(queue_len) if callable(fn) else queue_len * 5


# ---------------------------------------------------------------------
# Service
# ---------------------------------------------------------------------
class DoctorService:
    """Doctor management service"""

    # -----------------------------------------------------------------
    # Create
    # -----------------------------------------------------------------
    def create_doctor(
        self,
        db: Session,
        name: str,
        department: str,
        shift_start: str,
        shift_end: str,
        status: str,
        specialization: Optional[str] = None,
    ) -> Dict:
        doctor_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        is_available = status == settings.STATUS_AVAILABLE

        db.execute(
            text(
                """
                INSERT INTO doctors
                (id, name, department, shift_start, shift_end, status,
                 specialization, is_available, current_queue_length,
                 created_at, updated_at)
                VALUES
                (:id, :name, :department, :shift_start, :shift_end, :status,
                 :specialization, :is_available, 0, :created_at, :updated_at)
                """
            ),
            {
                "id": doctor_id,
                "name": name,
                "department": department,
                "shift_start": shift_start,
                "shift_end": shift_end,
                "status": status,
                "specialization": specialization or "General",
                "is_available": is_available,
                "created_at": now,
                "updated_at": now,
            },
        )
        db.commit()

        logger.info(f"Doctor created | {name} | {doctor_id}")
        return self.get_doctor_by_id(db, doctor_id)

    # -----------------------------------------------------------------
    # Read
    # -----------------------------------------------------------------
    def get_doctors(
        self,
        db: Session,
        department: Optional[str] = None,
        status: Optional[str] = None,
        available_only: bool = False,
    ) -> List[Dict]:
        query = "SELECT * FROM doctors WHERE deleted_at IS NULL"
        params = {}

        if department:
            query += " AND department = :department"
            params["department"] = department

        if status:
            query += " AND status = :status"
            params["status"] = status

        if available_only:
            query += " AND is_available = 1"

        query += " ORDER BY name"

        rows = db.execute(text(query), params).mappings().all()
        doctors = [_row_to_dict(r) for r in rows]

        for d in doctors:
            d["workload_status"] = _workload_status(d["current_queue_length"])
            d["estimated_wait_time"] = _estimated_wait(d["current_queue_length"])

        return doctors

    def get_doctor_by_id(self, db: Session, doctor_id: str) -> Optional[Dict]:
        row = db.execute(
            text(
                "SELECT * FROM doctors WHERE id = :id AND deleted_at IS NULL"
            ),
            {"id": doctor_id},
        ).mappings().first()

        if not row:
            return None

        doctor = _row_to_dict(row)
        doctor["workload_status"] = _workload_status(
            doctor["current_queue_length"]
        )
        doctor["estimated_wait_time"] = _estimated_wait(
            doctor["current_queue_length"]
        )
        return doctor

    # -----------------------------------------------------------------
    # Queue (LIVE DATA + COUNTER UPDATES)
    # -----------------------------------------------------------------
    def update_queue_length(
        self,
        db: Session,
        doctor_id: str,
        increment: int,
    ) -> None:
        """
        Safely adjust the doctor's current_queue_length counter.

        - Uses SQL so it stays in sync with other readers
        - Never lets the counter go below 0
        """
        row = db.execute(
            text(
                """
                SELECT current_queue_length
                FROM doctors
                WHERE id = :id AND deleted_at IS NULL
                """
            ),
            {"id": doctor_id},
        ).mappings().first()

        if not row:
            logger.warning(f"update_queue_length: doctor not found | id={doctor_id}")
            return

        current = row["current_queue_length"] or 0
        new_value = max(0, current + increment)

        db.execute(
            text(
                """
                UPDATE doctors
                SET current_queue_length = :val, updated_at = :updated_at
                WHERE id = :id AND deleted_at IS NULL
                """
            ),
            {
                "id": doctor_id,
                "val": new_value,
                "updated_at": datetime.utcnow().isoformat(),
            },
        )
        db.commit()

    def get_doctor_queue(self, db: Session, doctor_id: str) -> Optional[Dict]:
        doctor = self.get_doctor_by_id(db, doctor_id)
        if not doctor:
            return None

        queue_items = db.execute(
            text(
                """
                SELECT *
                FROM queue_items
                WHERE doctor_id = :doctor_id
                  AND status IN ('WAITING', 'IN_PROGRESS')
                ORDER BY priority DESC, position ASC, created_at ASC
                """
            ),
            {"doctor_id": doctor_id},
        ).mappings().all()

        queue_len = len(queue_items)

        return {
            "doctor_id": doctor_id,
            "doctor_name": doctor["name"],
            "current_queue_length": queue_len,
            "estimated_wait_time": _estimated_wait(queue_len),
            "workload_status": _workload_status(queue_len),
            "queue": [dict(q) for q in queue_items],
        }

    # -----------------------------------------------------------------
    # Workload (🔥 FIXED – REQUIRED BY /workload)
    # -----------------------------------------------------------------
    def get_doctor_workload(self, db: Session, doctor_id: str) -> Optional[Dict]:
        doctor = self.get_doctor_by_id(db, doctor_id)
        if not doctor:
            return None

        queue_len = db.execute(
            text(
                """
                SELECT COUNT(*) FROM queue_items
                WHERE doctor_id = :doctor_id
                  AND status IN ('WAITING', 'IN_PROGRESS')
                """
            ),
            {"doctor_id": doctor_id},
        ).scalar() or 0

        threshold = _queue_threshold()

        return {
            "doctor_id": doctor_id,
            "doctor_name": doctor["name"],
            "department": doctor["department"],
            "current_queue_length": queue_len,
            "workload_percentage": round(
                (queue_len / threshold) * 100, 2
            ) if threshold else 0,
            "workload_status": _workload_status(queue_len),
            "estimated_wait_time": _estimated_wait(queue_len),
            "is_overloaded": queue_len >= threshold,
            "capacity_remaining": max(0, threshold - queue_len),
            "shift": {
                "start": doctor["shift_start"],
                "end": doctor["shift_end"],
            },
        }

    # -----------------------------------------------------------------
    # Update
    # -----------------------------------------------------------------
    def update_doctor(
        self,
        db: Session,
        doctor_id: str,
        name: Optional[str] = None,
        shift_start: Optional[str] = None,
        shift_end: Optional[str] = None,
        status: Optional[str] = None,
        specialization: Optional[str] = None,
    ) -> Optional[Dict]:
        if not self.get_doctor_by_id(db, doctor_id):
            return None

        updates = []
        params = {"id": doctor_id}

        if name is not None:
            updates.append("name = :name")
            params["name"] = name

        if shift_start is not None:
            updates.append("shift_start = :shift_start")
            params["shift_start"] = shift_start

        if shift_end is not None:
            updates.append("shift_end = :shift_end")
            params["shift_end"] = shift_end

        if status is not None:
            updates.append("status = :status")
            updates.append("is_available = :is_available")
            params["status"] = status
            params["is_available"] = status == settings.STATUS_AVAILABLE

        if specialization is not None:
            updates.append("specialization = :specialization")
            params["specialization"] = specialization

        if updates:
            updates.append("updated_at = :updated_at")
            params["updated_at"] = datetime.utcnow().isoformat()

            db.execute(
                text(f"UPDATE doctors SET {', '.join(updates)} WHERE id = :id"),
                params,
            )
            db.commit()

        return self.get_doctor_by_id(db, doctor_id)

    # -----------------------------------------------------------------
    # Delete
    # -----------------------------------------------------------------
    def delete_doctor(self, db: Session, doctor_id: str) -> bool:
        if not self.get_doctor_by_id(db, doctor_id):
            return False

        now = datetime.utcnow().isoformat()
        db.execute(
            text(
                """
                UPDATE doctors
                SET deleted_at = :d, updated_at = :u
                WHERE id = :id
                """
            ),
            {"d": now, "u": now, "id": doctor_id},
        )
        db.commit()
        return True

    # -----------------------------------------------------------------
    # Department Summary
    # -----------------------------------------------------------------
    def get_department_summary(self, db: Session, department: str) -> Dict:
        total = db.execute(
            text(
                """
                SELECT COUNT(*) FROM doctors
                WHERE department = :dept AND deleted_at IS NULL
                """
            ),
            {"dept": department},
        ).scalar() or 0

        available = db.execute(
            text(
                """
                SELECT COUNT(*) FROM doctors
                WHERE department = :dept
                  AND is_available = 1
                  AND deleted_at IS NULL
                """
            ),
            {"dept": department},
        ).scalar() or 0

        avg_queue = db.execute(
            text(
                """
                SELECT AVG(current_queue_length)
                FROM doctors
                WHERE department = :dept AND deleted_at IS NULL
                """
            ),
            {"dept": department},
        ).scalar()

        threshold = _queue_threshold()

        overloaded = db.execute(
            text(
                """
                SELECT COUNT(*) FROM doctors
                WHERE department = :dept
                  AND current_queue_length >= :threshold
                  AND deleted_at IS NULL
                """
            ),
            {"dept": department, "threshold": threshold},
        ).scalar() or 0

        return {
            "department": department,
            "doctors_total": total,
            "doctors_available": available,
            "doctors_overloaded": overloaded,
            "average_queue_length": round(avg_queue or 0, 2),
            "queue_threshold": threshold,
        }

    # -----------------------------------------------------------------
    # Statistics
    # -----------------------------------------------------------------
    def get_statistics(self, db: Session) -> Dict:
        total = db.execute(
            text("SELECT COUNT(*) FROM doctors WHERE deleted_at IS NULL")
        ).scalar() or 0

        available = db.execute(
            text(
                """
                SELECT COUNT(*) FROM doctors
                WHERE deleted_at IS NULL AND is_available = 1
                """
            )
        ).scalar() or 0

        waiting_queue = db.execute(
            text(
                """
                SELECT COUNT(*) FROM queue_items WHERE status = 'WAITING'
                """
            )
        ).scalar() or 0

        return {
            "doctors": {
                "total": total,
                "available": available,
                "on_leave": total - available,
            },
            "queue": {
                "waiting": waiting_queue,
            },
        }
