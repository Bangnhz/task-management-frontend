import React, { useState, useMemo } from 'react';
import type { Task, Priority } from '../../types/task';
import PriorityBadge from './priority-badge';
import TaskService from '../../services/task.service';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MessageSquare, AlertCircle, Search, GripVertical } from 'lucide-react';
import UnscheduleWork from '../unschedule-work';
import DayInspector from '../day-inspector';

export interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task, tab?: 'details' | 'comments') => void;
  onTaskDateChange?: (taskId: string, newDueDate: string) => void;
  title?: string;
  subtitle?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const EVENT_DOT: Record<Priority, string> = {
  High: 'bg-red-500',
  Medium: 'bg-amber-500',
  Low: 'bg-indigo-500',
  Urgent: 'bg-purple-500',
};

const PRIORITY_BADGE_BG: Record<Priority, string> = {
  High: 'bg-red-50 text-red-700 border-red-200/60 hover:bg-red-100',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200/60 hover:bg-amber-100',
  Low: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 hover:bg-indigo-100',
  Urgent: 'bg-purple-50 text-purple-700 border-purple-200/60 hover:bg-purple-100',
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

/** Helper parsing date string YYYY-MM-DD or ISO safely without timezone shift */
function parseTaskDate(dateStr?: string): { year: number; month: number; day: number } | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10) - 1,
      day: parseInt(match[3], 10),
    };
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
  };
}

export default function CalendarView({ tasks, onTaskClick, onTaskDateChange, title, subtitle }: CalendarViewProps) {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchUnscheduled, setSearchUnscheduled] = useState('');
  const [draggedOverDay, setDraggedOverDay] = useState<number | null>(null);

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstDayOfWeek(year, month);
  const today = now.getDate();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  // List of unique statuses (Task List titles) in tasks
  const availableStatuses = useMemo(() => {
    const set = new Set(tasks.map((t) => t.status).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [tasks]);

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }

  function jumpToToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
    setSelectedDay(now.getDate());
  }

  // Filter tasks by priority and status (Task List title)
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchPriority && matchStatus;
    });
  }, [tasks, priorityFilter, statusFilter]);

  // Tasks with dates mapped to each day
  const tasksByDay = useMemo(() => {
    const map: Record<number, Task[]> = {};
    for (let day = 1; day <= daysInMonth; day++) {
      map[day] = [];
    }

    filteredTasks.forEach((task) => {
      const dueParts = parseTaskDate(task.dueDate);
      const startParts = parseTaskDate(task.startDate);

      if (dueParts && startParts) {
        for (let day = 1; day <= daysInMonth; day++) {
          const current = new Date(year, month, day).getTime();
          const start = new Date(startParts.year, startParts.month, startParts.day).getTime();
          const due = new Date(dueParts.year, dueParts.month, dueParts.day).getTime();
          if (current == due) {
            map[day].push(task);
          }
        }
      } else if (dueParts) {
        if (dueParts.year === year && dueParts.month === month && dueParts.day >= 1 && dueParts.day <= daysInMonth) {
          map[dueParts.day].push(task);
        }
      } else if (startParts) {
        if (startParts.year === year && startParts.month === month && startParts.day >= 1 && startParts.day <= daysInMonth) {
          map[startParts.day].push(task);
        }
      }
    });

    return map;
  }, [filteredTasks, year, month, daysInMonth]);

  // Tasks scheduled for the currently selected day
  const eventsOnSelectedDay = selectedDay ? tasksByDay[selectedDay] || [] : [];

  // Tasks without any due/start dates
  const unscheduledTasks = useMemo(() => {
    return filteredTasks.filter((t) => !t.dueDate);
  }, [filteredTasks]);

  // Search filtered unscheduled tasks
  const searchedUnscheduledTasks = useMemo(() => {
    if (!searchUnscheduled.trim()) return unscheduledTasks;
    const q = searchUnscheduled.toLowerCase();
    return unscheduledTasks.filter(
      (t) => t.title.toLowerCase().includes(q) || (t.status && t.status.toLowerCase().includes(q))
    );
  }, [unscheduledTasks, searchUnscheduled]);

  // Drop handler when dragging an unscheduled task onto a day cell
  async function handleDropTaskOnDate(taskId: string, day: number) {
    setDraggedOverDay(null);
    const dateIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDay(day);

    if (onTaskDateChange) {
      onTaskDateChange(taskId, dateIso);
    } else {
      try {
        await TaskService.update({ id: taskId, dueDate: dateIso });
        window.location.reload();
      } catch (err) {
        console.error('Failed to update task date:', err);
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Optional Page Title Header */}
      {(title || subtitle) && (
        <div>
          {title && <h1 className="text-lg font-bold text-slate-900 m-0">{title}</h1>}
          {subtitle && <p className="text-xs text-slate-400 mt-1 m-0">{subtitle}</p>}
        </div>
      )}

      {/* ── Toolbar / Controls ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-xs transition-all text-slate-600 cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={jumpToToday}
              className="px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-xs rounded-lg transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-xs transition-all text-slate-600 cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-base font-bold text-slate-900 m-0">
              {MONTHS[month]} <span className="text-indigo-600">{year}</span>
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.7rem] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-2xs">
              <Clock className="w-3 h-3 text-indigo-500 shrink-0" />
              Display tasks by due date
            </span>
          </div>
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status (TaskList Title) Filter */}
          {availableStatuses.length > 2 && (
            <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
              <span className="text-xs font-medium text-slate-400 px-2">List Status:</span>
              {availableStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${statusFilter === s
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
            <span className="text-xs font-medium text-slate-400 px-2">Priority:</span>
            {(['ALL', 'Urgent', 'High', 'Medium', 'Low'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${priorityFilter === p
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main Layout: Calendar + Right Inspector & Unscheduled Work ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
        {/* ── Calendar Month Grid ── */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm flex flex-col">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-2">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-[0.72rem] font-bold uppercase tracking-wider text-slate-400 py-1.5">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1.5 flex-1 auto-rows-fr">
            {/* Empty cells before 1st weekday */}
            {Array.from({ length: firstWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-slate-50/40 rounded-xl min-h-[95px]" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dayTasks = tasksByDay[day] || [];
              const isToday = isCurrentMonth && day === today;
              const isSelected = day === selectedDay;
              const isDraggingOver = draggedOverDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (draggedOverDay !== day) setDraggedOverDay(day);
                  }}
                  onDragLeave={() => setDraggedOverDay(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    const taskId = e.dataTransfer.getData('taskId') || e.dataTransfer.getData('text/plain');
                    if (taskId) {
                      handleDropTaskOnDate(taskId, day);
                    }
                  }}
                  className={`group relative flex flex-col p-2 rounded-xl border transition-all cursor-pointer min-h-[95px] ${isDraggingOver
                    ? 'border-indigo-500 bg-indigo-100/60 ring-2 ring-indigo-500 scale-[1.02] z-10 shadow-md'
                    : isSelected
                      ? 'border-indigo-500 bg-indigo-50/30 ring-2 ring-indigo-500/20 shadow-xs'
                      : isToday
                        ? 'border-indigo-200 bg-indigo-50/10'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                    }`}
                >
                  {/* Header row: Day Number + Task count */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isSelected
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'text-slate-700'
                        }`}
                    >
                      {day}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[0.68rem] font-semibold text-slate-400">
                        {dayTasks.length} {dayTasks.length === 1 ? 'task' : 'tasks'}
                      </span>
                    )}
                  </div>

                  {/* Task Pills */}
                  <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick?.(task, 'details');
                        }}
                        className={`group/task flex items-center gap-1.5 px-2 py-1 rounded-md text-[0.72rem] font-medium border truncate transition-all cursor-pointer ${PRIORITY_BADGE_BG[task.priority] || 'bg-slate-100 text-slate-700'
                          }`}
                        title={`${task.title} • List: ${task.status} (${task.priority})`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${EVENT_DOT[task.priority]}`} />
                        <span className="truncate flex-1">{task.title}</span>
                      </div>
                    ))}

                    {dayTasks.length > 3 && (
                      <div className="text-[0.68rem] font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded text-center transition-colors">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: Selected Day Inspector + Unscheduled Work Section ── */}
        <div className="flex flex-col gap-5">
          {/* ── Selected Day Inspector ── */}
          <DayInspector
            selectedDay={selectedDay}
            month={month}
            year={year}
            today={today}
            isCurrentMonth={isCurrentMonth}
            eventsOnSelectedDay={eventsOnSelectedDay}
            onTaskClick={onTaskClick}
          />

          {/* ── Main Layout: Calendar + Right Inspector & Unscheduled Work ── */}
          <UnscheduleWork unscheduledTasks={unscheduledTasks} onTaskClick={onTaskClick} />
        </div>
      </div>
    </div>
  );
}
