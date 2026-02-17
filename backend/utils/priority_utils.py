# backend/utils/priority_utils.py
from __future__ import annotations

from typing import Any


def clamp_score(
    score: Any,
    lo: float = 0.0,
    hi: float = 1.0,
    default: float = 0.0,
) -> float:
    """
    Clamp a numeric score into [lo, hi]. If score is None/invalid -> default.
    """
    try:
        x = float(score)
    except (TypeError, ValueError):
        return float(default)

    if x < lo:
        return float(lo)
    if x > hi:
        return float(hi)
    return float(x)


def priority_from_score(score: Any) -> int:
    """
    Convert a 0..1 score to an INTEGER priority.
    Higher score => more urgent.

    Returns:
      >= 0.90 -> 5 (CRITICAL)
      >= 0.70 -> 4 (HIGH)
      >= 0.40 -> 3 (NORMAL)
      else    -> 1 (LOW)
    """
    s = clamp_score(score, 0.0, 1.0, default=0.0)

    if s >= 0.90:
        return 5
    if s >= 0.70:
        return 4
    if s >= 0.40:
        return 3
    return 1


def normalize_priority(value: Any, default: int = 3) -> int:
    """
    Normalize incoming priority into INTEGER values.

    Returns:
      5 -> critical
      4 -> high
      3 -> normal
      1 -> low

    Accepts (case-insensitive):
      - "critical", "crit", "p0", "emergency"
      - "high", "urgent", "p1"
      - "normal", "medium", "routine", "standard", "p2"
      - "low", "p3"
      - numeric: 5,4,3,1 OR "5","4","3","1"
    """

    if value is None:
        return default

    # ✅ If number
    if isinstance(value, (int, float)):
        n = int(value)
        if n >= 5:
            return 5
        if n >= 4:
            return 4
        if n >= 3:
            return 3
        return 1

    s = str(value).strip().lower()
    if not s:
        return default

    # ✅ If numeric string
    if s.isdigit():
        n = int(s)
        if n >= 5:
            return 5
        if n >= 4:
            return 4
        if n >= 3:
            return 3
        return 1

    mapping = {
        "critical": 5,
        "crit": 5,
        "p0": 5,
        "emergency": 5,

        "high": 4,
        "urgent": 4,
        "p1": 4,

        "normal": 3,
        "medium": 3,
        "routine": 3,
        "standard": 3,
        "p2": 3,

        "low": 1,
        "p3": 1,
    }

    return mapping.get(s, default)


# Optional alias (if other modules import it)
def parse_priority(value: Any, default: int = 3) -> int:
    return normalize_priority(value, default=default)
