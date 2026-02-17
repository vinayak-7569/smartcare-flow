# backend/core/database.py

from __future__ import annotations

from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from backend.core.config import settings


# -----------------------------------------------------------------------------
# Base (SINGLE SOURCE OF TRUTH)
# -----------------------------------------------------------------------------
class Base(DeclarativeBase):
    pass


# -----------------------------------------------------------------------------
# SQLite helpers
# -----------------------------------------------------------------------------
def _connect_args(db_url: str) -> dict:
    if db_url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


def _ensure_sqlite_dir(db_url: str) -> None:
    if not db_url.startswith("sqlite:///"):
        return

    sqlite_path = db_url.replace("sqlite:///", "")
    if sqlite_path == ":memory:":
        return

    p = Path(sqlite_path)
    if not p.is_absolute():
        p = (Path.cwd() / p).resolve()

    p.parent.mkdir(parents=True, exist_ok=True)


# -----------------------------------------------------------------------------
# Engine & Session
# -----------------------------------------------------------------------------
_ensure_sqlite_dir(settings.DATABASE_URL)

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=_connect_args(settings.DATABASE_URL),
    future=True,
)

SessionLocal = sessionmaker(
    bind=engine,
    autoflush=False,
    autocommit=False,
    future=True,
)


# -----------------------------------------------------------------------------
# Model registration (IMPORT ONCE)
# -----------------------------------------------------------------------------
def _import_models() -> None:
    """
    Import all ORM models exactly once so SQLAlchemy registers tables.
    DO NOT import models anywhere else for side effects.
    """
    import backend.models.doctor  # noqa
    import backend.models.appointment  # noqa
    import backend.models.queue  # noqa
    import backend.models.walkin  # noqa
    import backend.models.emergency  # noqa


# -----------------------------------------------------------------------------
# Init DB
# -----------------------------------------------------------------------------
_db_initialized = False


def init_db() -> None:
    """
    Create DB tables safely.
    This must be called ONCE during app startup.
    """
    global _db_initialized
    if _db_initialized:
        return

    _import_models()
    Base.metadata.create_all(bind=engine)
    _db_initialized = True


# -----------------------------------------------------------------------------
# Dependency
# -----------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
