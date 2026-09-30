/**
 * client/src/pages/doctor/ScheduleView.jsx
 * Full appointment list for the doctor with status filters.
 */
import { useState, useEffect, useCallback } from 'react';
import { Calendar, Clock, CheckSquare, Filter } from 'lucide-react';
import DashboardLayout  from '../../components/layout/DashboardLayout';
import AppointmentCard  from '../../components/appointment/AppointmentCard';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { appointmentService } from '../../services/appointmentService';

const NAV = [
  { to: '/doctor/dashboard',    label: 'Schedule',         Icon: Calendar  },
  { to: '/doctor/availability', label: 'Availability',     Icon: Clock     },
  { to: '/doctor/schedule',     label: 'All Appointments', Icon: CheckSquare },
];

const STATUSES = ['', 'pending', 'confirmed', 'completed', 'no_show', 'cancelled'];

export default function ScheduleView() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [status, setStatus]             = useState('');

  const fetchAppts = useCallback(() => {
    setLoading(true);
    appointmentService.list({ status: status || undefined, limit: 50 })
      .then(({ data }) => setAppointments(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { fetchAppts(); }, [fetchAppts]);

  return (
    <DashboardLayout navItems={NAV} title="All Appointments">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={15} style={{ color: 'var(--clr-text-muted)' }} aria-hidden="true" />
        {STATUSES.map(s => (
          <button key={s || 'all'}
            onClick={() => setStatus(s)}
            className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`}>
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
            <AppointmentCard key={appt.id} appt={appt} role="doctor" />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
