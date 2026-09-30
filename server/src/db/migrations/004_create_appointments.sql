-- Migration 004: appointments table
-- Core transactional table. Race conditions are handled at the
-- application layer via SELECT … FOR UPDATE within a transaction.

CREATE TYPE appointment_status AS ENUM (
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show'
);

CREATE TABLE appointments (
  id             UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id     UUID               NOT NULL REFERENCES users(id),
  doctor_id      UUID               NOT NULL REFERENCES doctors(id),

  -- Stored in UTC. slot_end = slot_start + 30 minutes (enforced by app).
  slot_start     TIMESTAMPTZ        NOT NULL,
  slot_end       TIMESTAMPTZ        NOT NULL,

  status         appointment_status NOT NULL DEFAULT 'pending',

  -- Patient's reason for visiting (optional)
  reason         TEXT,

  -- Doctor fills this after the appointment
  doctor_notes   TEXT,

  booked_at      TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  cancelled_at   TIMESTAMPTZ,
  cancel_reason  VARCHAR(255),

  created_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ        NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_slot_order   CHECK (slot_end > slot_start),
  CONSTRAINT chk_cancel_time  CHECK (
    cancelled_at IS NULL OR status = 'cancelled'
  ),

  -- THE key uniqueness constraint: prevents double-booking at the DB level
  -- as a second line of defence after the app-level lock.
  CONSTRAINT uq_doctor_slot UNIQUE (doctor_id, slot_start)
);

CREATE INDEX idx_appt_patient    ON appointments (patient_id);
CREATE INDEX idx_appt_doctor     ON appointments (doctor_id);
CREATE INDEX idx_appt_slot_start ON appointments (slot_start);
CREATE INDEX idx_appt_status     ON appointments (status);

-- Composite index for the most common dashboard query:
-- "give me all non-cancelled appointments for doctor X on date Y"
CREATE INDEX idx_appt_doctor_status ON appointments (doctor_id, status, slot_start);

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
