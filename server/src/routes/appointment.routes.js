/**
 * server/src/routes/appointment.routes.js
 */

const { Router } = require('express');
const { body }   = require('express-validator');
const ctrl       = require('../controllers/appointment.controller');
const auth       = require('../middleware/authenticate');
const authorize  = require('../middleware/authorize');
const validate   = require('../middleware/validate');

const router = Router();
router.use(auth);

// Book — patient only
router.post('/',
  authorize('patient'),
  [
    body('doctor_id').isUUID().withMessage('Valid doctor_id UUID required'),
    body('slot_start').isISO8601().withMessage('Valid ISO 8601 slot_start required'),
    body('reason').optional().isString().trim().isLength({ max: 500 }),
  ],
  validate, ctrl.book
);

// List — all roles (scoped internally)
router.get('/', authorize('patient', 'doctor', 'admin'), ctrl.list);

// Single appointment
router.get('/:id', authorize('patient', 'doctor', 'admin'), ctrl.getOne);

// Patch status / notes
router.patch('/:id',
  authorize('patient', 'doctor', 'admin'),
  [
    body('status').optional().isString(),
    body('cancel_reason').optional().isString().trim(),
    body('doctor_notes').optional().isString().trim(),
  ],
  validate, ctrl.patch
);

// Reschedule — patient only
router.patch('/:id/reschedule',
  authorize('patient'),
  [body('slot_start').isISO8601().withMessage('Valid ISO 8601 slot_start required')],
  validate, ctrl.reschedule
);

module.exports = router;
