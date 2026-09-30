// Re-export from shared (Vite resolves the alias set in vite.config.js)
export const APPOINTMENT_STATUS = {
  PENDING:   'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW:   'no_show',
};

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR:  'doctor',
  ADMIN:   'admin',
};

export const SLOT_DURATION_MINUTES     = 30;
export const CANCELLATION_WINDOW_HOURS = 24;
