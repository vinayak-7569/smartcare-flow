"""
SmartCare Flow - Doctor Management Routes
Admin interface for doctor setup and availability
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from backend.core.config import settings
from backend.core.logger import get_logger
from backend.core.database import get_db
from backend.services.doctor_service import DoctorService

router = APIRouter()
logger = get_logger(__name__)
doctor_service = DoctorService()


# -----------------------------
# Request Models
# -----------------------------
class DoctorCreateRequest(BaseModel):
    name: str
    department: str
    shift_start: str  # HH:MM
    shift_end: str    # HH:MM
    status: str = settings.STATUS_AVAILABLE
    specialization: Optional[str] = None


class DoctorUpdateRequest(BaseModel):
    name: Optional[str] = None
    shift_start: Optional[str] = None
    shift_end: Optional[str] = None
    status: Optional[str] = None
    specialization: Optional[str] = None


# -----------------------------
# Fixed-path endpoints FIRST
# -----------------------------
@router.get("/stats/overview")
async def get_doctor_stats(db: Session = Depends(get_db)):
    try:
        stats = doctor_service.get_statistics(db=db)
        return {"success": True, "stats": stats}
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/department/{department}/summary")
async def get_department_summary(department: str, db: Session = Depends(get_db)):
    try:
        department_norm = department.strip().upper().replace(" ", "_")

        if department_norm not in settings.DEPARTMENTS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid department. Available: {settings.DEPARTMENTS}",
            )

        summary = doctor_service.get_department_summary(
            db=db, department=department_norm
        )
        return {"success": True, "department": department_norm, "summary": summary}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching department summary: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# Collection endpoints
# -----------------------------
@router.post("/")
async def create_doctor(request: DoctorCreateRequest, db: Session = Depends(get_db)):
    """
    Create new doctor profile
    Admin only
    """
    try:
        # 🔧 NORMALIZE INPUTS (IMPORTANT FIX)
        department = request.department.strip().upper().replace(" ", "_")
        status = request.status.strip().upper()

        # Validate department
        if department not in settings.DEPARTMENTS:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid department. Available: {settings.DEPARTMENTS}",
            )

        # Validate status
        valid_statuses = [settings.STATUS_AVAILABLE, settings.STATUS_ON_LEAVE]
        if status not in valid_statuses:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid status. Available: {valid_statuses}",
            )

        doctor = doctor_service.create_doctor(
            db=db,
            name=request.name,
            department=department,
            shift_start=request.shift_start,
            shift_end=request.shift_end,
            status=status,
            specialization=request.specialization,
        )

        logger.info(f"Doctor created | ID: {doctor['id']} | Name: {request.name}")
        return {
            "success": True,
            "doctor": doctor,
            "message": "Doctor created successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating doctor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def get_doctors(
    department: Optional[str] = None,
    status: Optional[str] = None,
    available_only: bool = False,
    db: Session = Depends(get_db),
):
    try:
        dept_norm = (
            department.strip().upper().replace(" ", "_") if department else None
        )
        status_norm = status.strip().upper() if status else None

        doctors = doctor_service.get_doctors(
            db=db,
            department=dept_norm,
            status=status_norm,
            available_only=available_only,
        )

        return {"success": True, "count": len(doctors), "doctors": doctors}

    except Exception as e:
        logger.error(f"Error fetching doctors: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# Per-doctor endpoints
# -----------------------------
@router.get("/{doctor_id}")
async def get_doctor(doctor_id: str, db: Session = Depends(get_db)):
    try:
        doctor = doctor_service.get_doctor_by_id(db=db, doctor_id=doctor_id)
        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return {"success": True, "doctor": doctor}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching doctor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{doctor_id}")
async def update_doctor(
    doctor_id: str, request: DoctorUpdateRequest, db: Session = Depends(get_db)
):
    try:
        status_norm = request.status.strip().upper() if request.status else None

        doctor = doctor_service.update_doctor(
            db=db,
            doctor_id=doctor_id,
            name=request.name,
            shift_start=request.shift_start,
            shift_end=request.shift_end,
            status=status_norm,
            specialization=request.specialization,
        )

        if not doctor:
            raise HTTPException(status_code=404, detail="Doctor not found")

        logger.info(f"Doctor updated | ID: {doctor_id}")
        return {
            "success": True,
            "doctor": doctor,
            "message": "Doctor updated successfully",
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating doctor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{doctor_id}")
async def delete_doctor(doctor_id: str, db: Session = Depends(get_db)):
    try:
        result = doctor_service.delete_doctor(db=db, doctor_id=doctor_id)
        if not result:
            raise HTTPException(status_code=404, detail="Doctor not found")

        logger.info(f"Doctor deleted | ID: {doctor_id}")
        return {"success": True, "message": "Doctor deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting doctor: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{doctor_id}/queue")
async def get_doctor_queue(doctor_id: str, db: Session = Depends(get_db)):
    try:
        queue_info = doctor_service.get_doctor_queue(db=db, doctor_id=doctor_id)
        if not queue_info:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return {"success": True, "queue": queue_info}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching doctor queue: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{doctor_id}/workload")
async def get_doctor_workload(doctor_id: str, db: Session = Depends(get_db)):
    try:
        workload = doctor_service.get_doctor_workload(db=db, doctor_id=doctor_id)
        if not workload:
            raise HTTPException(status_code=404, detail="Doctor not found")
        return {"success": True, "workload": workload}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching workload: {e}")
        raise HTTPException(status_code=500, detail=str(e))
