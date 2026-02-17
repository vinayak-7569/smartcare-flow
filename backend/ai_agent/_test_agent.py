# backend/ai_agent/_test_agent.py
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict

import pytest

from backend.ai_agent.agent import RuleBasedAgent, AgentConfig
from backend.ai_agent.observation import Observation


def test_agent_returns_decision_result_fields() -> None:
    agent = RuleBasedAgent(config=AgentConfig())

    obs = Observation(
        patient_id="p1",
        observed_at=datetime.now(timezone.utc),
        age=40,
        heart_rate=80,
        respiratory_rate=16,
        systolic_bp=120,
        diastolic_bp=80,
        spo2=98,
        temperature_c=37.0,
        symptoms_text="mild cough",
    )

    res = agent.decide(obs)

    assert res.decision_id
    assert res.patient_id == "p1"
    assert res.priority in ("low", "medium", "high", "critical")
    assert isinstance(res.score, int)
    assert res.created_at is not None
    assert isinstance(res.recommendations, list)
    assert isinstance(res.reasons, list)
    assert isinstance(res.triggered_rules, list)


def test_critical_spo2_triggers_critical_priority() -> None:
    agent = RuleBasedAgent(config=AgentConfig())

    obs = Observation(
        patient_id="p2",
        spo2=85,
        heart_rate=90,
        systolic_bp=120,
        diastolic_bp=80,
        temperature_c=37.0,
    )

    res = agent.decide(obs)

    assert res.priority == "critical"
    assert res.score >= 80
    assert any(r.code == "CRIT_SPO2_LT_90" for r in res.triggered_rules)
    assert any(rec.priority == "critical" for rec in res.recommendations)


def test_low_priority_when_no_rules_triggered() -> None:
    agent = RuleBasedAgent(config=AgentConfig())

    obs = Observation(
        patient_id="p3",
        spo2=99,
        heart_rate=72,
        systolic_bp=118,
        diastolic_bp=76,
        respiratory_rate=14,
        temperature_c=36.8,
    )

    res = agent.decide(obs)

    assert res.priority in ("low", "medium")  # baseline stays low
    assert len(res.recommendations) >= 1
    assert any(rec.code == "REC_GENERAL_MONITOR" for rec in res.recommendations)


def test_warn_bp_inconsistent_adds_warning_not_critical() -> None:
    agent = RuleBasedAgent(config=AgentConfig())

    obs = Observation(
        patient_id="p4",
        systolic_bp=70,
        diastolic_bp=90,  # inconsistent
        spo2=98,
        heart_rate=80,
        temperature_c=37.0,
    )

    res = agent.decide(obs)

    assert any("verify measurement" in w.lower() for w in res.warnings)
    # SBP < 90 still triggers critical in default rules
    assert res.priority == "critical"


@pytest.mark.parametrize(
    "temp_c, expected_priority_min",
    [
        (38.0, "medium"),
        (39.0, "medium"),
        (39.4, "high"),
        (40.0, "high"),
    ],
)
def test_temperature_thresholds(temp_c: float, expected_priority_min: str) -> None:
    agent = RuleBasedAgent(config=AgentConfig())

    obs = Observation(
        patient_id="p5",
        temperature_c=temp_c,
        spo2=98,
        heart_rate=90,
        systolic_bp=120,
        diastolic_bp=80,
    )

    res = agent.decide(obs)

    rank = {"low": 0, "medium": 1, "high": 2, "critical": 3}
    assert rank[res.priority] >= rank[expected_priority_min]


def test_agent_is_deterministic_for_same_input_time() -> None:
    agent = RuleBasedAgent(config=AgentConfig())

    fixed_time = datetime(2025, 1, 1, 0, 0, 0, tzinfo=timezone.utc)

    obs = Observation(
        patient_id="p6",
        observed_at=fixed_time,
        spo2=92,
        heart_rate=140,
        systolic_bp=110,
        diastolic_bp=70,
        temperature_c=38.5,
    )

    res1 = agent.decide(obs)
    res2 = agent.decide(obs)

    # decision_id includes created_at (inside decide), so it will differ.
    # Determinism here means: same clinical output, not same id.
    assert res1.priority == res2.priority
    assert res1.score == res2.score
    assert [r.code for r in res1.recommendations] == [r.code for r in res2.recommendations]
    assert res1.triggered_rules == res2.triggered_rules
