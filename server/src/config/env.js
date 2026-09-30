/**
 * server/src/config/env.js
 * Centralised, validated environment variable access.
 * Fail fast at startup if required vars are missing.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

function required(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required environment variable: ${name}`);
  return val;
}

module.exports = {
  PORT:                    parseInt(process.env.PORT || '5000', 10),
  NODE_ENV:                process.env.NODE_ENV || 'development',

  DB_HOST:                 required('DB_HOST'),
  DB_PORT:                 parseInt(process.env.DB_PORT || '5432', 10),
  DB_NAME:                 required('DB_NAME'),
  DB_USER:                 required('DB_USER'),
  DB_PASSWORD:             required('DB_PASSWORD'),

  JWT_ACCESS_SECRET:       required('JWT_ACCESS_SECRET'),
  JWT_REFRESH_SECRET:      required('JWT_REFRESH_SECRET'),
  JWT_ACCESS_EXPIRES_IN:   process.env.JWT_ACCESS_EXPIRES_IN  || '15m',
  JWT_REFRESH_EXPIRES_IN:  process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  CORS_ORIGINS: (process.env.CORS_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map(s => s.trim()),
};
