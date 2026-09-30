/**
 * server/src/controllers/appointment.controller.js
 */

const slotSvc  = require('../services/slot.service');
const apptSvc  = require('../services/appointment.service');
const apptQ    = require('../db/queries/appointments');
const doctorQ  = require('../db/queries/doctors');

async function book(req, res, next) {
  try {
    const { doctor_id, slot_start, reason } = req.body;
    const appt = await slotSvc.bookSlot({
      patientId: req.user.id,
      doctorId:  doctor_id,
      slotStart: slot_start,
      reason,
    });
    res.status(201).json(appt);
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const limit  = Math.min(parseInt(req.query.limit  || '20', 10), 50);
    const offset = (parseInt(req.query.page || '1', 10) - 1) * limit;

    // Scope by role
    let patient_id, doctor_id;
    if (req.user.role === 'patient') {
      patient_id = req.user.id;
    } else if (req.user.role === 'doctor') {
      const doctor = await doctorQ.findByUserId(req.user.id);
      doctor_id    = doctor?.id;
    } else {
      // Admin: accept optional filter params
      patient_id = req.query.patient_id;
      doctor_id  = req.query.doctor_id;
    }

    const { rows, total } = await apptQ.listAppointments({
      patient_id,
      doctor_id,
      status: req.query.status,
      from:   req.query.from,
      to:     req.query.to,
      limit,
      offset,
    });
    res.json({ data: rows, total, page: parseInt(req.query.page || '1', 10), limit });
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const appt = await apptQ.findById(req.params.id);
    if (!appt) return res.status(404).json({ error: 'Appointment not found', code: 'NOT_FOUND' });

    // Ownership: patient or doctor must be the party in the appointment
    if (req.user.role === 'patient' && appt.patient_id !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
    }
    if (req.user.role === 'doctor') {
      const doctor = await doctorQ.findByUserId(req.user.id);
      if (!doctor || appt.doctor_id !== doctor.id) {
        return res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      }
    }
    res.json(appt);
  } catch (err) { next(err); }
}

async function patch(req, res, next) {
  try {
    const updated = await apptSvc.patchAppointment(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    res.json(updated);
  } catch (err) { next(err); }
}

async function reschedule(req, res, next) {
  try {
    const updated = await slotSvc.rescheduleSlot({
      appointmentId: req.params.id,
      patientId:     req.user.id,
      newSlotStart:  req.body.slot_start,
    });
    res.json(updated);
  } catch (err) { next(err); }
}

module.exports = { book, list, getOne, patch, reschedule };
