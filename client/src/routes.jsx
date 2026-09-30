/**
 * client/src/routes.jsx
 * Route map with role-based private route guards.
 */
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Lazy-load pages for better initial bundle size
import { lazy, Suspense } from 'react';
const Landing              = lazy(() => import('./pages/Landing'));
const Login                = lazy(() => import('./pages/Login'));
const Register             = lazy(() => import('./pages/Register'));
const PatientDashboard     = lazy(() => import('./pages/patient/PatientDashboard'));
const SearchDoctors        = lazy(() => import('./pages/patient/SearchDoctors'));
const BookAppointment      = lazy(() => import('./pages/patient/BookAppointment'));
const AppointmentHistory   = lazy(() => import('./pages/patient/AppointmentHistory'));
const DoctorDashboard      = lazy(() => import('./pages/doctor/DoctorDashboard'));
const ManageAvailability   = lazy(() => import('./pages/doctor/ManageAvailability'));
const ScheduleView         = lazy(() => import('./pages/doctor/ScheduleView'));
const AdminDashboard       = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageDoctors        = lazy(() => import('./pages/admin/ManageDoctors'));
const AdminAppointments    = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminUsers           = lazy(() => import('./pages/admin/AdminUsers'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen" style={{ background: 'var(--clr-bg)' }}>
      <div className="w-8 h-8 border-4 rounded-full animate-spin"
        style={{ borderColor: 'var(--clr-teal-300)', borderTopColor: 'var(--clr-teal-600)' }} />
    </div>
  );
}

/**
 * Wrap a component in a Suspense boundary with the fallback loader.
 */
function S(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

/**
 * Redirects to /login if not authenticated, or to the role dashboard
 * if the current user's role is not in `allowedRoles`.
 */
function PrivateRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) return <PageLoader />;
  if (!user)   return <Navigate to="/login" state={{ from: location }} replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dest = user.role === 'doctor' ? '/doctor/dashboard'
               : user.role === 'admin'  ? '/admin/dashboard'
               : '/patient/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}

export const routes = [
  { path: '/',         element: S(Landing)   },
  { path: '/login',    element: S(Login)     },
  { path: '/register', element: S(Register)  },

  // Patient
  { path: '/patient/dashboard', element: <PrivateRoute allowedRoles={['patient']}>{S(PatientDashboard)}</PrivateRoute> },
  { path: '/patient/search',    element: <PrivateRoute allowedRoles={['patient']}>{S(SearchDoctors)}</PrivateRoute> },
  { path: '/patient/book/:doctorId', element: <PrivateRoute allowedRoles={['patient']}>{S(BookAppointment)}</PrivateRoute> },
  { path: '/patient/history',   element: <PrivateRoute allowedRoles={['patient']}>{S(AppointmentHistory)}</PrivateRoute> },

  // Doctor
  { path: '/doctor/dashboard',    element: <PrivateRoute allowedRoles={['doctor']}>{S(DoctorDashboard)}</PrivateRoute> },
  { path: '/doctor/availability', element: <PrivateRoute allowedRoles={['doctor']}>{S(ManageAvailability)}</PrivateRoute> },
  { path: '/doctor/schedule',     element: <PrivateRoute allowedRoles={['doctor']}>{S(ScheduleView)}</PrivateRoute> },

  // Admin
  { path: '/admin/dashboard',    element: <PrivateRoute allowedRoles={['admin']}>{S(AdminDashboard)}</PrivateRoute> },
  { path: '/admin/doctors',      element: <PrivateRoute allowedRoles={['admin']}>{S(ManageDoctors)}</PrivateRoute> },
  { path: '/admin/appointments', element: <PrivateRoute allowedRoles={['admin']}>{S(AdminAppointments)}</PrivateRoute> },
  { path: '/admin/users',        element: <PrivateRoute allowedRoles={['admin']}>{S(AdminUsers)}</PrivateRoute> },

  // Fallback
  { path: '*', element: <Navigate to="/" replace /> },
];
