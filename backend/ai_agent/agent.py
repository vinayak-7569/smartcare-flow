# backend/ai_agent/agent.py
from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from .audit_log import AIAuditLogger, AuditConfig, minimal_observation_for_audit
from .decision_logic import build_default_rules, evaluate_observation
from .metrics import AgentMetrics, timer
from .observation import Observation
from .recommendations import DecisionResult


def _stable_decision_id(patient_id: str, created_at: datetime, payload: Dict[str, Any]) -> str:
    raw = json.dumps(
        {"patient_id": patient_id, "created_at": created_at.isoformat(), "payload": payload},
        sort_keys=True,
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")
    return hashlib.sha256(raw).hexdigest()[:16]


@dataclass
class AgentConfig:
    version: str = "2.0.0"
    audit: AuditConfig = AuditConfig()


class RuleBasedAgent:
    """
    Advanced deterministic decision engine wrapper.
    Public API: agent.decide(Observation) -> DecisionResult
    """

    def _init_(self, config: Optional[AgentConfig] = None) -> None:
        self.config = config or AgentConfig()
        self.audit = AIAuditLogger(self.config.audit)
        self.metrics = AgentMetrics()
        self._rules = build_default_rules()

    def decide(self, obs: Observation) -> DecisionResult:
        t = timer()
        created_at = datetime.now(timezone.utc)

        score, priority, triggered_rules, reasons, recs, warnings = evaluate_observation(
            obs=obs,
            rules=self._rules,
        )

        payload = {
            "priority": priority,
            "score": score,
            "triggered_rules": triggered_rules,
            "reasons": reasons,
            "warnings": warnings,
            "recommendations": [r.model_dump() for r in recs],
            "version": self.config.version,
        }
        decision_id = _stable_decision_id(obs.patient_id, created_at, payload)

        result = DecisionResult(
            decision_id=decision_id,
            patient_id=obs.patient_id,
            created_at=created_at,
            priority=priority,
            score=score,
            recommendations=recs,
            reasons=reasons,
            warnings=warnings,
            triggered_rules=triggered_rules,
            version=self.config.version,
            meta={"engine": "rule_based"},
        )

        latency_ms = t.ms()
        self.metrics.observe(priority, latency_ms)

        self.audit.safe_write_event(
            {
                "type": "decision",
                "decision_id": decision_id,
                "patient_id": obs.patient_id,
                "created_at": created_at.isoformat(),
                "agent_version": self.config.version,
                "priority": priority,
                "score": score,
                "triggered_rules": triggered_rules,
                "reasons": reasons,
                "warnings": warnings,
                "recommendations": [r.model_dump() for r in recs],
                "latency_ms": round(latency_ms, 2),
                "observation": minimal_observation_for_audit(
                    obs,
                    include_free_text=self.config.audit.include_free_text,
                ),
            }
        )

        return result


# ✅ what routes import: **from backend.ai_agent.agent import ai_agent**
ai_agent = RuleBasedAgent()
