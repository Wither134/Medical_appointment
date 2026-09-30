/**
 * client/src/pages/patient/AppointmentHistory.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { Search, Calendar, Clock, Filter } from 'lucide-react';
import DashboardLayout  from '../../components/layout/DashboardLayout';
import AppointmentCard  from '../../components/appointment/AppointmentCard';
import Modal            from '../../components/common/Modal';
import Button           from '../../components/common/Button';
import SlotPicker       from '../../components/appointment/SlotPicker';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { appointmentService } from '../../services/appointmentService';

const NAV = [
  { to: '/patient/dashboard', label: 'Dashboard',    Icon: Calendar },
  { to: '/patient/search',    label: 'Find Doctors',  Icon: Search   },
  { to: '/patient/history',   label: 'History',       Icon: Clock    },
];

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'];

export default function AppointmentHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reschedTarget, setReschedTarget] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [newSlot, setNewSlot]           = useState(null);
  const [working, setWorking]           = useState(false);

  const fetchAppts = useCallback(() => {
    setLoading(true);
    appointmentService.list({ status: statusFilter || undefined, limit: 50 })
      .then(({ data }) => setAppointments(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { fetchAppts(); }, [fetchAppts]);

  async function handleCancel() {
    setWorking(true);
    try {
      await appointmentService.patch(cancelTarget.id, { status: 'cancelled', cancel_reason: cancelReason });
      fetchAppts();
      setCancelTarget(null);
    } catch { /* show toast */ }
    finally { setWorking(false); }
  }

  async function handleReschedule() {
    if (!newSlot) return;
    setWorking(true);
    try {
      await appointmentService.reschedule(reschedTarget.id, newSlot.start);
      fetchAppts();
      setReschedTarget(null);
      setNewSlot(null);
    } catch { /* show toast */ }
    finally { setWorking(false); }
  }

  return (
    <DashboardLayout navItems={NAV} title="Appointment History">
      {/* Status filter */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={15} style={{ color: 'var(--clr-text-muted)' }} aria-hidden="true" />
        {STATUS_OPTIONS.map(s => (
          <button
            key={s || 'all'}
            onClick={() => setStatusFilter(s)}
            className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-outline'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="card p-12 text-center">
          <p style={{ color: 'var(--clr-text-muted)' }}>No appointments found.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {appointments.map(appt => (
            <AppointmentCard
              key={appt.id}
              appt={appt}
              role="patient"
              onCancel={setCancelTarget}
              onReschedule={setReschedTarget}
            />
          ))}
        </div>
      )}

      {/* Cancel modal */}
      <Modal open={!!cancelTarget} onClose={() => setCancelTarget(null)} title="Cancel Appointment">
        <div className="space-y-4">
          <p className="text-sm" style={{ color: 'var(--clr-text-muted)' }}>
            Cancel with <strong>{cancelTarget?.doctor_name}</strong>?
          </p>
          <textarea className="input resize-none" rows={3} value={cancelReason}
            onChange={e => setCancelReason(e.target.value)} placeholder="Reason (optional)" />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setCancelTarget(null)}>Keep</Button>
            <Button loading={working} onClick={handleCancel}
              style={{ background: 'var(--clr-cancelled)', color: 'white' }}>
              Cancel appointment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule modal */}
      <Modal open={!!reschedTarget} onClose={() => { setReschedTarget(null); setNewSlot(null); }}
        title="Reschedule Appointment" maxWidth="max-w-xl">
        <div className="space-y-4">
          {reschedTarget && (
            <SlotPicker
              doctorId={reschedTarget.doctor_id}
              selectedSlot={newSlot}
              onSelect={setNewSlot}
            />
          )}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => { setReschedTarget(null); setNewSlot(null); }}>
              Cancel
            </Button>
            <Button variant="primary" disabled={!newSlot} loading={working} onClick={handleReschedule}>
              Confirm reschedule
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
