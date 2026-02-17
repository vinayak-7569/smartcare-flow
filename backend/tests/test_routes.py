# tests/test_routes.py
import os
import pytest

@pytest.mark.skipif(
    os.getenv("RUN_API_TESTS") != "1",
    reason="Set RUN_API_TESTS=1 after you share your FastAPI app import path."
)
def test_placeholder_routes():
    assert True
