"""
SmartCare Flow - Decision Logic Engine
Pure rule-based logic with zero hardcoding

This module intentionally exposes:
- DecisionEngine (class)
- build_default_rules (compat)
- evaluate_observation (compat)

So older code that imports:
  from .decision_logic import build_default_rules, evaluate_observation
will keep working.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional

from backend.core.config import settings
from backend.core.logger import get_logger

logger = get_logger(__name__)


class DecisionEngine:
    """Rule-based decision engine for scheduling optimization"""

    def assign_appointment(
        self,
        state: Dict[str, Any],
        patient_data: Dict[str, Any],
        preferred_time: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Assign appointment to optimal doctor
        Logic:
        1. Filter doctors in same department
        2. Check shift timing compatibility (TODO if shift data exists)
        3. Select least busy doctor
        4. Detect conflicts
        """
        _ = preferred_time  # reserved for future shift/time matching

        doctors = state.get("doctors") or []
        department = patient_data.get("department")

        department_doctors = [
            d
            for d in doctors
            if d.get("department") == department
            and d.get("status") != settings.STATUS_ON_LEAVE
        ]

        if not department_doctors:
            return {
                "assigned_doctor_id": None,
                "status": "NO_DOCTOR_AVAILABLE",
                "reason": f"No available doctors in {department}",
                "ai_optimized": False,
            }

        sorted_doctors = sorted(
            department_doctors,
            key=lambda x: int(x.get("current_queue_length", 0)),
        )

        optimal_doctor = sorted_doctors[0]
        queue_len = int(optimal_doctor.get("current_queue_length", 0))
        is_conflict = queue_len >= settings.QUEUE_THRESHOLD_HIGH

        decision = {
            "assigned_doctor_id": optimal_doctor.get("id"),
            "doctor_name": optimal_doctor.get("name"),
            "status": "DELAYED" if is_conflict else "SCHEDULED",
            "reason": self._generate_assignment_reason(optimal_doctor, is_conflict),
            "estimated_wait_time": settings.calculate_estimated_wait_time(queue_len),
            "ai_optimized": True,
            "alternatives_considered": len(department_doctors),
            "conflict_detected": is_conflict,
        }

        logger.debug(f"Assignment decision: {decision}")
        return decision

    def process_walkin(
        self,
        state: Dict[str, Any],
        patient_data: Dict[str, Any],
        priority: str,
    ) -> Dict[str, Any]:
        """
        Process walk-in patient
        Logic:
        1. Assign to least busy doctor in department
        2. Calculate queue position based on priority
        3. Detect overload condition
        """
        doctors = state.get("doctors") or []
        department = patient_data.get("department")

        department_doctors = [
            d
            for d in doctors
            if d.get("department") == department
            and d.get("status") != settings.STATUS_ON_LEAVE
        ]

        if not department_doctors:
            return {
                "assigned_doctor_id": None,
                "queue_position": None,
                "status": "NO_DOCTOR_AVAILABLE",
            }

        sorted_doctors = sorted(
            department_doctors,
            key=lambda x: int(x.get("current_queue_length", 0)),
        )

        assigned_doctor = sorted_doctors[0]
        queue_length = int(assigned_doctor.get("current_queue_length", 0))

        if priority == settings.PRIORITY_HIGH:
            queue_position = max(1, queue_length // 2)  # insert in middle
        else:
            queue_position = queue_length + 1  # end of queue

        redistribution_needed = (
            queue_length >= settings.QUEUE_THRESHOLD_HIGH
            and len(sorted_doctors) > 1
            and priority == settings.PRIORITY_NORMAL
        )

        return {
            "assigned_doctor_id": assigned_doctor.get("id"),
            "doctor_name": assigned_doctor.get("name"),
            "queue_position": queue_position,
            "estimated_wait_time": settings.calculate_estimated_wait_time(queue_position),
            "redistribution_needed": redistribution_needed,
            "reason": f"Assigned to least busy doctor ({queue_length} in queue)",
        }

    def activate_emergency_protocol(
        self,
        state: Dict[str, Any],
        patient_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Emergency protocol activation
        Logic:
        1. Find ANY available doctor in department
        2. Override queue
        3. No rescheduling allowed
        """
        doctors = state.get("doctors") or []
        department = patient_data.get("department")

        department_doctors = [
            d
            for d in doctors
            if d.get("department") == department
            and d.get("status") != settings.STATUS_ON_LEAVE
        ]

        assigned_doctor: Optional[Dict[str, Any]] = None

        if not department_doctors:
            available_doctors = [
                d for d in doctors if d.get("status") != settings.STATUS_ON_LEAVE
            ]
            if available_doctors:
                assigned_doctor = available_doctors[0]
                logger.warning(
                    f"Emergency assigned to different department: {assigned_doctor.get('department')}"
                )
            else:
                return {"assigned_doctor_id": None, "status": "CRITICAL_NO_DOCTOR"}
        else:
            assigned_doctor = sorted(
                department_doctors,
                key=lambda x: int(x.get("current_queue_length", 0)),
            )[0]

        return {
            "assigned_doctor_id": assigned_doctor.get("id") if assigned_doctor else None,
            "doctor_name": assigned_doctor.get("name") if assigned_doctor else None,
            "protocol": "EMERGENCY_ACTIVATED",
            "priority": settings.PRIORITY_CRITICAL,
            "reason": "Emergency case - immediate attention required",
            "lockdown": True,
        }

    def detect_overload(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Detect overloaded doctors
        Logic:
        1. Identify doctors with queue > threshold
        2. Check if redistribution possible
        3. Generate overload report
        """
        doctors = state.get("doctors") or []

        overloaded_doctors = [
            d
            for d in doctors
            if int(d.get("current_queue_length", 0)) >= settings.QUEUE_THRESHOLD_HIGH
            and d.get("status") != settings.STATUS_ON_LEAVE
        ]

        if not overloaded_doctors:
            return {"is_overloaded": False}

        available_doctors = [
            d
            for d in doctors
            if int(d.get("current_queue_length", 0)) < settings.QUEUE_THRESHOLD_MEDIUM
            and d.get("status") != settings.STATUS_ON_LEAVE
        ]

        return {
            "is_overloaded": True,
            "overloaded_doctors": [
                {
                    "id": d.get("id"),
                    "name": d.get("name"),
                    "department": d.get("department"),
                    "queue_length": int(d.get("current_queue_length", 0)),
                }
                for d in overloaded_doctors
            ],
            "available_doctors": [
                {
                    "id": d.get("id"),
                    "name": d.get("name"),
                    "department": d.get("department"),
                    "queue_length": int(d.get("current_queue_length", 0)),
                }
                for d in available_doctors
            ],
            "redistribution_possible": len(available_doctors) > 0,
            "reason": f"{len(overloaded_doctors)} doctor(s) overloaded",
        }

    def _generate_assignment_reason(self, doctor: Dict[str, Any], is_conflict: bool) -> str:
        """Generate human-readable reason for assignment"""
        name = doctor.get("name", "the selected doctor")
        q = int(doctor.get("current_queue_length", 0))

        if is_conflict:
            return (
                f"Assigned to {name} despite high queue ({q} patients) "
                f"- no better alternative available"
            )
        return f"Optimal assignment to {name} (lowest queue: {q} patients)"


# -------------------------------------------------------------------
# Compatibility exports for existing agent.py imports
# -------------------------------------------------------------------

def build_default_rules() -> List[Dict[str, Any]]:
    """
    Compatibility function.

    Your current system is an engine-based approach (DecisionEngine),
    not a 'list of rules'. Returning an empty list keeps older agents
    working without hardcoding.
    """
    return []


def evaluate_observation(observation: Dict[str, Any], rules: Optional[List[Dict[str, Any]]] = None) -> Dict[str, Any]:
    """
    Compatibility function.

    Routes an observation to the DecisionEngine method based on an 'action' key.

    Expected observation shapes:
      - action: 'assign_appointment'
        state, patient_data, preferred_time?
      - action: 'process_walkin'
        state, patient_data, priority
      - action: 'activate_emergency_protocol'
        state, patient_data
      - action: 'detect_overload'
        state
    """
    _ = rules  # reserved for future rule-list support

    if not isinstance(observation, dict):
        raise TypeError("observation must be a dict")

    action = observation.get("action")
    engine = DecisionEngine()

    if action == "assign_appointment":
        return engine.assign_appointment(
            state=observation.get("state") or {},
            patient_data=observation.get("patient_data") or {},
            preferred_time=observation.get("preferred_time"),
        )

    if action == "process_walkin":
        if "priority" not in observation:
            raise KeyError("process_walkin requires 'priority' in observation")
        return engine.process_walkin(
            state=observation.get("state") or {},
            patient_data=observation.get("patient_data") or {},
            priority=observation["priority"],
        )

    if action == "activate_emergency_protocol":
        return engine.activate_emergency_protocol(
            state=observation.get("state") or {},
            patient_data=observation.get("patient_data") or {},
        )

    if action == "detect_overload":
        return engine.detect_overload(state=observation.get("state") or {})

    raise ValueError(
        "Unknown or missing observation['action']. "
        "Expected one of: assign_appointment, process_walkin, "
        "activate_emergency_protocol, detect_overload"
    )
