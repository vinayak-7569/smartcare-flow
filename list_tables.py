import sqlite3, os

db = r".\app.db"
print("DB:", os.path.abspath(db))

conn = sqlite3.connect(db)
tables = conn.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").fetchall()
print("Tables:", tables)

# also show views (sometimes ORMs use views)
views = conn.execute("SELECT name FROM sqlite_master WHERE type='view' ORDER BY name").fetchall()
print("Views:", views)

conn.close()
