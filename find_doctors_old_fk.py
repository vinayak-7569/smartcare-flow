import sqlite3, pathlib

db = pathlib.Path(r".\data\smartcare.db").resolve()
con = sqlite3.connect(db)
cur = con.cursor()

tables = [r[0] for r in cur.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()]
bad = []
for t in tables:
    try:
        fks = cur.execute(f"PRAGMA foreign_key_list({t})").fetchall()
    except sqlite3.OperationalError:
        continue
    for fk in fks:
        if fk[2] == "doctors_old":
            bad.append((t, fk))

if not bad:
    print("No FKs referencing doctors_old found via PRAGMA.")
else:
    for t, fk in bad:
        print("TABLE:", t, "FK:", fk)

rows = cur.execute("SELECT name, sql FROM sqlite_master WHERE sql LIKE '%doctors_old%'").fetchall()
print("\n-- sqlite_master entries containing 'doctors_old' --")
for name, sql in rows:
    print(name)
    print(sql)
    print()
