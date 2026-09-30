/**
 * client/src/components/appointment/SlotPicker.jsx
 * Renders a date picker + available time slots for a doctor.
 */
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { doctorService } from '../../services/doctorService';
import { toDateStr } from '../../utils/dateUtils';

export default function SlotPicker({ doctorId, onSelect, selectedSlot }) {
  const [baseDate, setBaseDate]   = useState(startOfDay(new Date()));
  const [activeDate, setActiveDate] = useState(toDateStr(new Date()));
  const [slots, setSlots]         = useState([]);
  const [loading, setLoading]     = useState(false);

  // Generate 7-day window starting from baseDate
  const days = Array.from({ length: 7 }, (_, i) => addDays(baseDate, i));

  useEffect(() => {
    if (!doctorId) return;
    setLoading(true);
    doctorService.getSlots(doctorId, activeDate)
      .then(({ data }) => setSlots(data.slots || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false));
  }, [doctorId, activeDate]);

  return (
    <div className="space-y-4">
      {/* Week navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setBaseDate(d => addDays(d, -7))}
          className="btn btn-ghost btn-icon btn-sm"
          disabled={baseDate <= startOfDay(new Date())}
          aria-label="Previous week"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex-1 grid grid-cols-7 gap-1">
          {days.map(day => {
            const str     = toDateStr(day);
            const isToday = str === toDateStr(new Date());
            const active  = str === activeDate;
            return (
              <button
                key={str}
                onClick={() => setActiveDate(str)}
                className="flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium transition-all"
                style={{
                  background: active ? 'var(--grad-primary)' : 'transparent',
                  color: active ? 'white' : isToday ? 'var(--clr-teal-600)' : 'var(--clr-text-muted)',
                  border: isToday && !active ? '1.5px solid var(--clr-teal-300)' : '1.5px solid transparent',
                }}
              >
                <span>{format(day, 'EEE')}</span>
                <span className="text-sm font-bold">{format(day, 'd')}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setBaseDate(d => addDays(d, 7))}
          className="btn btn-ghost btn-icon btn-sm"
          aria-label="Next week"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Time slots */}
      <div>
        <p className="text-sm font-medium mb-2" style={{ color: 'var(--clr-text-muted)' }}>
          {format(new Date(activeDate + 'T12:00:00'), 'EEEE, MMMM d')}
        </p>

        {loading ? (
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="skeleton h-9 rounded-lg" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm py-4 text-center" style={{ color: 'var(--clr-text-muted)' }}>
            No available slots on this day.
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map(slot => (
              <button
                key={slot.start}
                onClick={() => onSelect(slot)}
                className={`slot-btn ${selectedSlot?.start === slot.start ? 'selected' : ''}`}
              >
                {format(new Date(slot.start), 'h:mm a')}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
