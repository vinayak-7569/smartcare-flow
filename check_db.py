import sqlite3, pathlib

db = pathlib.Path(r".\data\smartcare.db").resolve()
con = sqlite3.connect(db)
cur = con.cursor()

cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
print("DB:", db)
print("Tables:", [r[0] for r in cur.fetchall()])

cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version';")
has = cur.fetchone() is not None
print("Has alembic_version:", has)

if has:
    cur.execute("SELECT * FROM alembic_version;")
    print("alembic_version rows:", cur.fetchall())
