/**
 * server/server.js
 * HTTP server entry point.
 */

const app = require('./src/app');
const env = require('./src/config/env');
const { pool } = require('./src/config/db');

async function start() {
  // Verify DB connectivity before accepting traffic
  try {
    await pool.query('SELECT 1');
    console.log('[DB] Connected to PostgreSQL');
  } catch (err) {
    console.error('[DB] Cannot connect to PostgreSQL:', err.message);
    process.exit(1);
  }

  app.listen(env.PORT, () => {
    console.log(`[Server] Running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
  });
}

start();
