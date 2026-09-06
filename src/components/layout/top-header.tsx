import { Menu } from 'lucide-react';
import { useUIStore } from '../../store/use-ui-store';
import UserMenu from './user-menu';
import NotificationBell from '../notification/NotificationBell';

interface TopHeaderProps {
  greeting?: string;
  subtitle?: string;
}

export default function TopHeader({
  greeting = 'Good morning 👋',
  subtitle = "Here's what's happening across your projects today.",
}: TopHeaderProps) {
  const { openCommandMenu, toggleSidebar } = useUIStore();

  return (
    <header className="h-[72px] flex items-center justify-between gap-4 px-6 bg-white border-b border-slate-200/60 sticky top-0 z-10 shrink-0">
      {/* Toggle Sidebar Button & Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[1.05rem] font-bold text-slate-900 m-0">{greeting}</h1>
          <p className="text-xs text-slate-500 m-0">{subtitle}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <button
          onClick={openCommandMenu}
          aria-label="Open search (Ctrl K)"
          className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-lg px-2.5 py-1.5 min-w-[220px] cursor-pointer hover:bg-white transition-colors"
        >
          <span className="text-slate-400 text-base" aria-hidden="true">⌕</span>
          <span className="flex-1 text-left text-slate-400 text-sm">Search tasks, projects…</span>
          <kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[0.7rem] text-slate-400 whitespace-nowrap">
            Ctrl K
          </kbd>
        </button>

        {/* Create */}
        <button
          aria-label="Create new task"
          className="bg-indigo-600 hover:opacity-90 text-white font-semibold text-xs px-3.5 py-[7px] rounded-lg transition-opacity"
        >
          + Create
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        <UserMenu />
      </div>
    </header>
  );
}
