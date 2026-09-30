/**
 * client/src/pages/Landing.jsx
 * Hero landing page with gradient background, floating shapes, and feature cards.
 */
import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import {
  CalendarCheck, ShieldCheck, Clock, Users,
  Stethoscope, Star, ArrowRight, CheckCircle,
} from 'lucide-react';

const FEATURES = [
  {
    Icon: CalendarCheck,
    title: 'Easy Booking',
    desc:  'Book appointments in seconds. Pick your doctor, choose a slot, and you are confirmed.',
  },
  {
    Icon: Clock,
    title: 'Real-Time Availability',
    desc:  'Live slot availability — no double-booking, no waiting on hold.',
  },
  {
    Icon: ShieldCheck,
    title: 'Secure & Private',
    desc:  'Your health data is protected with role-based access and encrypted credentials.',
  },
  {
    Icon: Users,
    title: 'Multi-Role Platform',
    desc:  'Patients, doctors, and admins each get a tailored dashboard experience.',
  },
];

const STATS = [
  { value: '50+', label: 'Specialist Doctors' },
  { value: '10k+', label: 'Appointments Booked' },
  { value: '98%', label: 'Patient Satisfaction' },
  { value: '24/7', label: 'Platform Availability' },
];

const HOW = [
  { step: '1', title: 'Create an account', desc: 'Sign up as a patient in under a minute.' },
  { step: '2', title: 'Find your doctor',  desc: 'Search by name or specialty and view profiles.' },
  { step: '3', title: 'Pick a time slot',  desc: 'Select any open 30-minute slot that suits you.' },
  { step: '4', title: 'Get a reminder',    desc: 'Receive a reminder 24 hours before your visit.' },
];

export default function Landing() {
  return (
    <div style={{ background: 'var(--clr-bg)' }}>
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-24 md:py-36 px-4"
        style={{ background: 'var(--grad-hero)' }}
      >
        {/* Floating blurred shapes */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20"
            style={{ background: 'var(--clr-teal-300)', filter: 'blur(90px)' }} />
          <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full opacity-15"
            style={{ background: 'var(--clr-blue-400)', filter: 'blur(80px)' }} />
          <div className="absolute bottom-0 left-1/2 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'var(--clr-mint-200)', filter: 'blur(70px)' }} />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
          >
            <Star size={12} aria-hidden="true" /> Trusted by thousands of patients
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Healthcare appointments,{' '}
            <span
              className="inline-block"
              style={{
                background: 'linear-gradient(90deg, #5eead4, #a7f3d0)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              simplified.
            </span>
          </h1>

          <p className="text-lg md:text-xl max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.75)' }}>
            Book doctor appointments online in seconds. No phone calls, no waiting rooms.
            Just healthcare when you need it.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="btn btn-accent btn-xl">
              Get Started Free
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/login" className="btn btn-xl"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}>
              Sign in
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
            <CheckCircle size={14} aria-hidden="true" />
            No credit card required
          </div>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────────────── */}
      <section className="py-12 px-4" style={{ background: 'var(--clr-bg-subtle)' }}>
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold grad-text">{value}</p>
              <p className="text-sm mt-1" style={{ color: 'var(--clr-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: 'var(--grad-page)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-2">
            Everything you need,{' '}
            <span className="grad-text">in one place</span>
          </h2>
          <p className="text-center mb-12" style={{ color: 'var(--clr-text-muted)' }}>
            A full-featured scheduling platform for patients, doctors, and administrators.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ Icon, title, desc }) => (
              <div key={title} className="card card-accent p-5 space-y-3 doctor-card">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--grad-primary)' }}
                >
                  <Icon size={20} color="white" aria-hidden="true" />
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--clr-text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: 'var(--clr-bg-subtle)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How it <span className="grad-text">works</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW.map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-lg"
                  style={{ background: 'var(--grad-primary)' }}
                >
                  {step}
                </div>
                <h4 className="font-semibold">{title}</h4>
                <p className="text-sm" style={{ color: 'var(--clr-text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: 'var(--grad-hero)' }}>
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to take control of your healthcare?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>
            Join thousands of patients who manage their appointments with MediBook.
          </p>
          <Link to="/register" className="btn btn-accent btn-xl">
            Book your first appointment
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="py-8 px-4 text-center text-sm" style={{ color: 'var(--clr-text-muted)', borderTop: '1px solid var(--clr-border)' }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Stethoscope size={16} style={{ color: 'var(--clr-teal-600)' }} aria-hidden="true" />
          <span className="font-semibold grad-text">MediBook</span>
        </div>
        <p>© {new Date().getFullYear()} MediBook. Built as a portfolio project.</p>
      </footer>
    </div>
  );
}
