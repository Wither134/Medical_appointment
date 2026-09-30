/**
 * client/src/pages/patient/SearchDoctors.jsx
 */
import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import DoctorCard      from '../../components/doctor/DoctorCard';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { doctorService } from '../../services/doctorService';
import { Calendar, Clock } from 'lucide-react';

const NAV = [
  { to: '/patient/dashboard', label: 'Dashboard',   Icon: Calendar },
  { to: '/patient/search',    label: 'Find Doctors', Icon: Search   },
  { to: '/patient/history',   label: 'History',      Icon: Clock    },
];

export default function SearchDoctors() {
  const [search, setSearch]           = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);

  useEffect(() => {
    doctorService.getSpecialties().then(({ data }) => setSpecialties(data.data || []));
  }, []);

  const fetchDoctors = useCallback((p = 1) => {
    setLoading(true);
    doctorService.list({ search: search || undefined, specialty_id: specialtyId || undefined, page: p })
      .then(({ data }) => {
        setDoctors(data.data || []);
        setTotal(data.total || 0);
        setPage(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, specialtyId]);

  useEffect(() => { fetchDoctors(1); }, [fetchDoctors]);

  return (
    <DashboardLayout navItems={NAV} title="Find a Doctor">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--clr-text-muted)' }} aria-hidden="true" />
          <input
            className="input pl-9"
            type="search"
            placeholder="Search by name or specialty…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search doctors"
          />
        </div>
        <div className="relative">
          <SlidersHorizontal size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--clr-text-muted)' }} aria-hidden="true" />
          <select
            className="input pl-9 pr-8"
            value={specialtyId}
            onChange={e => setSpecialtyId(e.target.value)}
            aria-label="Filter by specialty"
          >
            <option value="">All specialties</option>
            {specialties.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results summary */}
      {!loading && (
        <p className="text-sm mb-4" style={{ color: 'var(--clr-text-muted)' }}>
          {total} doctor{total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : doctors.length === 0 ? (
        <div className="card p-12 text-center">
          <p style={{ color: 'var(--clr-text-muted)' }}>No doctors match your search.</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map(d => <DoctorCard key={d.id} doctor={d} />)}
          </div>
          {/* Simple pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-2 mt-6">
              <button className="btn btn-outline btn-sm" disabled={page === 1}
                onClick={() => fetchDoctors(page - 1)}>← Prev</button>
              <span className="flex items-center text-sm px-2" style={{ color: 'var(--clr-text-muted)' }}>
                Page {page}
              </span>
              <button className="btn btn-outline btn-sm" disabled={doctors.length < 20}
                onClick={() => fetchDoctors(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
