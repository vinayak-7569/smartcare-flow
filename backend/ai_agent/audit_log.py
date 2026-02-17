# backend/ai_agent/audit_log.py
from __future__ import annotations

import json
import traceback
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Optional


@dataclass(frozen=True)
class AuditConfig:
    log_path: Path = Path("logs") / "ai_decisions.jsonl"
    include_free_text: bool = False  # store symptoms_text in audit log or not


class AIAuditLogger:
    """
    Robust JSON Lines logger (one JSON per line).
    Creates directories automatically. Use safe_write_event() in production paths.
    """
    def _init_(self, config: Optional[AuditConfig] = None) -> None:
        self.config = config or AuditConfig()
        self.log_path = self.config.log_path
        self.log_path.parent.mkdir(parents=True, exist_ok=True)

    def write_event(self, event: Dict[str, Any]) -> None:
        payload = dict(event)
        payload.setdefault("ts", datetime.now(timezone.utc).isoformat())
        line = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
        with open(self.log_path, "a", encoding="utf-8") as f:
            f.write(line + "\n")

    def safe_write_event(self, event: Dict[str, Any]) -> None:
        try:
            self.write_event(event)
        except Exception:
            # Never break the request flow because audit logging failed
            try:
                fallback = {
                    "ts": datetime.now(timezone.utc).isoformat(),
                    "type": "audit_log_error",
                    "error": "Failed to write audit event",
                    "trace": traceback.format_exc(limit=8),
                }
                print(json.dumps(fallback, ensure_ascii=False))
            except Exception:
                pass


def minimal_observation_for_audit(obs: Any, include_free_text: bool) -> Dict[str, Any]:
    base = {
        "observed_at": getattr(obs, "observed_at", None).isoformat() if getattr(obs, "observed_at", None) else None,
        "age": getattr(obs, "age", None),
        "heart_rate": getattr(obs, "heart_rate", None),
        "respiratory_rate": getattr(obs, "respiratory_rate", None),
        "systolic_bp": getattr(obs, "systolic_bp", None),
        "diastolic_bp": getattr(obs, "diastolic_bp", None),
        "spo2": getattr(obs, "spo2", None),
        "temperature_c": getattr(obs, "temperature_c", None),
    }
    if include_free_text:
        base["symptoms_text"] = getattr(obs, "symptoms_text", None)
    return base
