/**
 * server/src/controllers/admin.controller.js
 */

const userQ    = require('../db/queries/users');
const doctorQ  = require('../db/queries/doctors');
const apptQ    = require('../db/queries/appointments');

async function listUsers(req, res, next) {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '20', 10), 50);
    const offset = (parseInt(req.query.page || '1', 10) - 1) * limit;
    const { rows, total } = await userQ.listUsers({
      role:   req.query.role,
      search: req.query.search,
      limit,
      offset,
    });
    res.json({ data: rows, total, page: parseInt(req.query.page || '1', 10), limit });
  } catch (err) { next(err); }
}

async function setUserActive(req, res, next) {
  try {
    const user = await userQ.setActive(req.params.id, req.body.is_active);
    if (!user) return res.status(404).json({ error: 'User not found', code: 'NOT_FOUND' });
    res.json(user);
  } catch (err) { next(err); }
}

async function createDoctor(req, res, next) {
  try {
    const doctor = await doctorQ.createDoctor(req.body);
    res.status(201).json(doctor);
  } catch (err) { next(err); }
}

async function listAllAppointments(req, res, next) {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '20', 10), 50);
    const offset = (parseInt(req.query.page || '1', 10) - 1) * limit;
    const { rows, total } = await apptQ.listAppointments({
      patient_id: req.query.patient_id,
      doctor_id:  req.query.doctor_id,
      status:     req.query.status,
      from:       req.query.from,
      to:         req.query.to,
      limit,
      offset,
    });
    res.json({ data: rows, total, page: parseInt(req.query.page || '1', 10), limit });
  } catch (err) { next(err); }
}

async function getSummary(req, res, next) {
  try {
    const stats = await apptQ.getSummaryStats();
    res.json(stats);
  } catch (err) { next(err); }
}

module.exports = { listUsers, setUserActive, createDoctor, listAllAppointments, getSummary };
