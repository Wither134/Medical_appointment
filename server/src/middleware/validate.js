/**
 * server/src/middleware/validate.js
 * Reads express-validator results and returns 400 on any errors.
 * Place after validation chains: router.post('/', [...rules], validate, handler)
 */

const { validationResult } = require('express-validator');

module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      code:  'VALIDATION_ERROR',
      // Array of { field, message } objects — safe to expose to client
      fields: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};
