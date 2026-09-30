/**
 * client/src/pages/patient/PatientDashboard.jsx
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search, Clock, CheckCircle } from 'lucide-react';
import DashboardLayout   from '../../components/layout/DashboardLayout';
import AppointmentCard   from '../../components/appointment/AppointmentCard';
import Modal             from '../../components/common/Modal';
import Button            from '../../components/common/Button';
import { SkeletonCard }  from '../../components/common/SkeletonLoader';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/patient/dashboard', label: 'Dashboard',   Icon: Calendar },
  { to: '/patient/search',    label: 'Find Doctors', Icon: Search   },
  { to: '/patient/history',   label: 'History',      Icon: Clock    },
];

export default function PatientDashboard() {
  const { user }          = useAuth();
  const [upcoming, setUpcoming]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling]     = useState(false);

  useEffect(() => {
    appointmentService.list({ status: 'confirmed', limit: 5 })
      .then(({ data }) => setUpcoming(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function confirmCancel() {
    setCancelling(true);
    try {
      await appointmentService.patch(cancelTarget.id, {
        status: 'cancelled', cancel_reason: cancelReason,
      });
      setUpcoming(u => u.filter(a => a.id !== cancelTarget.id));
      setCancelTarget(null);
      setCancelReason('');
    } catch { /* show toast in production */ }
    finally { setCancelling(false); }
  }

  return (
    <DashboardLayout navItems={NAV} title={`Good day, ${user?.full_name?.split(' ')[0]} 👋`}>
      {/* Quick action cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Book Appointment',  to: '/patient/search',   Icon: Search,        color: 'var(--grad-primary)' },
          { label: 'View History',      to: '/patient/history',  Icon: Clock,         color: 'var(--grad-accent)'  },
          { label: 'Upcoming',          to: '/patient/history',  Icon: CheckCircle,   color: 'var(--grad-primary)' },
        ].map(({ label, to, Icon, color }) => (
          <Link key={label} to={to} className="card card-accent doctor-card p-5 flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: color }}>
              <Icon size={18} color="white" aria-hidden="true" />
            </div>
            <span className="font-semibold" style={{ color: 'var(--clr-text)' }}>{label}</span>
          </Link>
        ))}
      </div>

      {/* Upcoming appointments */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--clr-text)' }}>
            Upcoming appointments
          </h2>
          <Link to="/patient/history" className="text-sm font-medium" style={{ color: 'var(--clr-teal-600)' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[1,2].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : upcoming.length === 0 ? (
          <div className="card p-10 text-center space-y-3">
            <Calendar size={36} className="mx-auto opacity-30" aria-hidden="true" />
            <p style={{ color: 'var(--clr-text-muted)' }}>No upcoming appointments.</p>
            <Link to="/patient/search" className="btn btn-primary btn-sm">
              Find a doctor
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {upcoming.map(appt => (
              <AppointmentCard
                key={appt.id}
                appt={appt}
                role="patient"
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        )}
      </section>

      {/* Cancel confirmation modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel appointment">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--clr-text-muted)' }}>
            Are you sure you want to cancel your appointment with{' '}
            <strong>{cancelTarget?.doctor_name}</strong>?
          </p>
          <div>
            <label className="label">Reason (optional)</label>
            <textarea
              className="input resize-none"
              rows={3}
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              placeholder="Feeling better, schedule conflict…"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>Keep it</Button>
            <Button
              variant="accent"
              loading={cancelling}
              onClick={confirmCancel}
              style={{ background: 'var(--clr-cancelled)' }}
            >
              Yes, cancel
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
