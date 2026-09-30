/**
 * server/src/controllers/doctor.controller.js
 */

const doctorQ  = require('../db/queries/doctors');
const availQ   = require('../db/queries/availability');
const slotSvc  = require('../services/slot.service');

async function list(req, res, next) {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '20', 10), 50);
    const offset = (parseInt(req.query.page || '1', 10) - 1) * limit;
    const { rows, total } = await doctorQ.searchDoctors({
      search:       req.query.search,
      specialty_id: req.query.specialty_id ? parseInt(req.query.specialty_id, 10) : undefined,
      limit,
      offset,
    });
    res.json({ data: rows, total, page: parseInt(req.query.page || '1', 10), limit });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const doctor = await doctorQ.findById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found', code: 'NOT_FOUND' });

    const availability = await availQ.getAvailability(doctor.id);
    res.json({ ...doctor, availability });
  } catch (err) { next(err); }
}

async function getSlots(req, res, next) {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ error: '`date` query param required (YYYY-MM-DD)', code: 'MISSING_DATE' });

    const slots = await slotSvc.getAvailableSlots(req.params.id, date);
    res.json({ date, doctor_id: req.params.id, slots });
  } catch (err) { next(err); }
}

async function getSpecialties(req, res, next) {
  try {
    const data = await doctorQ.getSpecialties();
    res.json({ data });
  } catch (err) { next(err); }
}

module.exports = { list, getOne, getSlots, getSpecialties };
