-- Migration 003: doctor availability and leave blocks

-- Weekly recurring availability windows per doctor.
-- day_of_week: 0 = Sunday … 6 = Saturday (matches JS Date.getDay()).
CREATE TABLE doctor_availability (
  id           SERIAL      PRIMARY KEY,
  doctor_id    UUID        NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  day_of_week  SMALLINT    NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time   TIME        NOT NULL,
  end_time     TIME        NOT NULL,
  is_active    BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A doctor can only have one availability window per weekday.
  -- To model split shifts (e.g. 9–12 and 14–18) add a second row.
  CONSTRAINT chk_time_order CHECK (end_time > start_time),
  CONSTRAINT uq_doctor_day  UNIQUE (doctor_id, day_of_week)
);

CREATE INDEX idx_availability_doctor ON doctor_availability (doctor_id);

CREATE TRIGGER trg_availability_updated_at
  BEFORE UPDATE ON doctor_availability
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------
-- Full-day leave blocks (doctor marks a specific date as off).
-- Appointment booking checks this table before offering slots.
-- ---------------------------------------------------------------
CREATE TABLE leave_blocks (
  id          SERIAL      PRIMARY KEY,
  doctor_id   UUID        NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  block_date  DATE        NOT NULL,
  reason      VARCHAR(255),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_leave_block UNIQUE (doctor_id, block_date)
);

CREATE INDEX idx_leave_doctor ON leave_blocks (doctor_id);
