# backend/utils/response_utils.py
from __future__ import annotations

from typing import Any, Dict, Optional
from starlette.responses import JSONResponse


def ok_response(data: Any = None, message: str = "ok") -> Dict[str, Any]:
    return {
        "success": True,
        "message": message,
        "data": data,
    }


# Backwards-compatible alias (some routes import ok)
def ok(data: Any = None, message: str = "ok") -> Dict[str, Any]:
    return ok_response(data=data, message=message)


def error_response(
    message: str,
    *,
    code: str = "ERROR",
    details: Optional[Any] = None,
) -> Dict[str, Any]:
    payload: Dict[str, Any] = {
        "success": False,
        "message": message,
        "code": code,
    }
    if details is not None:
        payload["details"] = details
    return payload


def fail(
    message: str,
    status_code: int = 400,
    *,
    code: str = "ERROR",
    details: Optional[Any] = None,
) -> JSONResponse:
    content = error_response(message, code=code, details=details)
    return JSONResponse(status_code=status_code, content=content)
