import sqlite3, pathlib

db = pathlib.Path(r".\data\smartcare.db").resolve()
con = sqlite3.connect(db)
cur = con.cursor()

def exec(sql):
    cur.executescript(sql)

# Safety: see what we have
print("DB:", db)
print("doctors exists:", bool(cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='doctors'").fetchone()))
print("doctors_old exists:", bool(cur.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name='doctors_old'").fetchone()))

# Use a transaction where possible
exec("""
PRAGMA foreign_keys=OFF;
BEGIN;
""")

# 1) appointments
exec("""
CREATE TABLE appointments_new (
    id INTEGER NOT NULL,
    patient_name VARCHAR(120) NOT NULL,
    patient_phone VARCHAR(30),
    doctor_id INTEGER,
    scheduled_at VARCHAR(40) NOT NULL,
    reason VARCHAR(300),
    status VARCHAR(30) NOT NULL,
    created_at DATETIME DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(doctor_id) REFERENCES "doctors" (id)
);

INSERT INTO appointments_new (id, patient_name, patient_phone, doctor_id, scheduled_at, reason, status, created_at)
SELECT id, patient_name, patient_phone, doctor_id, scheduled_at, reason, status, created_at
FROM appointments;

DROP TABLE appointments;
ALTER TABLE appointments_new RENAME TO appointments;
""")

# 2) walkins
exec("""
CREATE TABLE walkins_new (
    id INTEGER NOT NULL,
    patient_name VARCHAR(120) NOT NULL,
    patient_phone VARCHAR(30),
    reason VARCHAR(300),
    assigned_doctor_id INTEGER,
    priority VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL,
    created_at DATETIME DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(assigned_doctor_id) REFERENCES "doctors" (id)
);

INSERT INTO walkins_new (id, patient_name, patient_phone, reason, assigned_doctor_id, priority, status, created_at)
SELECT id, patient_name, patient_phone, reason, assigned_doctor_id, priority, status, created_at
FROM walkins;

DROP TABLE walkins;
ALTER TABLE walkins_new RENAME TO walkins;
""")

# 3) emergencies
exec("""
CREATE TABLE emergencies_new (
    id INTEGER NOT NULL,
    patient_name VARCHAR(120) NOT NULL,
    patient_phone VARCHAR(30),
    triage_level VARCHAR(30) NOT NULL,
    symptoms VARCHAR(500),
    assigned_doctor_id INTEGER,
    status VARCHAR(30) NOT NULL,
    created_at DATETIME DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY(assigned_doctor_id) REFERENCES "doctors" (id)
);

INSERT INTO emergencies_new (id, patient_name, patient_phone, triage_level, symptoms, assigned_doctor_id, status, created_at)
SELECT id, patient_name, patient_phone, triage_level, symptoms, assigned_doctor_id, status, created_at
FROM emergencies;

DROP TABLE emergencies;
ALTER TABLE emergencies_new RENAME TO emergencies;
""")

exec("""
COMMIT;
PRAGMA foreign_keys=ON;
""")

# Verify
for t in ("appointments", "walkins", "emergencies"):
    fks = cur.execute(f"PRAGMA foreign_key_list({t})").fetchall()
    print(t, "FKs:", fks)

con.close()
print("Done.")
