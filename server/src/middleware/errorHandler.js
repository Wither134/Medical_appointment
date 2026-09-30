/**
 * server/src/middleware/errorHandler.js
 * Global Express error handler. Must be registered last in app.js.
 * Formats all unhandled errors into a consistent JSON envelope.
 */

module.exports = function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // PostgreSQL unique-violation → 409 Conflict
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry — resource already exists', code: 'DUPLICATE' });
  }

  // PostgreSQL FK violation
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referenced resource does not exist', code: 'FK_VIOLATION' });
  }

  // Application-level errors thrown with a statusCode property
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
      code:  err.code || 'APP_ERROR',
    });
  }

  // Never leak stack traces in production
  const isDev = process.env.NODE_ENV === 'development';
  console.error('[ERROR]', err);

  return res.status(500).json({
    error: 'An unexpected error occurred',
    code:  'INTERNAL_ERROR',
    ...(isDev && { detail: err.message }),
  });
};
