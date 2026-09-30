/**
 * client/src/pages/doctor/ManageAvailability.jsx
 */
import { useState, useEffect } from 'react';
import { Calendar, Clock, CheckSquare, Plus, Trash2, Save } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button          from '../../components/common/Button';
import { availabilityService } from '../../services/doctorService';

const NAV = [
  { to: '/doctor/dashboard',    label: 'Schedule',        Icon: Calendar  },
  { to: '/doctor/availability', label: 'Availability',    Icon: Clock     },
  { to: '/doctor/schedule',     label: 'All Appointments',Icon: CheckSquare },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_WINDOW = { start_time: '09:00', end_time: '17:00' };

export default function ManageAvailability() {
  const [slots, setSlots]   = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [newLeave, setNewLeave] = useState({ block_date: '', reason: '' });
  const [saving, setSaving]   = useState(false);
  const [addingLeave, setAddingLeave] = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    availabilityService.get().then(({ data }) => setSlots(data.availability || []));
    availabilityService.getLeaves().then(({ data }) => setLeaves(data.leaves || []));
  }, []);

  function toggleDay(day) {
    const exists = slots.find(s => s.day_of_week === day);
    if (exists) {
      setSlots(s => s.filter(x => x.day_of_week !== day));
    } else {
      setSlots(s => [...s, { day_of_week: day, ...DEFAULT_WINDOW }]);
    }
  }

  function updateSlot(day, field, value) {
    setSlots(s => s.map(x => x.day_of_week === day ? { ...x, [field]: value } : x));
  }

  async function saveAvailability() {
    setSaving(true);
    try {
      await availabilityService.update({ availability: slots });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* toast */ }
    finally { setSaving(false); }
  }

  async function addLeave() {
    setAddingLeave(true);
    try {
      const { data } = await availabilityService.addLeave(newLeave);
      setLeaves(l => [...l, data]);
      setNewLeave({ block_date: '', reason: '' });
    } catch { /* toast */ }
    finally { setAddingLeave(false); }
  }

  async function removeLeave(id) {
    await availabilityService.deleteLeave(id);
    setLeaves(l => l.filter(x => x.id !== id));
  }

  return (
    <DashboardLayout navItems={NAV} title="Manage Availability">
      <div className="max-w-2xl space-y-6">
        {/* Weekly schedule */}
        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg" style={{ color: 'var(--clr-text)' }}>Weekly Schedule</h2>
          <p className="text-sm" style={{ color: 'var(--clr-text-muted)' }}>
            Toggle days on/off and set your working hours. Slots are 30 minutes each.
          </p>

          <div className="space-y-3">
            {DAY_NAMES.map((name, day) => {
              const slot   = slots.find(s => s.day_of_week === day);
              const active = !!slot;
              return (
                <div key={day} className="flex items-center gap-3 py-2"
                  style={{ borderBottom: '1px solid var(--clr-border)' }}>
                  {/* Toggle */}
                  <button
                    onClick={() => toggleDay(day)}
                    className={`relative inline-flex h-6 w-11 rounded-full transition-colors shrink-0 ${active ? '' : ''}`}
                    style={{
                      background: active ? 'var(--grad-primary)' : 'var(--clr-gray-300)',
                      backgroundSize: active ? '200% 200%' : undefined,
                    }}
                    role="switch" aria-checked={active} aria-label={name}
                  >
                    <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm mt-0.5 transition-transform ${active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>

                  <span className="w-24 text-sm font-medium" style={{ color: active ? 'var(--clr-text)' : 'var(--clr-text-muted)' }}>
                    {name}
                  </span>

                  {active && (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" className="input py-1" value={slot.start_time}
                        onChange={e => updateSlot(day, 'start_time', e.target.value)} />
                      <span className="text-sm" style={{ color: 'var(--clr-text-muted)' }}>to</span>
                      <input type="time" className="input py-1" value={slot.end_time}
                        onChange={e => updateSlot(day, 'end_time', e.target.value)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Button
            variant="primary"
            loading={saving}
            onClick={saveAvailability}
            icon={<Save size={15} />}
          >
            {saved ? '✓ Saved!' : 'Save Schedule'}
          </Button>
        </section>

        {/* Leave blocks */}
        <section className="card p-6 space-y-4">
          <h2 className="font-semibold text-lg" style={{ color: 'var(--clr-text)' }}>Leave Days</h2>

          {/* Add new leave */}
          <div className="flex gap-2 flex-wrap">
            <input type="date" className="input flex-1" min={new Date().toISOString().slice(0,10)}
              value={newLeave.block_date}
              onChange={e => setNewLeave(l => ({ ...l, block_date: e.target.value }))} />
            <input type="text" className="input flex-1" placeholder="Reason (optional)"
              value={newLeave.reason}
              onChange={e => setNewLeave(l => ({ ...l, reason: e.target.value }))} />
            <Button variant="primary" icon={<Plus size={15} />}
              loading={addingLeave} disabled={!newLeave.block_date}
              onClick={addLeave}>
              Add
            </Button>
          </div>

          {leaves.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--clr-text-muted)' }}>No leave days blocked.</p>
          ) : (
            <ul className="space-y-2">
              {leaves.map(l => (
                <li key={l.id} className="flex items-center justify-between text-sm py-2"
                  style={{ borderBottom: '1px solid var(--clr-border)' }}>
                  <span>
                    <strong>{l.block_date}</strong>
                    {l.reason && <span style={{ color: 'var(--clr-text-muted)' }}> — {l.reason}</span>}
                  </span>
                  <button onClick={() => removeLeave(l.id)}
                    className="btn btn-ghost btn-icon btn-sm text-red-500" aria-label="Remove leave">
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
