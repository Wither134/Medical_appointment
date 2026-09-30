/**
 * client/src/pages/patient/BookAppointment.jsx
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stethoscope, Calendar, CheckCircle, Search, Clock } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import SlotPicker      from '../../components/appointment/SlotPicker';
import Button          from '../../components/common/Button';
import { doctorService }      from '../../services/doctorService';
import { appointmentService } from '../../services/appointmentService';
import { formatDateTime } from '../../utils/dateUtils';

const NAV = [
  { to: '/patient/dashboard', label: 'Dashboard',   Icon: Calendar },
  { to: '/patient/search',    label: 'Find Doctors', Icon: Search   },
  { to: '/patient/history',   label: 'History',      Icon: Clock    },
];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate     = useNavigate();
  const [doctor, setDoctor]         = useState(null);
  const [selectedSlot, setSelected] = useState(null);
  const [reason, setReason]         = useState('');
  const [loading, setLoading]       = useState(false);
  const [booked, setBooked]         = useState(false);
  const [error, setError]           = useState('');

  useEffect(() => {
    doctorService.getOne(doctorId)
      .then(({ data }) => setDoctor(data))
      .catch(() => navigate('/patient/search'));
  }, [doctorId, navigate]);

  async function handleBook() {
    if (!selectedSlot) return;
    setLoading(true);
    setError('');
    try {
      await appointmentService.book({
        doctor_id:  doctorId,
        slot_start: selectedSlot.start,
        reason:     reason || undefined,
      });
      setBooked(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. The slot may have been taken.');
    } finally {
      setLoading(false);
    }
  }

  if (booked) {
    return (
      <DashboardLayout navItems={NAV}>
        <div className="max-w-md mx-auto mt-16 text-center space-y-4 fade-in">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'var(--grad-primary)' }}>
            <CheckCircle size={32} color="white" aria-hidden="true" />
          </div>
          <h2 className="text-2xl font-bold grad-text">Appointment Booked!</h2>
          <p style={{ color: 'var(--clr-text-muted)' }}>
            Your appointment with <strong>{doctor?.full_name}</strong> is confirmed for{' '}
            <strong>{formatDateTime(selectedSlot.start)}</strong>.
          </p>
          <p className="text-sm" style={{ color: 'var(--clr-text-muted)' }}>
            A reminder will be sent 24 hours before your visit.
          </p>
          <Button variant="primary" onClick={() => navigate('/patient/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={NAV} title="Book Appointment">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Doctor summary */}
        {doctor && (
          <div className="card card-accent p-5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ background: 'var(--grad-primary)' }}>
              {doctor.full_name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-lg" style={{ color: 'var(--clr-text)' }}>
                {doctor.full_name}
              </p>
              <p className="text-sm" style={{ color: 'var(--clr-teal-600)' }}>
                {doctor.specialty_name || doctor.specialty} · ${doctor.consultation_fee}
              </p>
            </div>
          </div>
        )}

        {/* Slot picker */}
        <div className="card p-5 space-y-2">
          <h3 className="font-semibold" style={{ color: 'var(--clr-text)' }}>Select a time slot</h3>
          <SlotPicker
            doctorId={doctorId}
            selectedSlot={selectedSlot}
            onSelect={setSelected}
          />
        </div>

        {/* Reason */}
        <div className="card p-5 space-y-2">
          <label className="label" htmlFor="reason">Reason for visit (optional)</label>
          <textarea
            id="reason"
            className="input resize-none"
            rows={3}
            placeholder="Describe your symptoms or reason…"
            value={reason}
            onChange={e => setReason(e.target.value)}
            maxLength={500}
          />
        </div>

        {/* Selected slot summary + confirm */}
        {selectedSlot && (
          <div className="card p-5 space-y-3 fade-in" style={{ borderColor: 'var(--clr-teal-300)' }}>
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--clr-teal-700)' }}>
              <Calendar size={14} aria-hidden="true" />
              Selected: <strong>{formatDateTime(selectedSlot.start)}</strong>
            </div>
            {error && (
              <p className="text-sm text-red-500" role="alert">{error}</p>
            )}
            <Button variant="primary" className="w-full" loading={loading} onClick={handleBook}>
              Confirm Booking
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
