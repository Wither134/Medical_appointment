/**
 * server/src/app.js
 * Express application factory — separated from server.js so it can
 * be imported cleanly in tests without starting the HTTP server.
 */

const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const env          = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Route modules
const authRoutes         = require('./routes/auth.routes');
const doctorRoutes       = require('./routes/doctor.routes');
const availabilityRoutes = require('./routes/availability.routes');
const appointmentRoutes  = require('./routes/appointment.routes');
const adminRoutes        = require('./routes/admin.routes');

const app = express();

// ── Security & logging ──────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin:      env.CORS_ORIGINS,
  credentials: true,
}));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ── Body parsing ────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

// ── Health check ────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── API Routes ──────────────────────────────────────────────────
app.use('/api/auth',          authRoutes);
app.use('/api/doctors',       doctorRoutes);
app.use('/api/availability',  availabilityRoutes);
app.use('/api/appointments',  appointmentRoutes);
app.use('/api/admin',         adminRoutes);

// ── 404 handler ─────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Route not found', code: 'NOT_FOUND' }));

// ── Global error handler (must be last) ─────────────────────────
app.use(errorHandler);

module.exports = app;
