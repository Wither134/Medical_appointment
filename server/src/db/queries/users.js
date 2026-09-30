/**
 * server/src/db/queries/users.js
 * Named SQL functions for the users table.
 */

const db = require('../../config/db');

/** Find a user by email — used during login */
async function findByEmail(email) {
  const { rows } = await db.query(
    'SELECT id, full_name, email, password_hash, role, phone, is_active FROM users WHERE email = $1',
    [email]
  );
  return rows[0] || null;
}

/** Find a user by id — used for /auth/me */
async function findById(id) {
  const { rows } = await db.query(
    'SELECT id, full_name, email, role, phone, is_active, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
}

/** Create a new user row */
async function createUser({ full_name, email, password_hash, role = 'patient', phone }) {
  const { rows } = await db.query(
    `INSERT INTO users (full_name, email, password_hash, role, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, role, phone`,
    [full_name, email, password_hash, role, phone || null]
  );
  return rows[0];
}

/** Toggle is_active (admin use) */
async function setActive(id, is_active) {
  const { rows } = await db.query(
    `UPDATE users SET is_active = $2 WHERE id = $1
     RETURNING id, full_name, email, role, is_active`,
    [id, is_active]
  );
  return rows[0] || null;
}

/** Paginated user list for admin */
async function listUsers({ role, search, limit, offset }) {
  const conditions = ['1=1'];
  const params     = [];
  let   p          = 1;

  if (role)   { conditions.push(`role = $${p++}`);                   params.push(role); }
  if (search) { conditions.push(`full_name ILIKE $${p++}`);          params.push(`%${search}%`); }

  params.push(limit, offset);
  const countRes = await db.query(
    `SELECT COUNT(*) FROM users WHERE ${conditions.join(' AND ')}`,
    params.slice(0, p - 1)
  );
  const { rows } = await db.query(
    `SELECT id, full_name, email, role, phone, is_active, created_at
       FROM users WHERE ${conditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT $${p} OFFSET $${p + 1}`,
    params
  );
  return { rows, total: parseInt(countRes.rows[0].count, 10) };
}

module.exports = { findByEmail, findById, createUser, setActive, listUsers };
