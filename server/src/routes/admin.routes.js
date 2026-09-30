/**
 * server/src/routes/admin.routes.js
 */

const { Router } = require('express');
const { body }   = require('express-validator');
const ctrl       = require('../controllers/admin.controller');
const auth       = require('../middleware/authenticate');
const authorize  = require('../middleware/authorize');
const validate   = require('../middleware/validate');

const router = Router();
router.use(auth, authorize('admin'));

router.get('/users',           ctrl.listUsers);
router.patch('/users/:id',
  [body('is_active').isBoolean()],
  validate, ctrl.setUserActive
);

router.post('/doctors',
  [
    body('user_id').isUUID(),
    body('specialty_id').isInt({ min: 1 }),
    body('consultation_fee').isFloat({ min: 0 }),
    body('years_experience').isInt({ min: 0 }),
  ],
  validate, ctrl.createDoctor
);

router.get('/appointments',    ctrl.listAllAppointments);
router.get('/reports/summary', ctrl.getSummary);

module.exports = router;
