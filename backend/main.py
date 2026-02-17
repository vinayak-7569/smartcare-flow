# backend/main.py
from __future__ import annotations

import uvicorn
from backend.app import app as fastapi_app

try:
    from backend.core.settings import settings
except ImportError:
    from backend.core.settings import settings

app = fastapi_app


def run() -> None:
    uvicorn.run(
        "backend.main:app",
        host=str(getattr(settings, "HOST", "127.0.0.1")),
        port=int(getattr(settings, "PORT", 8000)),
        reload=bool(getattr(settings, "RELOAD", getattr(settings, "DEBUG", False))),
        log_level=str(getattr(settings, "LOG_LEVEL", "info")),
    )


if __name__ == "__main__":
    run()
