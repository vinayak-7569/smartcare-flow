import sqlite3, os

db = r".\data\smartcare.db"
print("DB:", os.path.abspath(db))

conn = sqlite3.connect(db)
print("Tables:", conn.execute(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
).fetchall())
conn.close()
