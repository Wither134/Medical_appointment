/**
 * shared/constants.js
 * Values used by both client and server to avoid magic strings.
 */

const ROLES = Object.freeze({
  PATIENT: 'patient',
  DOCTOR:  'doctor',
  ADMIN:   'admin',
});

const APPOINTMENT_STATUS = Object.freeze({
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW:   'no_show',
});

const REMINDER_STATUS = Object.freeze({
  PENDING: 'pending',
  SENT:    'sent',
  FAILED:  'failed',
  SKIPPED: 'skipped',
});

/** Slot duration in minutes — must match CHECK constraints in migrations */
const SLOT_DURATION_MINUTES = 30;

/**
 * Minimum hours before a slot_start that a patient may cancel.
 * Cancellations closer than this are rejected by the API.
 */
const CANCELLATION_WINDOW_HOURS = 24;

/**
 * How many hours before the appointment to send the reminder.
 */
const REMINDER_LEAD_HOURS = 24;

/** day_of_week mapping (matches JS Date.getDay()) */
const DAY_OF_WEEK = Object.freeze({
  SUNDAY:    0,
  MONDAY:    1,
  TUESDAY:   2,
  WEDNESDAY: 3,
  THURSDAY:  4,
  FRIDAY:    5,
  SATURDAY:  6,
});

module.exports = {
  ROLES,
  APPOINTMENT_STATUS,
  REMINDER_STATUS,
  SLOT_DURATION_MINUTES,
  CANCELLATION_WINDOW_HOURS,
  REMINDER_LEAD_HOURS,
  DAY_OF_WEEK,
};
