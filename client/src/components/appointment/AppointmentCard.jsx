/**
 * client/src/components/appointment/AppointmentCard.jsx
 */
import { Calendar, Clock, User, FileText } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDateTime, canCancel } from '../../utils/dateUtils';

export default function AppointmentCard({ appt, onCancel, onReschedule, role = 'patient' }) {
  const cancellable = canCancel(appt.slot_start) &&
    ['pending', 'confirmed'].includes(appt.status);

  return (
    <div className="card card-accent p-5 space-y-3 doctor-card fade-in">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold" style={{ color: 'var(--clr-text)' }}>
            {role === 'patient' ? `Dr. ${appt.doctor_name}` : appt.patient_name}
          </p>
          {appt.specialty && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--clr-text-muted)' }}>
              {appt.specialty}
            </p>
          )}
        </div>
        <Badge status={appt.status} />
      </div>

      {/* Date/time */}
      <div className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--clr-text-muted)' }}>
        <Calendar size={13} aria-hidden="true" />
        <span>{formatDateTime(appt.slot_start)}</span>
      </div>

      {/* Reason */}
      {appt.reason && (
        <div className="flex items-start gap-1.5 text-sm" style={{ color: 'var(--clr-text-muted)' }}>
          <FileText size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2">{appt.reason}</span>
        </div>
      )}

      {/* Actions */}
      {(onCancel || onReschedule) && (
        <div className="flex gap-2 pt-1 border-t" style={{ borderColor: 'var(--clr-border)' }}>
          {onReschedule && cancellable && (
            <button
              onClick={() => onReschedule(appt)}
              className="btn btn-outline btn-sm"
            >
              Reschedule
            </button>
          )}
          {onCancel && cancellable && (
            <button
              onClick={() => onCancel(appt)}
              className="btn btn-sm"
              style={{ background: 'var(--clr-cancelled)', color: 'white' }}
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}
