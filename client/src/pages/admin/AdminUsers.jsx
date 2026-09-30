/**
 * client/src/pages/admin/AdminUsers.jsx
 */
import { useEffect, useState } from 'react';
import { BarChart2, Users, Calendar, Stethoscope } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminService } from '../../services/adminService';

const NAV = [
  { to: '/admin/dashboard',    label: 'Overview',     Icon: BarChart2   },
  { to: '/admin/doctors',      label: 'Doctors',      Icon: Stethoscope },
  { to: '/admin/appointments', label: 'Appointments', Icon: Calendar    },
  { to: '/admin/users',        label: 'Users',        Icon: Users       },
];

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    adminService.listUsers({ search: search || undefined, limit: 50 })
      .then(({ data }) => setUsers(data.data || []))
      .finally(() => setLoading(false));
  }, [search]);

  async function toggleActive(user) {
    await adminService.setUserActive(user.id, !user.is_active);
    setUsers(us => us.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
  }

  return (
    <DashboardLayout navItems={NAV} title="Manage Users">
      <div className="mb-4">
        <input className="input max-w-xs" type="search" placeholder="Search users…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="card p-4 flex gap-4 items-center">
              <div className="skeleton w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-3 w-1/3" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm min-w-[540px]">
            <thead style={{ background: 'var(--clr-bg-subtle)' }}>
              <tr>
                {['Name', 'Email', 'Role', 'Phone', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--clr-text-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid var(--clr-border)' : undefined }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--clr-text)' }}>{u.full_name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--clr-text-muted)' }}>{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="badge badge-confirmed text-xs">{u.role}</span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--clr-text-muted)' }}>{u.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="btn btn-ghost btn-sm text-xs" onClick={() => toggleActive(u)}>
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
