/**
 * client/src/pages/admin/AdminAppointments.jsx
 * Admin view of all appointments with filters.
 */
import { useState, useEffect, useCallback } from 'react';
import { BarChart2, Users, Calendar, Stethoscope, Filter } from 'lucide-react';
import DashboardLayout  from '../../components/layout/DashboardLayout';
import AppointmentCard  from '../../components/appointment/AppointmentCard';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { adminService } from '../../services/adminService';

const NAV = [
  { to: '/admin/dashboard',    label: 'Overview',     Icon: BarChart2   },
  { to: '/admin/doctors',      label: 'Doctors',      Icon: Stethoscope },
  { to: '/admin/appointments', label: 'Appointments', Icon: Calendar    },
  { to: '/admin/users',        label: 'Users',        Icon: Users       },
];

const STATUSES = ['', 'pending', 'confirmed', 'completed', 'no_show', 'cancelled'];

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [status, setStatus]             = useState('');

  const fetch = useCallback(() => {
    setLoading(true);
    adminService.listAppointments({ status: status || undefined, limit: 50 })
      .then(({ data }) => setAppointments(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <DashboardLayout navItems={NAV} title="All Appointments">
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <Filter size={15} style={{ color: 'var(--clr-text-muted)' }} aria-hidden="true" />
        {STATUSES.map(s => (
          <button key={s || 'all'} onClick={() => setStatus(s)}
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
            <AppointmentCard key={appt.id} appt={appt} role="admin" />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
