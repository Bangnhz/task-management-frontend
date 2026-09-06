import React, { useEffect, useRef, useState } from 'react';
import { useUIStore } from '../../store/use-ui-store';

const suggestions = [
  { label: 'Dashboard',      icon: '⊞', type: 'page' },
  { label: 'My Tasks',       icon: '✓', type: 'page' },
  { label: 'Movie Booking',  icon: '⊟', type: 'project' },
  { label: 'E-Commerce',     icon: '⊟', type: 'project' },
  { label: 'Mobile App',     icon: '⊟', type: 'project' },
  { label: 'Create new task',icon: '+', type: 'action' },
];

export default function CommandMenu() {
  const { isCommandMenuOpen, closeCommandMenu } = useUIStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suggestions.filter((s) =>
    s.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isCommandMenuOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandMenuOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isCommandMenuOpen) closeCommandMenu();
        else useUIStore.getState().openCommandMenu();
      }
      if (e.key === 'Escape') closeCommandMenu();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isCommandMenuOpen, closeCommandMenu]);

  if (!isCommandMenuOpen) return null;

  return (
    <>
      <div
        onClick={closeCommandMenu}
        aria-hidden="true"
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-[520px] bg-white rounded-2xl shadow-[0_24px_60px_rgba(15,23,42,.2)] z-50 overflow-hidden"
      >
        {/* Input */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-slate-100">
          <span className="text-slate-400 text-lg" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, projects, tasks…"
            className="flex-1 border-none outline-none text-[0.95rem] bg-transparent text-slate-900 placeholder:text-slate-400"
          />
          <kbd className="text-[0.7rem] text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">Esc</kbd>
        </div>

        {/* Results */}
        <ul className="list-none m-0 p-1.5 max-h-80 overflow-y-auto">
          {filtered.length > 0 ? filtered.map((item) => (
            <li key={item.label}>
              <button
                onClick={closeCommandMenu}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm text-slate-900 text-left transition-colors"
              >
                <span className="text-slate-400 w-5 text-center">{item.icon}</span>
                {item.label}
                <span className="ml-auto text-[0.7rem] text-slate-400 capitalize">{item.type}</span>
              </button>
            </li>
          )) : (
            <li className="px-4 py-5 text-center text-sm text-slate-400">
              No results for "{query}"
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
