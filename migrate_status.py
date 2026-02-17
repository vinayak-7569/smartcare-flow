import sqlite3

db = r".\data\smartcare.db"
sql = "ALTER TABLE doctors ADD COLUMN status TEXT NOT NULL DEFAULT 'AVAILABLE';"

conn = sqlite3.connect(db)
conn.execute(sql)
conn.commit()

print("OK")
print(conn.execute("PRAGMA table_info(doctors);").fetchall())
conn.close()
