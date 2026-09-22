import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PriorityBadge from '../../components/common/priority-badge';
import { TaskRowSkeleton } from '../../components/common/loading-skeleton';
import EmptyState from '../../components/common/empty-state';
import { useTasksByUser } from '../../hooks/use-tasks-by-user';
import type { TaskSummaryDTO, Priority } from '../../types/task';
import { formatShortDate } from '../../utils/format-date';

const TABS  = ['All', 'Today', 'Upcoming', 'Overdue'] as const;
const SORTS = ['Due date', 'Priority', 'Name'] as const;
type Tab  = typeof TABS[number];
type Sort = typeof SORTS[number];

const PRIORITY_ORDER: Record<Priority, number> = { High: 0, Medium: 1, Low: 2, Urgent: 0 };

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

function filterAndSort(tasks: TaskSummaryDTO[], tab: Tab, sort: Sort): TaskSummaryDTO[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 86_400_000);

  const filtered = tasks.filter((t) => {
    if (tab === 'All') return true;
    if (!t.dueDate) return tab === 'Upcoming';
    const due = new Date(t.dueDate);
    if (tab === 'Today')    return due >= today && due < tomorrow;
    if (tab === 'Upcoming') return due >= tomorrow;
    if (tab === 'Overdue')  return due < today;
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sort === 'Due date') return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
    if (sort === 'Priority') {
      const aPriority = mapPriority(a.priority);
      const bPriority = mapPriority(b.priority);
      return PRIORITY_ORDER[aPriority] - PRIORITY_ORDER[bPriority];
    }
    if (sort === 'Name')     return a.title.localeCompare(b.title);
    return 0;
  });
}

export default function MyTasksPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('All');
  const [sort, setSort] = useState<Sort>('Due date');
  const { tasks, isLoading, error, refetch } = useTasksByUser();
  const list = filterAndSort(tasks, activeTab, sort);

  const handleTaskClick = (task: TaskSummaryDTO) => {
    const targetProjectId = task.projectId || (task as any).project?.id;
    if (targetProjectId) {
      navigate(`/projects/${targetProjectId}`);
    }
  };

  const counts = {
    All:      tasks.length,
    Today:    filterAndSort(tasks, 'Today', sort).length,
    Upcoming: filterAndSort(tasks, 'Upcoming', sort).length,
    Overdue:  filterAndSort(tasks, 'Overdue', sort).length,
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-slate-900 m-0">My Tasks</h1>
          <p className="text-xs text-slate-400 mt-1 m-0">All tasks assigned to you</p>
        </div>
        <button className="bg-indigo-600 hover:opacity-90 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-opacity">
          + New Task
        </button>
      </div>

      {/* Tabs + Sort */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
          {TABS.map((t) => (
            <button
              key={t} role="tab" aria-selected={activeTab === t}
              onClick={() => setActiveTab(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5
                ${activeTab === t ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {t}
              {counts[t] > 0 && (
                <span className={`text-[0.65rem] px-1.5 py-0.5 rounded-full font-bold
                  ${activeTab === t ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-500'}`}>
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Sort by</span>
          <div className="flex gap-0.5 bg-slate-100 rounded-lg p-0.5">
            {SORTS.map((s) => (
              <button
                key={s} onClick={() => setSort(s)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${sort === s ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        {/* Column headers - check if any task has comments to decide whether to show the column */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-100 text-[0.7rem] font-bold uppercase tracking-wider text-slate-400">
          <span>Task</span>
          <span className="w-20 text-center">Priority</span>
          <span className="w-20 text-center">Due date</span>
          <span className="w-20 text-center">Project</span>
        </div>

        {isLoading && (
          <div className="flex flex-col divide-y divide-slate-100">
            {[1,2,3,4,5].map((n) => <TaskRowSkeleton key={n} />)}
          </div>
        )}

        {!isLoading && error && (
          <EmptyState icon="⚠" title="Failed to load tasks" description={error}
            action={<button onClick={refetch} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium hover:bg-slate-50">Retry</button>}
          />
        )}

        {!isLoading && !error && list.length === 0 && (
          <EmptyState icon="✓"
            title={activeTab === 'All' ? 'No tasks yet' : `No ${activeTab.toLowerCase()} tasks`}
            description="Create a new task or wait for task assignment."
          />
        )}

        {!isLoading && !error && list.length > 0 && (
          <div className="divide-y divide-slate-100">
            {list.map((task) => (
              <TaskRow key={task.id} task={task} onTaskClick={handleTaskClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({
  task,
  onTaskClick,
}: {
  task: TaskSummaryDTO;
  onTaskClick: (task: TaskSummaryDTO) => void;
}) {
  const targetProjectId = task.projectId || (task as any).project?.id;
  const dueLabel = task.dueDate ? formatShortDate(task.dueDate) : '—';
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  // Check if task has commentCount (it might be in the data but not in the type)
  const taskWithAny = task as any;
  const commentCount = taskWithAny.commentCount;

  return (
    <div
      onClick={() => {
        if (targetProjectId) {
          onTaskClick(task);
        }
      }}
      className={`grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-3 hover:bg-slate-50 transition-colors group ${
        targetProjectId ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <input
          type="checkbox"
          onClick={(e) => e.stopPropagation()}
          className="w-4 h-4 shrink-0 accent-indigo-600 cursor-pointer"
          aria-label={`Mark as done: ${task.title}`}
        />
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 m-0 truncate group-hover:text-indigo-600 transition-colors">
            {task.title}
          </p>
          {task.listTitle && <p className="text-xs text-slate-400 m-0 mt-0.5">{task.listTitle}</p>}
        </div>
      </div>
      <div className="w-20 flex justify-center">
        <PriorityBadge priority={mapPriority(task.priority)} />
        {commentCount !== undefined && commentCount > 0 && (
          <div className="ml-2 flex items-center gap-1 text-[0.7rem] text-slate-500">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="font-medium">{commentCount}</span>
          </div>
        )}
      </div>
      <div className="w-20 text-center">
        <span className={`text-xs font-medium ${isOverdue ? 'text-red-500' : 'text-slate-500'}`}>
          {dueLabel}
        </span>
      </div>
      <div className="w-20 text-center">
        <span className="text-xs text-slate-400 truncate group-hover:text-indigo-600 transition-colors font-medium">
          {task.projectTitle || '—'}
        </span>
      </div>
    </div>
  );
}
