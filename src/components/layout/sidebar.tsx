import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '../../store/use-ui-store';
import { useAuthStore } from '../../store/use-auth-store';
import SidebarProjects from './sidebar-projects';
import UserCard from '../common/user-card';

const navItems = [
  { label: 'Dashboard', icon: '⊞', to: '/' },
  { label: 'My Tasks', icon: '✓', to: '/my-tasks' },
  { label: 'Calendar', icon: '◫', to: '/calendar' },
  { label: 'Workspaces', icon: '◰', to: '/workspaces' },
];

export default function Sidebar() {
  const { isSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  if (!isSidebarOpen) return null;

  const initials = user?.fullName
    ? (() => {
      const words = user.fullName.trim().split(/\s+/);
      return words.length > 1
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : words[0][0].toUpperCase();
    })()
    : user?.email?.slice(0, 2).toUpperCase() ?? '?';

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-slate-200/60 flex flex-col gap-6 px-3.5 py-5 sticky top-0 h-screen overflow-y-auto scrollbar-none">

      {/* Brand */}
      <div className="flex items-center gap-2.5 px-1.5">
        <div className="w-9 h-9 rounded-[10px] bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">TF</div>
        <div>
          <p className="text-[0.95rem] font-bold text-slate-900 m-0">TaskFlow</p>
          <p className="text-xs text-slate-500 m-0">Workspace</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors no-underline
              ${isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`
            }
          >
            <span className="w-[18px] text-center text-base" aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Projects Section */}
      <SidebarProjects />

      {/* Footer */}
      <div className="mt-auto flex flex-col gap-1 border-t border-slate-200/60 pt-4">
        {user && <UserCard user={user} className="px-3 py-2 rounded-lg mt-1" />}
      </div>
    </aside>
  );
}