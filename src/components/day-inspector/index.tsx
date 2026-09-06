import React from 'react';
import type { Task } from '../../types/task';
import PriorityBadge from '../common/priority-badge';
import { Calendar as CalendarIcon, MessageSquare, Clock } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export interface DayInspectorProps {
  selectedDay: number | null;
  month: number;
  year: number;
  today: number;
  isCurrentMonth: boolean;
  eventsOnSelectedDay: Task[];
  onTaskClick?: (task: Task, tab?: 'details' | 'comments') => void;
}

export default function DayInspector({
  selectedDay,
  month,
  year,
  today,
  isCurrentMonth,
  eventsOnSelectedDay,
  onTaskClick,
}: DayInspectorProps) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 m-0">
            {selectedDay ? `${MONTHS[month]} ${selectedDay}, ${year}` : 'Select a Date'}
          </h3>
          {selectedDay === today && isCurrentMonth && (
            <span className="px-2 py-0.5 rounded-full text-[0.68rem] font-bold bg-indigo-100 text-indigo-700">
              Today
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-1 m-0">
          {eventsOnSelectedDay.length > 0
            ? `${eventsOnSelectedDay.length} task${eventsOnSelectedDay.length > 1 ? 's' : ''} scheduled`
            : 'No tasks scheduled'}
        </p>
      </div>

      <div className="h-px bg-slate-100" />

      {/* Task List for Selected Day */}
      <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto max-h-[300px] pr-1">
        {eventsOnSelectedDay.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center my-auto">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-2">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-600 m-0">No tasks due on this date</p>
          </div>
        ) : (
          eventsOnSelectedDay.map((task) => (
            <div
              key={task.id}
              onClick={() => onTaskClick?.(task, 'details')}
              className="group flex flex-col gap-2 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/20 hover:shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {task.title}
                </span>
                <PriorityBadge priority={task.priority} />
              </div>

              <div className="flex items-center justify-between text-[0.72rem] text-slate-400">
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                  title="Task List Title"
                >
                  {task.status}
                </span>

                <div className="flex items-center gap-3">
                  {task.commentCount !== undefined && task.commentCount > 0 && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {task.commentCount}
                    </span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      {task.dueDate.length >= 16 ? task.dueDate.slice(11, 16) : 'Due date set'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
