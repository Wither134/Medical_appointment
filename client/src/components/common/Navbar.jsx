/**
 * client/src/components/common/Navbar.jsx
 */
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, User, LayoutDashboard, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dark, toggleDark] = useDarkMode();
  const navigate = useNavigate();

  const dashboardPath = user
    ? user.role === 'doctor' ? '/doctor/dashboard'
    : user.role === 'admin'  ? '/admin/dashboard'
    : '/patient/dashboard'
    : '/';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav
      className="sticky top-0 z-40 flex items-center justify-between px-4 md:px-8 py-3"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--glass-border)',
        boxShadow: '0 1px 12px rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-lg font-bold no-underline">
        <span className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: 'var(--grad-primary)' }}>
          <Stethoscope size={16} color="white" />
        </span>
        <span className="grad-text">MediBook</span>
      </Link>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={toggleDark}
          className="btn btn-ghost btn-icon btn-sm"
          aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {user ? (
          <>
            <Link
              to={dashboardPath}
              className="btn btn-ghost btn-sm hidden sm:inline-flex"
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
            <span
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ background: 'var(--clr-teal-50)', color: 'var(--clr-teal-700)' }}
            >
              <User size={13} />
              {user.full_name.split(' ')[0]}
            </span>
            <button onClick={handleLogout} className="btn btn-outline btn-sm" aria-label="Log out">
              <LogOut size={14} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login"    className="btn btn-ghost btn-sm">Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
