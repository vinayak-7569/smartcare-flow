# tests/test_imports.py
def test_sqlalchemy_imports():
    from sqlalchemy import create_engine
    from sqlalchemy.orm import DeclarativeBase, sessionmaker
    assert create_engine is not None
    assert DeclarativeBase is not None
    assert sessionmaker is not None
