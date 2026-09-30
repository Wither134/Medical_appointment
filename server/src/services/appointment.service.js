/**
 * server/src/services/appointment.service.js
 * Business-logic wrapper around appointment DB operations.
 */

const apptQ  = require('../db/queries/appointments');
const apptDB = require('../db/queries/appointments');
const { APPOINTMENT_STATUS, CANCELLATION_WINDOW_HOURS } = require('../../../shared/constants');

function makeError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

/** Valid status transitions per role */
const ALLOWED_TRANSITIONS = {
  patient: {
    [APPOINTMENT_STATUS.PENDING]:   [APPOINTMENT_STATUS.CANCELLED],
    [APPOINTMENT_STATUS.CONFIRMED]: [APPOINTMENT_STATUS.CANCELLED],
  },
  doctor: {
    [APPOINTMENT_STATUS.PENDING]:   [APPOINTMENT_STATUS.CONFIRMED],
    [APPOINTMENT_STATUS.CONFIRMED]: [APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.NO_SHOW],
  },
  admin: {
    // Admin may force any transition (for dispute resolution)
    [APPOINTMENT_STATUS.PENDING]:   Object.values(APPOINTMENT_STATUS),
    [APPOINTMENT_STATUS.CONFIRMED]: Object.values(APPOINTMENT_STATUS),
    [APPOINTMENT_STATUS.CANCELLED]: Object.values(APPOINTMENT_STATUS),
    [APPOINTMENT_STATUS.COMPLETED]: Object.values(APPOINTMENT_STATUS),
    [APPOINTMENT_STATUS.NO_SHOW]:   Object.values(APPOINTMENT_STATUS),
  },
};

async function patchAppointment(appointmentId, callerId, callerRole, body) {
  const appt = await apptQ.findById(appointmentId);
  if (!appt) throw makeError('Appointment not found', 404, 'NOT_FOUND');

  // Ownership check: patient and doctor can only touch their own appointments
  if (callerRole === 'patient' && appt.patient_id !== callerId) {
    throw makeError('Forbidden', 403, 'FORBIDDEN');
  }
  if (callerRole === 'doctor') {
    // callerId is a user_id; we need the doctor row
    const doctorQ = require('../db/queries/doctors');
    const doctor  = await doctorQ.findByUserId(callerId);
    if (!doctor || appt.doctor_id !== doctor.id) {
      throw makeError('Forbidden', 403, 'FORBIDDEN');
    }
  }

  const updates = {};

  // Handle status transition
  if (body.status) {
    const allowed = ALLOWED_TRANSITIONS[callerRole]?.[appt.status] || [];
    if (!allowed.includes(body.status)) {
      throw makeError(
        `Transition from '${appt.status}' to '${body.status}' is not allowed for role '${callerRole}'`,
        422, 'INVALID_TRANSITION'
      );
    }

    // Cancellation-window check for patients
    if (body.status === APPOINTMENT_STATUS.CANCELLED && callerRole === 'patient') {
      const hoursUntil = (new Date(appt.slot_start) - new Date()) / 36e5;
      if (hoursUntil < CANCELLATION_WINDOW_HOURS) {
        throw makeError(
          `Cancellations must be made at least ${CANCELLATION_WINDOW_HOURS} hours in advance`,
          422, 'CANCELLATION_WINDOW'
        );
      }
      updates.cancelled_at  = new Date().toISOString();
      updates.cancel_reason = body.cancel_reason || null;
    }

    updates.status = body.status;

    // Cancel pending reminders when appointment is cancelled
    if (body.status === APPOINTMENT_STATUS.CANCELLED) {
      await apptDB.cancelReminders(appointmentId);
    }
  }

  if (body.doctor_notes !== undefined) updates.doctor_notes = body.doctor_notes;

  const updated = await apptQ.updateAppointment(appointmentId, updates);
  return updated;
}

module.exports = { patchAppointment };
