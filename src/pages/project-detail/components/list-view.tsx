import React from 'react';
import type { Task } from '../../../types/task';
import PriorityBadge from '../../../components/common/priority-badge';
import { Calendar } from 'lucide-react';
import { getTaskDateDisplay } from '../../../utils/format-date';

import { getInitials } from '../../../utils/user.util';

interface ListViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task, tab?: 'details' | 'comments') => void;
}

export default function ListView({ tasks, onTaskClick }: ListViewProps) {
  if (tasks.length === 0) return <p className="text-center text-slate-400 text-sm py-6">No tasks yet.</p>;
  return (
    <div className="flex flex-col gap-2 px-6 py-4">
      {tasks.map((task) => {
        const dateDisplay = getTaskDateDisplay(task.startDate, task.dueDate);
        return (
          <div
            key={task.id}
            onClick={() => onTaskClick?.(task, 'details')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border border-transparent hover:bg-slate-50 hover:border-slate-200/60 transition-colors ${onTaskClick ? 'cursor-pointer' : ''}`}
          >
            <input
              type="checkbox"
              className="w-4 h-4 shrink-0 accent-indigo-600 cursor-pointer"
              aria-label={`Mark "${task.title}" as done`}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <span className="text-sm font-medium text-slate-900 truncate hover:text-indigo-600 transition-colors">
                {task.title}
              </span>
              <span className="text-xs text-slate-400">{task.projectName}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <PriorityBadge priority={task.priority} />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.7rem] font-semibold bg-slate-100 text-slate-500 border border-slate-200/60">
                {task.status}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTaskClick?.(task, 'comments');
                }}
                title={task.commentCount ? `${task.commentCount} comments` : 'View & add comments'}
                className="flex items-center gap-1 text-[0.7rem] text-slate-400 hover:text-indigo-600 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                {task.commentCount !== undefined && task.commentCount > 0 && (
                  <span className="font-semibold text-indigo-600">{task.commentCount}</span>
                )}
              </button>

              {dateDisplay && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {dateDisplay}
                </span>
              )}
              {task.assignee && (
                <div
                  className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[0.6rem] font-bold flex items-center justify-center overflow-hidden"
                  title={`Assignee: ${task.assignee.fullName}`}
                >
                  {task.assignee.avatarUrl ? (
                    <img src={task.assignee.avatarUrl} alt={task.assignee.fullName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(task.assignee.fullName)
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
