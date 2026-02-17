# tests/test_database.py
from sqlalchemy import text

def test_db_can_connect(db_session):
    result = db_session.execute(text("SELECT 1")).scalar_one()
    assert result == 1
