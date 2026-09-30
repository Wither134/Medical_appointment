-- Migration 002: specialties and doctors tables

CREATE TABLE specialties (
  id          SERIAL        PRIMARY KEY,
  name        VARCHAR(100)  NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Seed common specialties
INSERT INTO specialties (name, description) VALUES
  ('General Practice',   'Primary care and general health'),
  ('Cardiology',         'Heart and cardiovascular system'),
  ('Dermatology',        'Skin, hair, and nail conditions'),
  ('Neurology',          'Brain and nervous system disorders'),
  ('Orthopedics',        'Bones, joints, and muscles'),
  ('Pediatrics',         'Medical care for children'),
  ('Psychiatry',         'Mental health and behavioral disorders'),
  ('Gynecology',         'Female reproductive health'),
  ('Ophthalmology',      'Eye care and vision'),
  ('ENT',                'Ear, nose, and throat');

CREATE TABLE doctors (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  specialty_id      INTEGER       NOT NULL REFERENCES specialties(id),
  bio               TEXT,
  consultation_fee  NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  years_experience  SMALLINT      NOT NULL DEFAULT 0,
  -- avg rating cached here; updated by app logic, not a live subquery
  avg_rating        NUMERIC(3,2)  NOT NULL DEFAULT 0.00,
  is_available      BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_doctors_specialty ON doctors (specialty_id);
CREATE INDEX idx_doctors_user      ON doctors (user_id);

CREATE TRIGGER trg_doctors_updated_at
  BEFORE UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
