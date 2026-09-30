/**
 * client/src/pages/Login.jsx
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Stethoscope } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Input      from '../components/common/Input';
import Button     from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
    setApiError('');
  }

  function validate() {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const user = await login(form);
      const dest = user.role === 'doctor' ? '/doctor/dashboard'
                 : user.role === 'admin'  ? '/admin/dashboard'
                 : '/patient/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="glass-card p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2"
            style={{ background: 'var(--grad-primary)' }}>
            <Stethoscope size={22} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-sm">
            Sign in to your MediBook account
          </p>
        </div>

        {/* Error banner */}
        {apiError && (
          <div className="rounded-lg px-4 py-3 text-sm text-red-200"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}
            role="alert"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--clr-teal-500)' }} aria-hidden="true" />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              className="pl-9"
              autoComplete="email"
            />
          </div>

          <div className="relative">
            <Lock size={15} className="absolute left-3 top-9 pointer-events-none"
              style={{ color: 'var(--clr-teal-500)' }} aria-hidden="true" />
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              className="pl-9"
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold" style={{ color: 'var(--clr-teal-300)' }}>
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
