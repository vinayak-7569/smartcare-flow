# backend/utils/validators.py
from __future__ import annotations

from typing import Any


def not_empty(value: Any, field: str = "value") -> Any:
    """
    Validate that a value is present and not empty.
    Returns the value unchanged, otherwise raises ValueError.

    Treats as empty:
      - None
      - "" / whitespace-only strings
      - empty list/tuple/set/dict
    """
    if value is None:
        raise ValueError(f"{field} must not be empty")

    if isinstance(value, str) and value.strip() == "":
        raise ValueError(f"{field} must not be empty")

    if isinstance(value, (list, tuple, set, dict)) and len(value) == 0:
        raise ValueError(f"{field} must not be empty")

    return value
