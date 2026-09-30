/**
 * server/src/controllers/availability.controller.js
 */

const availQ  = require('../db/queries/availability');
const doctorQ = require('../db/queries/doctors');

/** Helper: get doctor row from the logged-in user */
async function getDoctorOrFail(userId, res) {
  const doctor = await doctorQ.findByUserId(userId);
  if (!doctor) {
    res.status(404).json({ error: 'Doctor profile not found', code: 'NOT_FOUND' });
    return null;
  }
  return doctor;
}

async function getAvailability(req, res, next) {
  try {
    const doctor = await getDoctorOrFail(req.user.id, res);
    if (!doctor) return;
    const availability = await availQ.getAvailability(doctor.id);
    res.json({ availability });
  } catch (err) { next(err); }
}

async function putAvailability(req, res, next) {
  try {
    const doctor = await getDoctorOrFail(req.user.id, res);
    if (!doctor) return;
    const updated = await availQ.replaceAvailability(doctor.id, req.body.availability);
    res.json({ availability: updated });
  } catch (err) { next(err); }
}

async function getLeaves(req, res, next) {
  try {
    const doctor = await getDoctorOrFail(req.user.id, res);
    if (!doctor) return;
    const leaves = await availQ.getLeaves(doctor.id);
    res.json({ leaves });
  } catch (err) { next(err); }
}

async function addLeave(req, res, next) {
  try {
    const doctor = await getDoctorOrFail(req.user.id, res);
    if (!doctor) return;

    // Reject past dates
    if (new Date(req.body.block_date) < new Date(new Date().toISOString().slice(0,10))) {
      return res.status(400).json({ error: 'Cannot block a past date', code: 'PAST_DATE' });
    }

    const leave = await availQ.addLeave(doctor.id, req.body);
    res.status(201).json(leave);
  } catch (err) { next(err); }
}

async function deleteLeave(req, res, next) {
  try {
    const doctor = await getDoctorOrFail(req.user.id, res);
    if (!doctor) return;
    const deleted = await availQ.deleteLeave(doctor.id, req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Leave block not found', code: 'NOT_FOUND' });
    res.sendStatus(204);
  } catch (err) { next(err); }
}

module.exports = { getAvailability, putAvailability, getLeaves, addLeave, deleteLeave };
