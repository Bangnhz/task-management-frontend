import React, { useState } from 'react';

interface Notification {
  id: string;
  type: 'task_assigned' | 'comment' | 'mention' | 'deadline';
  title: string;
  body: string;
  time: string;
  read: boolean;
  avatar: string;
  from: string;
}

const MOCK: Notification[] = [
  { id: '1', type: 'task_assigned', title: 'New task assigned',       body: 'Implement VNPay Payment API has been assigned to you',   time: '2 min ago',   read: false, avatar: 'TM', from: 'Trần Minh' },
  { id: '2', type: 'comment',       title: 'New comment',             body: 'Nguyễn Văn A commented on "Design Landing Page"',          time: '15 min ago',  read: false, avatar: 'NA', from: 'Nguyễn Văn A' },
  { id: '3', type: 'mention',       title: 'You were mentioned',      body: '@you was mentioned in "Payment flow discussion"',          time: '1 hour ago',  read: false, avatar: 'TB', from: 'Trần Thị B' },
  { id: '4', type: 'deadline',      title: 'Deadline reminder',       body: '"Implement VNPay API" is due tomorrow',                   time: '3 hours ago', read: true,  avatar: '🔔', from: 'System' },
  { id: '5', type: 'task_assigned', title: 'Task status updated',     body: '"Design Landing Page" was moved to Review',               time: 'Yesterday',   read: true,  avatar: 'HB', from: 'Nguyễn Hữu Bằng' },
];

const TYPE_ICON: Record<Notification['type'], string> = {
  task_assigned: '✓',
  comment:       '💬',
  mention:       '@',
  deadline:      '⏰',
};

const TYPE_COLOR: Record<Notification['type'], string> = {
  task_assigned: 'bg-indigo-100 text-indigo-700',
  comment:       'bg-blue-100 text-blue-700',
  mention:       'bg-amber-100 text-amber-700',
  deadline:      'bg-red-100 text-red-600',
};

const FILTERS = ['All', 'Unread', 'Tasks', 'Comments', 'Mentions'] as const;
type Filter = typeof FILTERS[number];

export default function InboxPage() {
  const [filter, setFilter] = useState<Filter>('All');
  const [items, setItems] = useState(MOCK);

  const filtered = items.filter((n) => {
    if (filter === 'Unread')   return !n.read;
    if (filter === 'Tasks')    return n.type === 'task_assigned' || n.type === 'deadline';
    if (filter === 'Comments') return n.type === 'comment';
    if (filter === 'Mentions') return n.type === 'mention';
    return true;
  });

  const unreadCount = items.filter((n) => !n.read).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 m-0">Inbox</h1>
            {unreadCount > 0 && (
              <span className="bg-indigo-600 text-white text-[0.65rem] font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 m-0">Notifications and updates from your team</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs font-semibold text-indigo-600 hover:underline px-2 py-1">
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5 self-start">
        {FILTERS.map((f) => (
          <button
            key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
              ${filter === f ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <span className="text-4xl block mb-3 opacity-30">✉</span>
            <p className="font-semibold text-slate-700 m-0">All caught up!</p>
            <p className="text-xs text-slate-400 mt-1 m-0">No notifications here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((n) => (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors hover:bg-slate-50 ${!n.read ? 'bg-indigo-50/40' : ''}`}
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${TYPE_COLOR[n.type]}`}>
                  {TYPE_ICON[n.type]}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className={`text-sm m-0 ${!n.read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {n.title}
                    </p>
                    <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 m-0">{n.body}</p>
                </div>

                {/* Unread dot */}
                {!n.read && (
                  <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
