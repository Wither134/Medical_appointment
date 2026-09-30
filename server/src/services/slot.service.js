/**
 * server/src/services/slot.service.js
 *
 * Core booking logic:
 *   1. Generate available slots for a doctor on a given date.
 *   2. Book a slot with row-level locking to prevent double-booking.
 *   3. Reschedule (cancel + rebook atomically).
 */

const db           = require('../config/db');
const availQ       = require('../db/queries/availability');
const apptQ        = require('../db/queries/appointments');
const reminderSvc  = require('./reminder.service');
const { SLOT_DURATION_MINUTES, APPOINTMENT_STATUS } = require('../../../shared/constants');

function makeError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

/**
 * Parse a "HH:MM" string and set it on a Date object, returning a new Date.
 */
function setTime(date, timeStr) {
  const [h, m]  = timeStr.split(':').map(Number);
  const d       = new Date(date);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

/**
 * Generate all 30-min slot start times within a window [windowStart, windowEnd).
 */
function generateSlotStarts(windowStart, windowEnd) {
  const slots = [];
  const step  = SLOT_DURATION_MINUTES * 60 * 1000;
  let   cur   = windowStart.getTime();
  while (cur + step <= windowEnd.getTime()) {
    slots.push(new Date(cur));
    cur += step;
  }
  return slots;
}

/**
 * Returns available (unbooked) slots for doctorId on dateStr (YYYY-MM-DD).
 */
async function getAvailableSlots(doctorId, dateStr) {
  // 1. Parse the requested date as UTC midnight
  const requestedDate = new Date(`${dateStr}T00:00:00Z`);
  const now           = new Date();

  // Reject past dates
  if (requestedDate < new Date(now.toISOString().slice(0, 10) + 'T00:00:00Z')) {
    throw makeError('Cannot query slots for a past date', 400, 'PAST_DATE');
  }

  // 2. Check leave blocks
  const onLeave = await availQ.hasLeaveOnDate(doctorId, dateStr);
  if (onLeave) return [];

  // 3. Get the doctor's availability for this weekday (0=Sun … 6=Sat)
  const dayOfWeek     = requestedDate.getUTCDay();
  const availRows     = await availQ.getAvailability(doctorId);
  const todayWindow   = availRows.find(r => r.day_of_week === dayOfWeek && r.is_active);
  if (!todayWindow) return [];

  // 4. Build all possible slot starts
  const windowStart = setTime(requestedDate, todayWindow.start_time);
  const windowEnd   = setTime(requestedDate, todayWindow.end_time);
  const allStarts   = generateSlotStarts(windowStart, windowEnd);

  // 5. Fetch already-booked slots for that day (exclude cancelled)
  const { rows: booked } = await db.query(
    `SELECT slot_start FROM appointments
      WHERE doctor_id  = $1
        AND slot_start >= $2
        AND slot_start <  $3
        AND status NOT IN ('cancelled')`,
    [doctorId, windowStart.toISOString(), windowEnd.toISOString()]
  );
  const bookedSet = new Set(booked.map(r => new Date(r.slot_start).getTime()));

  // 6. Filter out booked and past slots
  const nowMs = Date.now();
  return allStarts
    .filter(s => !bookedSet.has(s.getTime()) && s.getTime() > nowMs)
    .map(s => ({
      start: s.toISOString(),
      end:   new Date(s.getTime() + SLOT_DURATION_MINUTES * 60 * 1000).toISOString(),
    }));
}

/**
 * Book a slot for a patient.
 * Uses SELECT … FOR UPDATE inside a transaction to prevent race conditions.
 */
async function bookSlot({ patientId, doctorId, slotStart, reason }) {
  const slotStartDate = new Date(slotStart);
  const slotEndDate   = new Date(slotStartDate.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

  // Reject booking in the past
  if (slotStartDate <= new Date()) {
    throw makeError('Cannot book a slot in the past', 400, 'PAST_SLOT');
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Lock: any concurrent request for the same doctor+slot will wait here
    const existing = await apptQ.lockSlot(client, doctorId, slotStart);
    if (existing && existing.status !== APPOINTMENT_STATUS.CANCELLED) {
      throw makeError('This slot is no longer available', 409, 'SLOT_TAKEN');
    }

    // Create the appointment
    const appt = await apptQ.createAppointment(client, {
      patient_id: patientId,
      doctor_id:  doctorId,
      slot_start: slotStartDate.toISOString(),
      slot_end:   slotEndDate.toISOString(),
      reason,
    });

    // Schedule a reminder 24 h before the slot
    await reminderSvc.scheduleReminder(client, appt.id, slotStartDate);

    await client.query('COMMIT');
    return appt;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Reschedule: cancel the old appointment and book the new slot atomically.
 */
async function rescheduleSlot({ appointmentId, patientId, newSlotStart }) {
  const { CANCELLATION_WINDOW_HOURS } = require('../../../shared/constants');

  const existing = await apptQ.findById(appointmentId);
  if (!existing) throw makeError('Appointment not found', 404, 'NOT_FOUND');
  if (existing.patient_id !== patientId) throw makeError('Forbidden', 403, 'FORBIDDEN');
  if ([APPOINTMENT_STATUS.CANCELLED, APPOINTMENT_STATUS.COMPLETED, APPOINTMENT_STATUS.NO_SHOW]
        .includes(existing.status)) {
    throw makeError('Cannot reschedule this appointment', 422, 'INVALID_STATUS');
  }

  const hoursUntil = (new Date(existing.slot_start) - new Date()) / 36e5;
  if (hoursUntil < CANCELLATION_WINDOW_HOURS) {
    throw makeError(
      `Cannot reschedule within ${CANCELLATION_WINDOW_HOURS} hours of the appointment`,
      422, 'CANCELLATION_WINDOW'
    );
  }

  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    // Cancel existing
    await client.query(
      `UPDATE appointments
          SET status = 'cancelled', cancelled_at = NOW(), cancel_reason = 'Rescheduled'
        WHERE id = $1`,
      [appointmentId]
    );
    await apptQ.cancelReminders(appointmentId);

    // Book new slot (re-use bookSlot but pass the client — inline for atomicity)
    const newStart = new Date(newSlotStart);
    const newEnd   = new Date(newStart.getTime() + SLOT_DURATION_MINUTES * 60 * 1000);

    const locked = await apptQ.lockSlot(client, existing.doctor_id, newSlotStart);
    if (locked && locked.status !== APPOINTMENT_STATUS.CANCELLED) {
      throw makeError('The requested slot is no longer available', 409, 'SLOT_TAKEN');
    }

    const newAppt = await apptQ.createAppointment(client, {
      patient_id: patientId,
      doctor_id:  existing.doctor_id,
      slot_start: newStart.toISOString(),
      slot_end:   newEnd.toISOString(),
      reason:     existing.reason,
    });
    await reminderSvc.scheduleReminder(client, newAppt.id, newStart);

    await client.query('COMMIT');
    return newAppt;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { getAvailableSlots, bookSlot, rescheduleSlot };
