import React, { useState } from 'react';
import type { ActivityItem } from '../../../types/user';

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: '1', userId: 'u1', user: 'Nguyễn Văn A',    initials: 'NA', action: 'completed',    item: 'Implement authentication', time: '2 min ago',  createdAt: '' },
  { id: '2', userId: 'u2', user: 'Trần Thị B',      initials: 'TB', action: 'commented on', item: 'Design payment page',      time: '15 min ago', createdAt: '' },
  { id: '3', userId: 'u3', user: 'Nguyễn Hữu Bằng', initials: 'HB', action: 'moved',        item: 'VNPay API to In Progress', time: '1 hour ago', createdAt: '' },
];

const FILTERS = ['All', 'Mine', 'Team'] as const;

export default function RecentActivity() {
  const [filter, setFilter] = useState<typeof FILTERS[number]>('All');

  return (
    <section className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900 m-0">Recent Activity</h2>
          <p className="text-xs text-slate-400 mt-1 m-0">What your team has been up to</p>
        </div>
        <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f} role="tab" aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${filter === f ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        {MOCK_ACTIVITY.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center justify-center shrink-0" aria-hidden="true">
              {a.initials}
            </div>
            <p className="flex-1 text-sm text-slate-900 m-0">
              <strong>{a.user}</strong> {a.action} <span className="font-medium">"{a.item}"</span>
            </p>
            <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{a.time}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
