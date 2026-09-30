/**
 * client/src/components/common/Badge.jsx
 * Appointment status badge with gradient + icon.
 */
import { CheckCircle, Clock, XCircle, CheckSquare, AlertCircle } from 'lucide-react';

const CONFIG = {
  pending:   { cls: 'badge-pending',   Icon: Clock,         label: 'Pending'   },
  confirmed: { cls: 'badge-confirmed', Icon: CheckCircle,   label: 'Confirmed' },
  cancelled: { cls: 'badge-cancelled', Icon: XCircle,       label: 'Cancelled' },
  completed: { cls: 'badge-completed', Icon: CheckSquare,   label: 'Completed' },
  no_show:   { cls: 'badge-no-show',   Icon: AlertCircle,   label: 'No-show'   },
};

export default function Badge({ status }) {
  const cfg = CONFIG[status] ?? CONFIG.pending;
  const { cls, Icon, label } = cfg;
  return (
    <span className={`badge ${cls}`} role="status" aria-label={label}>
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
}
