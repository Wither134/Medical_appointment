/**
 * client/src/pages/doctor/DoctorDashboard.jsx
 */
import { useEffect, useState } from 'react';
import { Calendar, Clock, Settings, CheckSquare } from 'lucide-react';
import DashboardLayout  from '../../components/layout/DashboardLayout';
import AppointmentCard  from '../../components/appointment/AppointmentCard';
import Modal            from '../../components/common/Modal';
import Button           from '../../components/common/Button';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { appointmentService } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';
import { toDateStr } from '../../utils/dateUtils';

const NAV = [
  { to: '/doctor/dashboard',    label: 'Schedule',    Icon: Calendar  },
  { to: '/doctor/availability', label: 'Availability', Icon: Clock     },
  { to: '/doctor/schedule',     label: 'All Appointments', Icon: CheckSquare },
];

export default function DoctorDashboard() {
  const { user }  = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [actionTarget, setActionTarget] = useState(null);
  const [notes, setNotes]               = useState('');
  const [working, setWorking]           = useState(false);

  const today = toDateStr(new Date());

  useEffect(() => {
    appointmentService.list({
      from: `${today}T00:00:00Z`,
      to:   `${today}T23:59:59Z`,
      limit: 50,
    })
      .then(({ data }) => setAppointments(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [today]);

  async function handleStatusUpdate(status) {
    setWorking(true);
    try {
      await appointmentService.patch(actionTarget.id, {
        status,
        doctor_notes: notes || undefined,
      });
      setAppointments(a =>
        a.map(appt => appt.id === actionTarget.id ? { ...appt, status, doctor_notes: notes } : appt)
      );
      setActionTarget(null);
      setNotes('');
    } catch { /* toast */ }
    finally { setWorking(false); }
  }

  const pending   = appointments.filter(a => a.status === 'pending');
  const confirmed = appointments.filter(a => a.status === 'confirmed');

  return (
    <DashboardLayout navItems={NAV} title={`Today — ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`}>
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total today',  value: appointments.length,                                  color: 'var(--grad-primary)' },
          { label: 'Pending',      value: pending.length,                                       color: 'var(--clr-pending)' },
          { label: 'Confirmed',    value: confirmed.length,                                     color: 'var(--clr-confirmed)' },
          { label: 'Completed',    value: appointments.filter(a => a.status === 'completed').length, color: 'var(--clr-completed)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center space-y-1">
            <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
            <p className="text-xs" style={{ color: 'var(--clr-text-muted)' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Today's list */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="card p-12 text-center">
          <p style={{ color: 'var(--clr-text-muted)' }}>No appointments scheduled for today.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {appointments.map(appt => (
            <div key={appt.id}>
              <AppointmentCard appt={appt} role="doctor" />
              {['pending', 'confirmed'].includes(appt.status) && (
                <div className="flex gap-2 mt-2">
                  {appt.status === 'pending' && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => { setActionTarget(appt); }}>
                      Confirm
                    </button>
                  )}
                  {appt.status === 'confirmed' && (
                    <>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => setActionTarget({ ...appt, _action: 'completed' })}>
                        Mark Complete
                      </button>
                      <button className="btn btn-sm"
                        style={{ background: 'var(--clr-no-show)', color: 'white' }}
                        onClick={() => setActionTarget({ ...appt, _action: 'no_show' })}>
                        No-show
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action modal */}
      <Modal open={!!actionTarget} onClose={() => { setActionTarget(null); setNotes(''); }}
        title="Update Appointment">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--clr-text-muted)' }}>
            Patient: <strong>{actionTarget?.patient_name}</strong>
          </p>
          <div>
            <label className="label" htmlFor="doc-notes">Doctor notes (optional)</label>
            <textarea id="doc-notes" className="input resize-none" rows={3}
              value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setActionTarget(null)}>Cancel</Button>
            {actionTarget?.status === 'pending' && (
              <Button variant="primary" loading={working} onClick={() => handleStatusUpdate('confirmed')}>
                Confirm
              </Button>
            )}
            {actionTarget?._action === 'completed' && (
              <Button variant="primary" loading={working} onClick={() => handleStatusUpdate('completed')}>
                Mark Complete
              </Button>
            )}
            {actionTarget?._action === 'no_show' && (
              <Button loading={working} onClick={() => handleStatusUpdate('no_show')}
                style={{ background: 'var(--clr-no-show)', color: 'white' }}>
                Mark No-show
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
