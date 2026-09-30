/**
 * client/src/pages/admin/AdminDashboard.jsx
 */
import { useEffect, useState } from 'react';
import { BarChart2, Users, Calendar, Stethoscope } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge           from '../../components/common/Badge';
import { adminService } from '../../services/adminService';

const NAV = [
  { to: '/admin/dashboard',    label: 'Overview',     Icon: BarChart2    },
  { to: '/admin/doctors',      label: 'Doctors',      Icon: Stethoscope  },
  { to: '/admin/appointments', label: 'Appointments', Icon: Calendar     },
  { to: '/admin/users',        label: 'Users',        Icon: Users        },
];

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getSummary()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { label: 'Total Appointments', value: stats.total_appointments,     color: 'var(--grad-primary)' },
    { label: 'This Week',          value: stats.appointments_this_week, color: 'var(--grad-accent)'  },
    { label: 'Total Doctors',      value: stats.total_doctors,          color: 'var(--grad-primary)' },
    { label: 'Total Patients',     value: stats.total_patients,         color: 'var(--grad-accent)'  },
  ] : [];

  return (
    <DashboardLayout navItems={NAV} title="Admin Overview">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? [1,2,3,4].map(i => (
              <div key={i} className="card p-5 space-y-2">
                <div className="skeleton h-8 w-16" />
                <div className="skeleton h-3 w-24" />
              </div>
            ))
          : statCards.map(({ label, value, color }) => (
              <div key={label} className="card card-accent p-5 text-center space-y-1">
                <p className="text-3xl font-extrabold grad-text">{value}</p>
                <p className="text-xs" style={{ color: 'var(--clr-text-muted)' }}>{label}</p>
              </div>
            ))
        }
      </div>

      {/* Status breakdown */}
      {stats?.by_status && (
        <section className="card p-6">
          <h2 className="font-semibold mb-4" style={{ color: 'var(--clr-text)' }}>
            Appointments by Status
          </h2>
          <div className="flex flex-wrap gap-4">
            {Object.entries(stats.by_status).map(([status, count]) => (
              <div key={status} className="flex items-center gap-2">
                <Badge status={status} />
                <span className="text-sm font-semibold" style={{ color: 'var(--clr-text)' }}>
                  {count}
                </span>
              </div>
            ))}
          </div>

          {/* Visual bar */}
          {(() => {
            const total = Object.values(stats.by_status).reduce((a, b) => a + Number(b), 0);
            const colors = { pending: 'var(--clr-pending)', confirmed: 'var(--clr-confirmed)',
              cancelled: 'var(--clr-cancelled)', completed: 'var(--clr-completed)', no_show: 'var(--clr-no-show)' };
            return total > 0 ? (
              <div className="flex rounded-full overflow-hidden h-3 mt-4 gap-0.5">
                {Object.entries(stats.by_status).map(([st, cnt]) => {
                  const pct = (Number(cnt) / total) * 100;
                  return pct > 0 ? (
                    <div key={st} style={{ width: `${pct}%`, background: colors[st] }}
                      title={`${st}: ${cnt}`} aria-hidden="true" />
                  ) : null;
                })}
              </div>
            ) : null;
          })()}
        </section>
      )}
    </DashboardLayout>
  );
}
