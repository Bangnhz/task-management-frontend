import React, { useState } from 'react';
import PriorityBadge from '../../../components/common/priority-badge';
import { TaskRowSkeleton } from '../../../components/common/loading-skeleton';
import EmptyState from '../../../components/common/empty-state';
import { useTasksByUser } from '../../../hooks/use-tasks-by-user';
import type { TaskSummaryDTO, Priority } from '../../../types/task';
import { formatRelativeDay, formatShortDate } from '../../../utils/format-date';

const TABS = ['All', 'Today', 'Upcoming', 'Overdue'] as const;
type Tab = typeof TABS[number];

// Helper to map backend priority string to Priority type
function mapPriority(backendPriority: string): Priority {
  switch (backendPriority?.toUpperCase()) {
    case 'HIGH': return 'High';
    case 'MEDIUM': return 'Medium';
    case 'LOW': return 'Low';
    case 'URGENT': return 'Urgent';
    default: return 'Medium';
  }
}

function filterByTab(tasks: TaskSummaryDTO[], tab: Tab): TaskSummaryDTO[] {
  if (tab === 'All') return tasks;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday   = new Date(startOfToday.getTime() + 86_400_000);
  return tasks.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    if (tab === 'Today')    return due >= startOfToday && due < endOfToday;
    if (tab === 'Upcoming') return due >= endOfToday;
    if (tab === 'Overdue')  return due < startOfToday;
    return true;
  });
}

function buildDeadlines(tasks: TaskSummaryDTO[]) {
  return [...tasks]
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4)
    .map((t) => ({ 
      id: t.id, 
      day: formatRelativeDay(t.dueDate), 
      date: formatShortDate(t.dueDate), 
      task: t.title, 
      board: t.projectTitle, 
      priority: mapPriority(t.priority) 
    }));
}

export default function MyTasksSection() {
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const { tasks, isLoading, error, refetch } = useTasksByUser();
  const filtered  = filterByTab(tasks, activeTab);
  const deadlines = buildDeadlines(tasks);

  return (
    <section className="grid gap-4" style={{ gridTemplateColumns: '1.6fr 1fr' }}>

      {/* My Tasks */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 m-0">My Tasks</h2>
            <p className="text-xs text-slate-400 mt-1 m-0">Assigned to you across all projects</p>
          </div>
          {/* Tabs */}
          <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {TABS.map((t) => (
              <button
                key={t} role="tab" aria-selected={activeTab === t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer
                  ${activeTab === t ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <div className="flex flex-col gap-2">{[1,2,3].map((n) => <TaskRowSkeleton key={n} />)}</div>}

        {!isLoading && error && (
          <EmptyState icon="⚠" title="Failed to load tasks" description={error}
            action={<button onClick={refetch} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50 cursor-pointer">Retry</button>}
          />
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <EmptyState icon="✓" title={activeTab === 'All' ? 'No tasks yet' : `No ${activeTab.toLowerCase()} tasks`} description="Create a new task or wait to be assigned." />
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-2">
            {filtered.map((task) => <TaskRow key={task.id} task={task} />)}
          </div>
        )}
      </div>

      {/* Deadlines */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-slate-900 m-0">Deadlines</h2>
          <p className="text-xs text-slate-400 mt-1 m-0">Upcoming due dates</p>
        </div>

        {isLoading && <div className="flex flex-col gap-2">{[1,2,3].map((n) => <TaskRowSkeleton key={n} />)}</div>}
        {!isLoading && deadlines.length === 0 && <EmptyState icon="◫" title="No upcoming deadlines" />}
        {!isLoading && deadlines.length > 0 && (
          <div className="flex flex-col gap-2">
            {deadlines.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-200/60 transition-colors">
                <div className="flex flex-col items-center gap-0.5 min-w-[52px] text-center">
                  <span className="text-[0.7rem] font-bold text-indigo-600 uppercase">{d.day}</span>
                  <span className="text-[0.78rem] text-slate-400">{d.date}</span>
                </div>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-slate-900 truncate">{d.task}</span>
                  <span className="text-xs text-slate-400">{d.board}</span>
                </div>
                <PriorityBadge priority={d.priority} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TaskRow({ task }: { task: TaskSummaryDTO }) {
  const dueLabel = task.dueDate ? formatShortDate(task.dueDate) : '—';
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-200/60 transition-colors">
      <input type="checkbox" className="w-4 h-4 shrink-0 accent-indigo-600 cursor-pointer" aria-label={`Mark "${task.title}" as done`} />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-sm font-medium text-slate-900 truncate">{task.title}</span>
        <span className="text-xs text-slate-400">{task.projectTitle}{task.listTitle && <> · {task.listTitle}</>}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <PriorityBadge priority={mapPriority(task.priority)} />
        <span className="text-xs text-slate-400 whitespace-nowrap">{dueLabel}</span>
      </div>
    </div>
  );
}
