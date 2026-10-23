CREATE TABLE professionals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK(active IN (0,1))
) STRICT;
CREATE TABLE sessions (
  token_hash TEXT PRIMARY KEY,
  professional_id TEXT NOT NULL REFERENCES professionals(id),
  csrf TEXT NOT NULL,
  expires_at INTEGER NOT NULL
) STRICT;
CREATE TABLE patients (
  id TEXT PRIMARY KEY,
  professional_id TEXT NOT NULL REFERENCES professionals(id),
  name TEXT NOT NULL CHECK(length(trim(name)) BETWEEN 3 AND 120),
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  birth_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ATIVO' CHECK(status IN ('ATIVO','INATIVO')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(professional_id,email),
  UNIQUE(professional_id,id)
) STRICT;
CREATE TABLE appointments (
  id TEXT PRIMARY KEY,
  professional_id TEXT NOT NULL REFERENCES professionals(id),
  patient_id TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL CHECK(julianday(ends_at)>julianday(starts_at)),
  status TEXT NOT NULL DEFAULT 'AGENDADO' CHECK(status IN ('AGENDADO','CANCELADO')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  FOREIGN KEY(professional_id,patient_id) REFERENCES patients(professional_id,id)
) STRICT;
CREATE INDEX appointment_schedule ON appointments(professional_id,starts_at);
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  professional_id TEXT NOT NULL REFERENCES professionals(id),
  entity TEXT NOT NULL CHECK(entity IN ('patient','appointment')),
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL,
  before_json TEXT NOT NULL,
  after_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
) STRICT;
CREATE TRIGGER appointment_insert_conflict BEFORE INSERT ON appointments
WHEN NEW.status='AGENDADO' AND EXISTS(
  SELECT 1 FROM appointments WHERE professional_id=NEW.professional_id AND status='AGENDADO'
  AND starts_at<NEW.ends_at AND ends_at>NEW.starts_at
) BEGIN SELECT RAISE(ABORT,'SLOT_CONFLICT'); END;
CREATE TRIGGER appointment_update_conflict BEFORE UPDATE ON appointments
WHEN NEW.status='AGENDADO' AND EXISTS(
  SELECT 1 FROM appointments WHERE id<>NEW.id AND professional_id=NEW.professional_id AND status='AGENDADO'
  AND starts_at<NEW.ends_at AND ends_at>NEW.starts_at
) BEGIN SELECT RAISE(ABORT,'SLOT_CONFLICT'); END;
CREATE TRIGGER appointment_terminal BEFORE UPDATE ON appointments
WHEN OLD.status='CANCELADO'
BEGIN SELECT RAISE(ABORT,'CANCELLED_TERMINAL'); END;
CREATE TRIGGER patient_preserve BEFORE DELETE ON patients
BEGIN SELECT RAISE(ABORT,'LOGICAL_DELETE_ONLY'); END;
CREATE TRIGGER appointment_preserve BEFORE DELETE ON appointments
BEGIN SELECT RAISE(ABORT,'LOGICAL_DELETE_ONLY'); END;
