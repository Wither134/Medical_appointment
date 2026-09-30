/**
 * client/src/utils/dateUtils.js
 * Date/time helper functions.
 */
import { format, parseISO, isToday, isTomorrow, differenceInHours } from 'date-fns';

/** Format ISO string → "Aug 10, 2025 at 9:00 AM" */
export function formatDateTime(iso) {
  return format(parseISO(iso), "MMM d, yyyy 'at' h:mm a");
}

/** Format ISO string → "9:00 AM" */
export function formatTime(iso) {
  return format(parseISO(iso), 'h:mm a');
}

/** Format ISO string → "Mon, Aug 10" */
export function formatDateShort(iso) {
  return format(parseISO(iso), 'EEE, MMM d');
}

/** "Today", "Tomorrow", or "Aug 10" */
export function friendlyDate(iso) {
  const d = parseISO(iso);
  if (isToday(d))    return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  return format(d, 'MMM d, yyyy');
}

/** Returns true if the appointment can still be cancelled */
export function canCancel(slotStartIso, windowHours = 24) {
  return differenceInHours(parseISO(slotStartIso), new Date()) >= windowHours;
}

/** Generate a YYYY-MM-DD string from a Date object (local) */
export function toDateStr(date) {
  return format(date, 'yyyy-MM-dd');
}
