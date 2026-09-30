/**
 * server/src/services/reminder.service.js
 * Mocked reminder scheduler.
 * In production: replace sendReminder() with Nodemailer / Twilio calls.
 */

const { REMINDER_LEAD_HOURS } = require('../constants');

/**
 * Insert a reminder row scheduled 24 h before the slot.
 * Called inside an open transaction — takes a pg client.
 */
async function scheduleReminder(client, appointmentId, slotStart) {
  const scheduledAt = new Date(
    new Date(slotStart).getTime() - REMINDER_LEAD_HOURS * 60 * 60 * 1000
  );

  // Only schedule if the reminder time is in the future
  if (scheduledAt <= new Date()) return;

  await client.query(
    `INSERT INTO reminders (appointment_id, scheduled_at, type)
     VALUES ($1, $2, 'email')
     ON CONFLICT DO NOTHING`,
    [appointmentId, scheduledAt.toISOString()]
  );
}

/**
 * Mock: "send" a reminder.
 * A real cron job would call this for every pending reminder whose
 * scheduled_at <= NOW().
 */
async function sendReminder(reminder) {
  console.log(
    `[REMINDER] Sending ${reminder.type} reminder for appointment ${reminder.appointment_id}` +
    ` scheduled at ${reminder.scheduled_at}`
  );
  // TODO: integrate Nodemailer / SendGrid / Twilio here
  return { sent: true };
}

module.exports = { scheduleReminder, sendReminder };
