import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try { await login(form); navigate('/'); } catch {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-6">
      <div className="w-full max-w-[400px] bg-white border border-slate-200/60 rounded-2xl px-8 py-9 shadow-md flex flex-col gap-6">

        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">TF</div>
          <span className="text-[0.95rem] font-bold text-slate-900">TaskFlow</span>
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900 m-0 mb-1">Sign In</h1>
          <p className="text-sm text-slate-500 m-0">Welcome back! Please enter your details.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <AuthField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required />
          <AuthField
            label="Password" name="password" type={showPassword ? 'text' : 'password'}
            value={form.password} onChange={handleChange} placeholder="Enter password"
            autoComplete="current-password" required
            suffix={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-xs text-slate-400 hover:text-slate-600 px-1">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            }
          />

          {error && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit" disabled={isLoading}
            className="w-full bg-indigo-600 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-opacity mt-1"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 m-0">
          Don't have an account?{' '}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">Sign up now</Link>
        </p>
      </div>
    </div>
  );
}

// ── Shared Field ──────────────────────────────────────────────
interface AuthFieldProps {
  label: string; name: string; type: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; autoComplete?: string; required?: boolean;
  suffix?: React.ReactNode;
}

export function AuthField({ label, name, type, value, onChange, placeholder, autoComplete, required, suffix }: AuthFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-semibold text-slate-700">{label}</label>
      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 px-3 focus-within:border-indigo-500 focus-within:bg-white transition-colors">
        <input
          id={name} name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete={autoComplete} required={required}
          className="flex-1 border-none outline-none bg-transparent py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
        />
        {suffix && <div className="flex items-center shrink-0">{suffix}</div>}
      </div>
    </div>
  );
}
