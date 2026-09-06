import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/use-auth-store';
import { useAuth } from '../../hooks/use-auth';
import UserCard, { getUserInitials } from '../common/user-card';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    function handler(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // ── Guest ──
  if (!user) {
    return (
      <div ref={ref} className="relative">
        <button onClick={() => setOpen((v) => !v)} aria-haspopup="true" aria-expanded={open} aria-label="Sign in"
          className={`w-9 h-9 rounded-full bg-slate-100 border-2 flex items-center justify-center text-slate-400 text-base transition-colors
            ${open ? 'border-indigo-500' : 'border-slate-200 hover:border-slate-300'}`}>
          👤
        </button>
        {open && (
          <div className="absolute top-[calc(100%+8px)] right-0 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-30 p-1.5">
            <p className="px-2.5 py-1.5 text-xs text-slate-400">You are not signed in</p>
            <MenuItem label="→ Sign In"  onClick={() => { setOpen(false); navigate('/login'); }} />
            <MenuItem label="✦ Register" onClick={() => { setOpen(false); navigate('/register'); }} />
          </div>
        )}
      </div>
    );
  }

  const initials = getUserInitials(user);

  return (
    <div ref={ref} className="relative">
      {/* Avatar trigger */}
      <button onClick={() => setOpen((v) => !v)} aria-haspopup="true" aria-expanded={open} aria-label="Account"
        className={`w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 font-bold text-xs border-2 flex items-center justify-center overflow-hidden transition-colors
          ${open ? 'border-indigo-500' : 'border-transparent hover:border-indigo-300'}`}>
        {user.avatarUrl
          ? <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
          : initials}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 w-[232px] bg-white border border-slate-200 rounded-xl shadow-[0_8px_24px_rgba(15,23,42,.12)] z-30 overflow-hidden">

          {/* ← Dùng UserCard thay cho đoạn HTML lặp */}
          <UserCard user={user} className="px-4 py-3.5 border-b border-slate-100" />

          <div className="p-1.5">
            <MenuItem label="👤 Account Profile" onClick={() => { setOpen(false); navigate('/account'); }} />
            <MenuItem label="⚙ Settings"        onClick={() => setOpen(false)} />
          </div>
          <div className="border-t border-slate-100 p-1.5">
            <MenuItem label="↪ Sign Out" danger onClick={() => { setOpen(false); logout(); navigate('/login'); }} />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick, danger }: { label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button role="menuitem" onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-left transition-colors
        ${danger ? 'text-red-600 hover:bg-red-50' : 'text-slate-700 hover:bg-slate-50'}`}>
      {label}
    </button>
  );
}
