/**
 * server/src/config/db.js
 * PostgreSQL connection pool shared across the entire app.
 */

const { Pool } = require('pg');
const env      = require('./env');

const pool = new Pool({
  host:     env.DB_HOST,
  port:     env.DB_PORT,
  database: env.DB_NAME,
  user:     env.DB_USER,
  password: env.DB_PASSWORD,
  // Keep connections alive; adjust for production load
  max:                20,
  idleTimeoutMillis:  30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  // Log pool-level errors without crashing (client already released)
  console.error('[DB] Unexpected pool error:', err.message);
});

/**
 * Run a single query on the pool.
 * @param {string} text   Parameterised SQL string
 * @param {any[]}  params Query parameters
 */
async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[DB] query (${Date.now() - start}ms): ${text.slice(0, 80)}`);
  }
  return result;
}

/**
 * Acquire a dedicated client from the pool for use inside a transaction.
 * Caller is responsible for client.release().
 */
async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, pool };
