/**
 * server/src/db/queries/availability.js
 * Named SQL for doctor_availability and leave_blocks.
 */

const db = require('../../config/db');

// ── Weekly availability ────────────────────────────────────────

async function getAvailability(doctor_id) {
  const { rows } = await db.query(
    `SELECT id, day_of_week,
            to_char(start_time, 'HH24:MI') AS start_time,
            to_char(end_time,   'HH24:MI') AS end_time,
            is_active
       FROM doctor_availability
      WHERE doctor_id = $1
      ORDER BY day_of_week`,
    [doctor_id]
  );
  return rows;
}

/**
 * Replace a doctor's entire weekly availability in one transaction.
 * Deletes existing rows first, then inserts the new set.
 */
async function replaceAvailability(doctor_id, slots) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM doctor_availability WHERE doctor_id = $1', [doctor_id]);

    const inserted = [];
    for (const slot of slots) {
      const { rows } = await client.query(
        `INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time)
         VALUES ($1, $2, $3, $4)
         RETURNING id, day_of_week,
                   to_char(start_time, 'HH24:MI') AS start_time,
                   to_char(end_time,   'HH24:MI') AS end_time, is_active`,
        [doctor_id, slot.day_of_week, slot.start_time, slot.end_time]
      );
      inserted.push(rows[0]);
    }

    await client.query('COMMIT');
    return inserted;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ── Leave blocks ───────────────────────────────────────────────

async function getLeaves(doctor_id) {
  const { rows } = await db.query(
    `SELECT id, block_date::text, reason
       FROM leave_blocks
      WHERE doctor_id = $1
      ORDER BY block_date`,
    [doctor_id]
  );
  return rows;
}

async function addLeave(doctor_id, { block_date, reason }) {
  const { rows } = await db.query(
    `INSERT INTO leave_blocks (doctor_id, block_date, reason)
     VALUES ($1, $2, $3)
     RETURNING id, block_date::text, reason`,
    [doctor_id, block_date, reason || null]
  );
  return rows[0];
}

async function deleteLeave(doctor_id, leave_id) {
  const { rowCount } = await db.query(
    'DELETE FROM leave_blocks WHERE id = $1 AND doctor_id = $2',
    [leave_id, doctor_id]
  );
  return rowCount > 0;
}

/**
 * Check whether a doctor has a leave block on a given date (YYYY-MM-DD).
 */
async function hasLeaveOnDate(doctor_id, date) {
  const { rows } = await db.query(
    `SELECT 1 FROM leave_blocks WHERE doctor_id = $1 AND block_date = $2::date`,
    [doctor_id, date]
  );
  return rows.length > 0;
}

module.exports = {
  getAvailability,
  replaceAvailability,
  getLeaves,
  addLeave,
  deleteLeave,
  hasLeaveOnDate,
};
