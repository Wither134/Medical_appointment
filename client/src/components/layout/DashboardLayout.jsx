/**
 * client/src/components/layout/DashboardLayout.jsx
 * Sidebar + main area layout for all role dashboards.
 */
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../hooks/useDarkMode';

export default function DashboardLayout({ navItems, children, title }) {
  const { user, logout } = useAuth();
  const [dark, toggleDark] = useDarkMode();
  const navigate           = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="flex min-h-screen dashboard-bg">
      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-60 shrink-0 flex flex-col fixed md:static inset-y-0 left-0 z-50 transition-transform duration-300 md:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid var(--clr-border)',
        }}
      >
        {/* Brand */}
        <div className="p-5 border-b" style={{ borderColor: 'var(--clr-border)' }}>
          <span className="text-lg font-bold grad-text">MediBook</span>
          <p className="text-xs mt-0.5" style={{ color: 'var(--clr-text-muted)' }}>
            {user?.full_name}
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1" aria-label="Dashboard navigation">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'var(--grad-primary)' } : { color: 'var(--clr-text-muted)' }}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-3 border-t space-y-1" style={{ borderColor: 'var(--clr-border)' }}>
          <button onClick={toggleDark} className="btn btn-ghost btn-sm w-full justify-start gap-2">
            {dark ? <Sun size={15} /> : <Moon size={15} />}
            {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm w-full justify-start gap-2 text-red-500">
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        {/* Top bar (mobile) */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3"
          style={{
            background: 'var(--glass-bg)',
            borderBottom: '1px solid var(--clr-border)',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <span className="font-bold grad-text">MediBook</span>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleDark} className="btn btn-ghost btn-icon btn-sm">
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <button onClick={handleLogout} className="btn btn-ghost btn-icon btn-sm text-red-500">
              <LogOut size={15} />
            </button>
          </div>
        </header>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex border-t"
          style={{ background: 'var(--glass-bg)', borderColor: 'var(--clr-border)', backdropFilter: 'blur(12px)' }}
          aria-label="Mobile navigation"
        >
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-2 text-xs font-medium transition-colors ${
                  isActive ? '' : ''
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--clr-teal-600)' : 'var(--clr-text-muted)',
              })}
            >
              <Icon size={18} aria-hidden="true" />
              <span className="mt-0.5">{label}</span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 pb-20 md:pb-8 md:p-8 fade-in">
          {title && (
            <h1 className="text-2xl font-bold mb-6 grad-text">{title}</h1>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
