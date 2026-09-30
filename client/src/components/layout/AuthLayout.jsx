/**
 * client/src/components/layout/AuthLayout.jsx
 * Centered glass-card layout used for login/register pages.
 */
export default function AuthLayout({ children }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--grad-hero)' }}
    >
      {/* Floating blurred shapes */}
      <div aria-hidden="true" className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: 'var(--clr-teal-300)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/2 -right-24 w-72 h-72 rounded-full opacity-15"
          style={{ background: 'var(--clr-blue-400)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full opacity-10"
          style={{ background: 'var(--clr-mint-200)', filter: 'blur(70px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md fade-in">
        {children}
      </div>
    </div>
  );
}
