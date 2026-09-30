/**
 * client/src/pages/admin/ManageDoctors.jsx
 */
import { useEffect, useState } from 'react';
import { BarChart2, Users, Calendar, Stethoscope, Plus } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Modal           from '../../components/common/Modal';
import Button          from '../../components/common/Button';
import Input           from '../../components/common/Input';
import { adminService }  from '../../services/adminService';
import { doctorService } from '../../services/doctorService';

const NAV = [
  { to: '/admin/dashboard',    label: 'Overview',     Icon: BarChart2   },
  { to: '/admin/doctors',      label: 'Doctors',      Icon: Stethoscope },
  { to: '/admin/appointments', label: 'Appointments', Icon: Calendar    },
  { to: '/admin/users',        label: 'Users',        Icon: Users       },
];

export default function ManageDoctors() {
  const [users, setUsers]           = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [form, setForm]             = useState({ user_id: '', specialty_id: '', bio: '', consultation_fee: '', years_experience: '' });
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    Promise.all([
      adminService.listUsers({ role: 'doctor', limit: 50 }),
      doctorService.getSpecialties(),
    ]).then(([usersRes, specRes]) => {
      setUsers(usersRes.data.data || []);
      setSpecialties(specRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  async function createDoctor() {
    setSaving(true);
    try {
      await adminService.createDoctor({
        ...form,
        specialty_id: Number(form.specialty_id),
        consultation_fee: Number(form.consultation_fee),
        years_experience: Number(form.years_experience),
      });
      setShowModal(false);
    } catch { /* toast */ }
    finally { setSaving(false); }
  }

  return (
    <DashboardLayout navItems={NAV} title="Manage Doctors">
      <div className="flex justify-end mb-4">
        <Button variant="primary" icon={<Plus size={15} />} onClick={() => setShowModal(true)}>
          Add Doctor Profile
        </Button>
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
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--clr-bg-subtle)' }}>
              <tr>
                {['Name', 'Email', 'Role', 'Active', 'Action'].map(h => (
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
                    <span className="badge badge-confirmed">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${u.is_active ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="btn btn-ghost btn-sm text-xs"
                      onClick={() => adminService.setUserActive(u.id, !u.is_active)
                        .then(() => setUsers(us => us.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x)))
                      }
                    >
                      {u.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Doctor Profile">
        <div className="space-y-4">
          <div>
            <label className="label">User account</label>
            <select className="input" value={form.user_id}
              onChange={e => setForm(f => ({ ...f, user_id: e.target.value }))}>
              <option value="">Select a user…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label className="label">Specialty</label>
            <select className="input" value={form.specialty_id}
              onChange={e => setForm(f => ({ ...f, specialty_id: e.target.value }))}>
              <option value="">Select…</option>
              {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <Input label="Consultation fee ($)" type="number" min="0"
            value={form.consultation_fee}
            onChange={e => setForm(f => ({ ...f, consultation_fee: e.target.value }))} />
          <Input label="Years of experience" type="number" min="0"
            value={form.years_experience}
            onChange={e => setForm(f => ({ ...f, years_experience: e.target.value }))} />
          <div>
            <label className="label">Bio</label>
            <textarea className="input resize-none" rows={3} value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={createDoctor}>Create</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
