"""
SmartCare Flow - FastAPI Backend Entry Point (app.py)
Hackathon-ready, cleaned and corrected
"""

from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
import sys

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn

# -----------------------------------------------------------------------------
# Imports (support running from project root OR backend/ directory)
# -----------------------------------------------------------------------------
try:
    from backend.core.config import settings
    from backend.core.logger import get_logger
    from backend.core.database import init_db
    from backend.routes import (
        dashboard,
        doctors,
        appointments,
        walkins,
        emergency,
        availability,
        ai_logs,
        reports,
        queue,          # ✅ Queue registered
    )
except ImportError:
    project_root = Path(__file__).resolve().parents[1]
    if str(project_root) not in sys.path:
        sys.path.insert(0, str(project_root))

    from backend.core.config import settings
    from backend.core.logger import get_logger
    from backend.core.database import init_db
    from backend.routes import (
        dashboard,
        doctors,
        appointments,
        walkins,
        emergency,
        availability,
        ai_logs,
        reports,
        queue,
    )

logger = get_logger(__name__)

# -----------------------------------------------------------------------------
# Lifespan (startup/shutdown)
# -----------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting SmartCare Flow Backend...")
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception:
        logger.exception("Database initialization failed")
        raise

    yield

    logger.info("Shutting down SmartCare Flow Backend...")

# -----------------------------------------------------------------------------
# App
# -----------------------------------------------------------------------------
app = FastAPI(
    title=getattr(settings, "APP_NAME", "SmartCare Flow API"),
    description=getattr(
        settings,
        "APP_DESCRIPTION",
        "AI-Driven Hospital Operations Management System (operations only)",
    ),
    version=getattr(settings, "VERSION", "1.0.0"),
    lifespan=lifespan,
)

# -----------------------------------------------------------------------------
# CORS
# -----------------------------------------------------------------------------
def _build_cors_origins() -> list[str]:
    origins: list[str] = []

    raw = getattr(settings, "CORS_ALLOW_ORIGINS", None)
    if raw:
        if isinstance(raw, (list, tuple, set)):
            origins.extend([str(x).strip() for x in raw if str(x).strip()])
        elif isinstance(raw, str):
            origins.extend([x.strip() for x in raw.split(",") if x.strip()])

    for o in (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ):
        if o not in origins:
            origins.append(o)

    return list(dict.fromkeys(origins))  # de-duplicate safely

app.add_middleware(
    CORSMiddleware,
    allow_origins=_build_cors_origins() or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# Health endpoints
# -----------------------------------------------------------------------------
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "operational",
        "system": "SmartCare Flow",
        "version": getattr(settings, "VERSION", "1.0.0"),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }

# -----------------------------------------------------------------------------
# Routers
# -----------------------------------------------------------------------------
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(doctors.router, prefix="/api/doctors", tags=["Doctors"])
app.include_router(appointments.router, prefix="/api/appointments", tags=["Appointments"])
app.include_router(walkins.router, prefix="/api/walkins", tags=["Walk-ins"])
app.include_router(emergency.router, prefix="/api/emergency", tags=["Emergency"])
app.include_router(availability.router, prefix="/api/availability", tags=["Availability"])
app.include_router(queue.router, prefix="/api/queue", tags=["Queue"])  # ✅ WORKING
app.include_router(ai_logs.router, prefix="/api/ai-logs", tags=["AI Logs"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])

# -----------------------------------------------------------------------------
# Global exception handler
# -----------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception occurred")
    debug = bool(getattr(settings, "DEBUG", False))

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if debug else "An error occurred",
            "path": str(request.url.path),
        },
    )

# -----------------------------------------------------------------------------
# Local run
# -----------------------------------------------------------------------------
if __name__ == "__main__":
    uvicorn.run(
        "backend.app:app",
        host=str(getattr(settings, "HOST", "127.0.0.1")),
        port=int(getattr(settings, "PORT", 8000)),
        reload=False,  # keep false for hackathon stability
        log_level=str(getattr(settings, "LOG_LEVEL", "info")),
    )
