/**
 * server/src/routes/doctor.routes.js
 */

const { Router } = require('express');
const ctrl = require('../controllers/doctor.controller');

const router = Router();

// All doctor routes are public (read-only search)
router.get('/',          ctrl.list);
router.get('/specialties', ctrl.getSpecialties);
router.get('/:id',       ctrl.getOne);
router.get('/:id/slots', ctrl.getSlots);

module.exports = router;
