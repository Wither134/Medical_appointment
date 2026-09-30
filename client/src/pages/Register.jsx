/**
 * client/src/pages/Register.jsx
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Stethoscope } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import Input      from '../components/common/Input';
import Button     from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({
    full_name: '', email: '', password: '', confirm: '', phone: '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
    setApiError('');
  }

  function validate() {
    const errs = {};
    if (!form.full_name.trim())           errs.full_name = 'Full name is required';
    if (!form.email)                       errs.email     = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password)                    errs.password  = 'Password is required';
    else if (form.password.length < 8)     errs.password  = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(form.password)) errs.password  = 'Must contain an uppercase letter';
    else if (!/[0-9]/.test(form.password)) errs.password  = 'Must contain a number';
    if (form.password !== form.confirm)    errs.confirm   = 'Passwords do not match';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { full_name, email, password, phone } = form;
      await register({ full_name, email, password, phone: phone || undefined });
      navigate('/patient/dashboard', { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <div className="glass-card p-8 space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-2"
            style={{ background: 'var(--grad-primary)' }}>
            <Stethoscope size={22} color="white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)' }} className="text-sm">
            Join MediBook — it&apos;s free
          </p>
        </div>

        {apiError && (
          <div className="rounded-lg px-4 py-3 text-sm text-red-200"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}
            role="alert"
          >
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input id="full_name" name="full_name" label="Full name" placeholder="Jane Doe"
            value={form.full_name} onChange={handleChange} error={errors.full_name} />
          <Input id="email" name="email" type="email" label="Email address"
            placeholder="you@example.com" value={form.email}
            onChange={handleChange} error={errors.email} autoComplete="email" />
          <Input id="phone" name="phone" type="tel" label="Phone (optional)"
            placeholder="+1 555 000 0000" value={form.phone}
            onChange={handleChange} error={errors.phone} />
          <Input id="password" name="password" type="password" label="Password"
            placeholder="••••••••" value={form.password}
            onChange={handleChange} error={errors.password} autoComplete="new-password" />
          <Input id="confirm" name="confirm" type="password" label="Confirm password"
            placeholder="••••••••" value={form.confirm}
            onChange={handleChange} error={errors.confirm} autoComplete="new-password" />

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold" style={{ color: 'var(--clr-teal-300)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
