/**
 * server/src/db/queries/appointments.js
 * Named SQL for the appointments + reminders tables.
 */

const db = require('../../config/db');

// ── Core appointment queries ───────────────────────────────────

async function findById(id) {
  const { rows } = await db.query(
    `SELECT a.id, a.patient_id, a.doctor_id,
            a.slot_start, a.slot_end, a.status,
            a.reason, a.doctor_notes,
            a.booked_at, a.cancelled_at, a.cancel_reason,
            a.created_at, a.updated_at,
            p.full_name  AS patient_name,
            p.email      AS patient_email,
            p.phone      AS patient_phone,
            d_user.full_name  AS doctor_name,
            s.name            AS specialty
       FROM appointments a
       JOIN users       p      ON p.id = a.patient_id
       JOIN doctors     d      ON d.id = a.doctor_id
       JOIN users       d_user ON d_user.id = d.user_id
       JOIN specialties s      ON s.id = d.specialty_id
      WHERE a.id = $1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * List appointments with flexible filters.
 * role determines base scoping (patient / doctor / admin).
 */
async function listAppointments({ patient_id, doctor_id, status, from, to, limit, offset }) {
  const conditions = ['1=1'];
  const params     = [];
  let   p          = 1;

  if (patient_id) { conditions.push(`a.patient_id = $${p++}`); params.push(patient_id); }
  if (doctor_id)  { conditions.push(`a.doctor_id  = $${p++}`); params.push(doctor_id);  }
  if (status)     { conditions.push(`a.status     = $${p++}`); params.push(status);     }
  if (from)       { conditions.push(`a.slot_start >= $${p++}`); params.push(from);      }
  if (to)         { conditions.push(`a.slot_start <= $${p++}`); params.push(to);        }

  params.push(limit, offset);

  const countRes = await db.query(
    `SELECT COUNT(*) FROM appointments a WHERE ${conditions.join(' AND ')}`,
    params.slice(0, p - 1)
  );
  const { rows } = await db.query(
    `SELECT a.id, a.patient_id, a.doctor_id,
            a.slot_start, a.slot_end, a.status, a.reason,
            a.booked_at, a.cancelled_at,
            p.full_name       AS patient_name,
            d_user.full_name  AS doctor_name,
            s.name            AS specialty
       FROM appointments a
       JOIN users       p      ON p.id = a.patient_id
       JOIN doctors     d      ON d.id = a.doctor_id
       JOIN users       d_user ON d_user.id = d.user_id
       JOIN specialties s      ON s.id = d.specialty_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY a.slot_start DESC
      LIMIT $${p} OFFSET $${p + 1}`,
    params
  );
  return { rows, total: parseInt(countRes.rows[0].count, 10) };
}

/**
 * Insert a new appointment row (called inside a transaction from slot.service.js).
 * client is a pg PoolClient already inside a transaction.
 */
async function createAppointment(client, { patient_id, doctor_id, slot_start, slot_end, reason }) {
  const { rows } = await client.query(
    `INSERT INTO appointments (patient_id, doctor_id, slot_start, slot_end, reason)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, patient_id, doctor_id, slot_start, slot_end, status, reason, booked_at`,
    [patient_id, doctor_id, slot_start, slot_end, reason || null]
  );
  return rows[0];
}

/** Update status (and optional extra fields) */
async function updateAppointment(id, fields) {
  // Build SET clause dynamically from provided fields
  const allowed = ['status', 'doctor_notes', 'cancelled_at', 'cancel_reason'];
  const sets    = [];
  const params  = [];
  let   p       = 1;

  for (const key of allowed) {
    if (key in fields) {
      sets.push(`${key} = $${p++}`);
      params.push(fields[key]);
    }
  }

  if (sets.length === 0) return null;

  params.push(id);
  const { rows } = await db.query(
    `UPDATE appointments SET ${sets.join(', ')} WHERE id = $${p} RETURNING *`,
    params
  );
  return rows[0] || null;
}

/**
 * Lock the slot row for a given doctor + slot_start inside a transaction.
 * Returns the existing appointment (if any) so the caller can decide.
 */
async function lockSlot(client, doctor_id, slot_start) {
  const { rows } = await client.query(
    `SELECT id, status FROM appointments
      WHERE doctor_id = $1 AND slot_start = $2
      FOR UPDATE`,
    [doctor_id, slot_start]
  );
  return rows[0] || null;
}

// ── Reminder queries ───────────────────────────────────────────

async function createReminder(client, { appointment_id, scheduled_at, type = 'email' }) {
  const { rows } = await client.query(
    `INSERT INTO reminders (appointment_id, scheduled_at, type)
     VALUES ($1, $2, $3) RETURNING id`,
    [appointment_id, scheduled_at, type]
  );
  return rows[0];
}

/** Cancel any pending reminders for an appointment */
async function cancelReminders(appointment_id) {
  await db.query(
    `UPDATE reminders SET status = 'skipped'
      WHERE appointment_id = $1 AND status = 'pending'`,
    [appointment_id]
  );
}

// ── Admin report query ─────────────────────────────────────────

async function getSummaryStats() {
  const { rows } = await db.query(`
    SELECT
      (SELECT COUNT(*) FROM appointments)                       AS total_appointments,
      (SELECT COUNT(*) FROM appointments
         WHERE slot_start >= date_trunc('week', NOW()))         AS appointments_this_week,
      (SELECT COUNT(*) FROM doctors)                            AS total_doctors,
      (SELECT COUNT(*) FROM users WHERE role = 'patient')       AS total_patients,
      json_object_agg(status, cnt) AS by_status
    FROM (
      SELECT status, COUNT(*) AS cnt
        FROM appointments GROUP BY status
    ) sub
  `);
  return rows[0];
}

module.exports = {
  findById,
  listAppointments,
  createAppointment,
  updateAppointment,
  lockSlot,
  createReminder,
  cancelReminders,
  getSummaryStats,
};
