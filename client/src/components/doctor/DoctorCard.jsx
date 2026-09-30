/**
 * client/src/components/doctor/DoctorCard.jsx
 */
import { Link } from 'react-router-dom';
import { Star, Clock, DollarSign, Briefcase } from 'lucide-react';

export default function DoctorCard({ doctor }) {
  return (
    <div className="card card-accent doctor-card p-5 flex flex-col gap-3">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shrink-0"
          style={{ background: 'var(--grad-primary)' }}
          aria-hidden="true"
        >
          {doctor.full_name.charAt(0)}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate" style={{ color: 'var(--clr-text)' }}>
            {doctor.full_name}
          </p>
          <p className="text-xs" style={{ color: 'var(--clr-teal-600)' }}>
            {doctor.specialty}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 text-xs" style={{ color: 'var(--clr-text-muted)' }}>
        <span className="flex items-center gap-1">
          <Star size={11} style={{ color: 'var(--clr-amber-400)' }} aria-hidden="true" />
          {doctor.avg_rating > 0 ? Number(doctor.avg_rating).toFixed(1) : '—'}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={11} aria-hidden="true" />
          {doctor.years_experience}y exp
        </span>
        <span className="flex items-center gap-1">
          <DollarSign size={11} aria-hidden="true" />
          ${doctor.consultation_fee}
        </span>
      </div>

      {/* Bio snippet */}
      {doctor.bio && (
        <p className="text-xs line-clamp-2" style={{ color: 'var(--clr-text-muted)' }}>
          {doctor.bio}
        </p>
      )}

      <Link
        to={`/patient/book/${doctor.id}`}
        className="btn btn-primary btn-sm mt-auto"
      >
        Book Appointment
      </Link>
    </div>
  );
}
