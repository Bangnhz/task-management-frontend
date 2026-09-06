import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';
import { AuthField } from './login-page';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setClientError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setClientError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setClientError('Password must be at least 6 characters.'); return; }
    try { await register({ fullName: form.fullName, email: form.email, password: form.password }); navigate('/'); } catch {}
  }

  const displayError = clientError ?? error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-6">
      <div className="w-full max-w-[400px] bg-white border border-slate-200/60 rounded-2xl px-8 py-9 shadow-md flex flex-col gap-6">

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">TF</div>
          <span className="text-[0.95rem] font-bold text-slate-900">TaskFlow</span>
        </div>

        <div>
          <h1 className="text-xl font-bold text-slate-900 m-0 mb-1">Create Account</h1>
          <p className="text-sm text-slate-500 m-0">Start managing your tasks more effectively.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <AuthField label="Full name" name="fullName" type="text" value={form.fullName} onChange={handleChange} placeholder="John Doe" autoComplete="name" required />
          <AuthField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required />
          <AuthField
            label="Password" name="password" type={showPassword ? 'text' : 'password'}
            value={form.password} onChange={handleChange} placeholder="Minimum 6 characters"
            autoComplete="new-password" required
            suffix={
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="text-xs text-slate-400 hover:text-slate-600 px-1">
                {showPassword ? 'Hide' : 'Show'}
              </button>
            }
          />
          <AuthField label="Confirm password" name="confirmPassword" type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" autoComplete="new-password" required />

          {displayError && (
            <div className="px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{displayError}</div>
          )}

          <button
            type="submit" disabled={isLoading}
            className="w-full bg-indigo-600 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-2.5 rounded-lg transition-opacity mt-1"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 m-0">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
