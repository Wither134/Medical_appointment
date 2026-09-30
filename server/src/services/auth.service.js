/**
 * server/src/services/auth.service.js
 * Handles registration, login, token issuance, and refresh.
 */

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const env    = require('../config/env');
const userQ  = require('../db/queries/users');

const SALT_ROUNDS = 12;

// Simple in-memory refresh token store (good enough for a prototype).
// In production, persist to a `refresh_tokens` DB table or Redis.
const refreshTokenStore = new Set();

function makeError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function signAccess(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN }
  );
}

function signRefresh(user) {
  const token = jwt.sign(
    { sub: user.id, role: user.role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN }
  );
  refreshTokenStore.add(token);
  return token;
}

async function register({ full_name, email, password, phone }) {
  const existing = await userQ.findByEmail(email);
  if (existing) throw makeError('Email already registered', 409, 'EMAIL_TAKEN');

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await userQ.createUser({ full_name, email, password_hash, phone });

  return {
    user,
    access_token:  signAccess(user),
    refresh_token: signRefresh(user),
  };
}

async function login({ email, password }) {
  const user = await userQ.findByEmail(email);
  if (!user) throw makeError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  if (!user.is_active) throw makeError('Account is inactive', 403, 'ACCOUNT_INACTIVE');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw makeError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

  // Strip hash before returning
  const { password_hash: _, ...safeUser } = user;

  return {
    user: safeUser,
    access_token:  signAccess(user),
    refresh_token: signRefresh(user),
  };
}

function refresh(token) {
  if (!refreshTokenStore.has(token)) {
    throw makeError('Invalid or revoked refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    return { access_token: signAccess({ id: payload.sub, role: payload.role }) };
  } catch {
    throw makeError('Refresh token expired or invalid', 401, 'INVALID_REFRESH_TOKEN');
  }
}

function logout(token) {
  refreshTokenStore.delete(token);
}

module.exports = { register, login, refresh, logout };
