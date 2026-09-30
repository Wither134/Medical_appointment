-- Migration 005: reminders table
-- One reminder row is created per appointment at booking time.
-- A background job (cron / pg_cron / external scheduler) picks up
-- rows where status='pending' AND scheduled_at <= NOW() and sends them.

CREATE TYPE reminder_type   AS ENUM ('email', 'sms');
CREATE TYPE reminder_status AS ENUM ('pending', 'sent', 'failed', 'skipped');

CREATE TABLE reminders (
  id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id  UUID            NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  type            reminder_type   NOT NULL DEFAULT 'email',
  -- scheduled 24 hours before slot_start (set at booking time)
  scheduled_at    TIMESTAMPTZ     NOT NULL,
  sent_at         TIMESTAMPTZ,
  status          reminder_status NOT NULL DEFAULT 'pending',
  error_message   TEXT,           -- populated on failure
  created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_appointment ON reminders (appointment_id);
-- Index used by the background job to find due reminders efficiently
CREATE INDEX idx_reminders_pending
  ON reminders (scheduled_at)
  WHERE status = 'pending';
