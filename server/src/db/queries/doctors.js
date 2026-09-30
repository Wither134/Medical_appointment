/**
 * server/src/db/queries/doctors.js
 * Named SQL functions for doctors + specialties.
 */

const db = require('../../config/db');

/** Full doctor profile joined with specialty and user */
async function findById(id) {
  const { rows } = await db.query(
    `SELECT d.id, u.full_name, u.email, u.phone,
            s.id AS specialty_id, s.name AS specialty_name,
            d.bio, d.consultation_fee, d.years_experience,
            d.avg_rating, d.is_available
       FROM doctors d
       JOIN users      u ON u.id = d.user_id
       JOIN specialties s ON s.id = d.specialty_id
      WHERE d.id = $1`,
    [id]
  );
  return rows[0] || null;
}

/** Find the doctor row for a given user_id */
async function findByUserId(user_id) {
  const { rows } = await db.query(
    `SELECT d.id, d.user_id, d.specialty_id, d.bio,
            d.consultation_fee, d.years_experience, d.avg_rating, d.is_available
       FROM doctors d WHERE d.user_id = $1`,
    [user_id]
  );
  return rows[0] || null;
}

/** Paginated doctor search */
async function searchDoctors({ search, specialty_id, limit, offset }) {
  const conditions = ['1=1', 'd.is_available = TRUE', 'u.is_active = TRUE'];
  const params     = [];
  let   p          = 1;

  if (specialty_id) { conditions.push(`d.specialty_id = $${p++}`); params.push(specialty_id); }
  if (search) {
    conditions.push(`(u.full_name ILIKE $${p} OR s.name ILIKE $${p})`);
    params.push(`%${search}%`);
    p++;
  }

  params.push(limit, offset);
  const countRes = await db.query(
    `SELECT COUNT(*) FROM doctors d
       JOIN users u ON u.id = d.user_id
       JOIN specialties s ON s.id = d.specialty_id
      WHERE ${conditions.join(' AND ')}`,
    params.slice(0, p - 1)
  );
  const { rows } = await db.query(
    `SELECT d.id, u.full_name, s.name AS specialty,
            d.bio, d.consultation_fee, d.years_experience, d.avg_rating, d.is_available
       FROM doctors d
       JOIN users u ON u.id = d.user_id
       JOIN specialties s ON s.id = d.specialty_id
      WHERE ${conditions.join(' AND ')}
      ORDER BY d.avg_rating DESC
      LIMIT $${p} OFFSET $${p + 1}`,
    params
  );
  return { rows, total: parseInt(countRes.rows[0].count, 10) };
}

/** Create a new doctor profile */
async function createDoctor({ user_id, specialty_id, bio, consultation_fee, years_experience }) {
  const { rows } = await db.query(
    `INSERT INTO doctors (user_id, specialty_id, bio, consultation_fee, years_experience)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user_id, specialty_id, bio || null, consultation_fee || 0, years_experience || 0]
  );
  return rows[0];
}

/** Get all specialties */
async function getSpecialties() {
  const { rows } = await db.query('SELECT id, name, description FROM specialties ORDER BY name');
  return rows;
}

module.exports = { findById, findByUserId, searchDoctors, createDoctor, getSpecialties };
