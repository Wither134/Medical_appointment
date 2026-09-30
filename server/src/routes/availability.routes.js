/**
 * server/src/routes/availability.routes.js
 * All routes require doctor role.
 */

const { Router } = require('express');
const { body }   = require('express-validator');
const ctrl       = require('../controllers/availability.controller');
const auth       = require('../middleware/authenticate');
const authorize  = require('../middleware/authorize');
const validate   = require('../middleware/validate');

const router = Router();
router.use(auth, authorize('doctor'));

router.get('/',          ctrl.getAvailability);
router.put('/',
  [
    body('availability').isArray({ min: 0 }).withMessage('availability must be an array'),
    body('availability.*.day_of_week').isInt({ min: 0, max: 6 }),
    body('availability.*.start_time').matches(/^\d{2}:\d{2}$/).withMessage('start_time must be HH:MM'),
    body('availability.*.end_time').matches(/^\d{2}:\d{2}$/).withMessage('end_time must be HH:MM'),
  ],
  validate, ctrl.putAvailability
);

router.get('/leaves',    ctrl.getLeaves);
router.post('/leaves',
  [
    body('block_date').isISO8601().withMessage('block_date must be a valid date (YYYY-MM-DD)'),
    body('reason').optional().isString().trim(),
  ],
  validate, ctrl.addLeave
);
router.delete('/leaves/:id', ctrl.deleteLeave);

module.exports = router;
