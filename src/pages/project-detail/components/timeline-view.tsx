import React, { useState, useMemo } from 'react';
import type { Task, Priority } from '../../../types/task';
import PriorityBadge from '../../../components/common/priority-badge';
import { COMPLETION_BAR_COLOR, PRIORITY_BAR_COLOR, type CompletionStatus } from '../../../constants/task-ui';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  Circle,
  Search,
  ChevronDown,
  ChevronRight as ChevronRightIcon,
  User,
  Layers,
  Calendar,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react';

interface TimelineViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task, tab?: 'details' | 'comments') => void;
}

export type ViewMode = 'days' | 'weeks' | 'months' | 'quarters';
export type GroupByMode = 'none' | 'status' | 'priority' | 'assignee';
export type ColorMode = 'completion' | 'priority';
export type CompletionFilter = 'ALL' | 'COMPLETED' | 'UNCOMPLETED';

/** Check if a task status represents completion */
export function isTaskCompleted(status?: string, isDone?: boolean): boolean {
  if (isDone !== undefined) return isDone;
  if (!status) return false;
  const s = status.toLowerCase();
  return s.includes('done') || s.includes('complete') || s.includes('hoàn thành') || s.includes('finish');
}

/** Helper parsing date string YYYY-MM-DD or ISO safely without timezone shift */
function parseDate(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
  }
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function formatShortDate(d: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

export default function TimelineView({ tasks, onTaskClick }: TimelineViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('weeks');
  const [groupBy, setGroupBy] = useState<GroupByMode>('status');
  const [colorMode, setColorMode] = useState<ColorMode>('completion');
  const [baseDate, setBaseDate] = useState<Date>(() => new Date());

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [completionFilter, setCompletionFilter] = useState<CompletionFilter>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Track collapsed state of group sections
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const now = useMemo(() => new Date(), []);

  // Unique status list (TaskList titles)
  const availableStatuses = useMemo(() => {
    const set = new Set(tasks.map((t) => t.status).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [tasks]);

  // Filter tasks by query, completion status, priority, and list status
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const completed = isTaskCompleted(t.status, t.isDone);
      const matchCompletion =
        completionFilter === 'ALL' ||
        (completionFilter === 'COMPLETED' && completed) ||
        (completionFilter === 'UNCOMPLETED' && !completed);
      const matchPriority = priorityFilter === 'ALL' || t.priority === priorityFilter;
      const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
      return matchSearch && matchCompletion && matchPriority && matchStatus;
    });
  }, [tasks, searchQuery, completionFilter, priorityFilter, statusFilter]);

  // Tasks with valid dates for Timeline grid
  const scheduledTasks = useMemo(() => {
    return filteredTasks.filter((t) => t.startDate || t.dueDate);
  }, [filteredTasks]);

  // Tasks without dates
  const unscheduledTasks = useMemo(() => {
    return filteredTasks.filter((t) => !t.startDate && !t.dueDate);
  }, [filteredTasks]);

  // ── Columns Generation (Days / Weeks / Months / Quarters) ──
  const columnsInfo = useMemo(() => {
    if (viewMode === 'days') {
      // 14 Days View starting from baseDate
      const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), 0, 0, 0, 0);
      const columns: { label: string; sublabel: string; startDate: Date; endDate: Date }[] = [];
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      for (let i = 0; i < 14; i++) {
        const colStart = new Date(start);
        colStart.setDate(start.getDate() + i);
        colStart.setHours(0, 0, 0, 0);
        const colEnd = new Date(colStart);
        colEnd.setHours(23, 59, 59, 999);

        columns.push({
          label: `${colStart.getMonth() + 1}/${colStart.getDate()}`,
          sublabel: weekdays[colStart.getDay()],
          startDate: colStart,
          endDate: colEnd,
        });
      }

      const timelineStart = columns[0].startDate;
      const timelineEnd = columns[columns.length - 1].endDate;
      const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
      const headerTitle = `${formatShortDate(timelineStart)} - ${formatShortDate(timelineEnd)}, ${timelineStart.getFullYear()}`;

      return { columns, timelineStart, timelineEnd, totalDuration, headerTitle };
    } else if (viewMode === 'weeks') {
      // 7 days Week (Monday to Sunday)
      const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());
      const dayOfWeek = start.getDay();
      const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start.setDate(start.getDate() + distanceToMon);
      start.setHours(0, 0, 0, 0);

      const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const columns: { label: string; sublabel: string; startDate: Date; endDate: Date }[] = [];

      for (let i = 0; i < 7; i++) {
        const colStart = new Date(start);
        colStart.setDate(start.getDate() + i);
        colStart.setHours(0, 0, 0, 0);
        const colEnd = new Date(colStart);
        colEnd.setHours(23, 59, 59, 999);

        columns.push({
          label: weekdays[i],
          sublabel: `${colStart.getMonth() + 1}/${colStart.getDate()}`,
          startDate: colStart,
          endDate: colEnd,
        });
      }

      const timelineStart = columns[0].startDate;
      const timelineEnd = columns[columns.length - 1].endDate;
      const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
      const weekLabel = `Week of ${formatShortDate(timelineStart)} - ${formatShortDate(timelineEnd)}, ${timelineStart.getFullYear()}`;

      return { columns, timelineStart, timelineEnd, totalDuration, headerTitle: weekLabel };
    } else if (viewMode === 'months') {
      // Month view (1..daysInMonth)
      const year = baseDate.getFullYear();
      const month = baseDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

      const columns: { label: string; sublabel: string; startDate: Date; endDate: Date }[] = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const colStart = new Date(year, month, day, 0, 0, 0, 0);
        const colEnd = new Date(year, month, day, 23, 59, 59, 999);
        const weekdayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][colStart.getDay()];

        columns.push({
          label: `${day}`,
          sublabel: weekdayName,
          startDate: colStart,
          endDate: colEnd,
        });
      }

      const timelineStart = columns[0].startDate;
      const timelineEnd = columns[columns.length - 1].endDate;
      const totalDuration = timelineEnd.getTime() - timelineStart.getTime();
      const monthLabel = `${monthNames[month]} ${year}`;

      return { columns, timelineStart, timelineEnd, totalDuration, headerTitle: monthLabel };
    } else {
      // Quarters view (Q1, Q2, Q3, Q4 of current year)
      const year = baseDate.getFullYear();
      const quarters = [
        { label: 'Q1', sublabel: 'Jan - Mar', startMonth: 0, endMonth: 2 },
        { label: 'Q2', sublabel: 'Apr - Jun', startMonth: 3, endMonth: 5 },
        { label: 'Q3', sublabel: 'Jul - Sep', startMonth: 6, endMonth: 8 },
        { label: 'Q4', sublabel: 'Oct - Dec', startMonth: 9, endMonth: 11 },
      ];

      const columns = quarters.map((q) => {
        const colStart = new Date(year, q.startMonth, 1, 0, 0, 0, 0);
        const lastDay = new Date(year, q.endMonth + 1, 0).getDate();
        const colEnd = new Date(year, q.endMonth, lastDay, 23, 59, 59, 999);

        return {
          label: q.label,
          sublabel: q.sublabel,
          startDate: colStart,
          endDate: colEnd,
        };
      });

      const timelineStart = columns[0].startDate;
      const timelineEnd = columns[columns.length - 1].endDate;
      const totalDuration = timelineEnd.getTime() - timelineStart.getTime();

      return { columns, timelineStart, timelineEnd, totalDuration, headerTitle: `Roadmap Year ${year}` };
    }
  }, [viewMode, baseDate]);

  // Navigate time range
  function prevRange() {
    const next = new Date(baseDate);
    if (viewMode === 'days') next.setDate(next.getDate() - 14);
    else if (viewMode === 'weeks') next.setDate(next.getDate() - 7);
    else if (viewMode === 'months') next.setMonth(next.getMonth() - 1);
    else if (viewMode === 'quarters') next.setFullYear(next.getFullYear() - 1);
    setBaseDate(next);
  }

  function nextRange() {
    const next = new Date(baseDate);
    if (viewMode === 'days') next.setDate(next.getDate() + 14);
    else if (viewMode === 'weeks') next.setDate(next.getDate() + 7);
    else if (viewMode === 'months') next.setMonth(next.getMonth() + 1);
    else if (viewMode === 'quarters') next.setFullYear(next.getFullYear() + 1);
    setBaseDate(next);
  }

  function resetToday() {
    setBaseDate(new Date());
  }

  // Group Scheduled Tasks by Jira GroupBy criteria
  const taskGroups = useMemo(() => {
    if (groupBy === 'none') {
      return [{ id: 'all', title: 'All Tasks', tasks: scheduledTasks }];
    }

    const groupsMap: Map<string, Task[]> = new Map();

    if (groupBy === 'status') {
      // Group by list status
      scheduledTasks.forEach((t) => {
        const key = t.status || 'Uncategorized';
        if (!groupsMap.has(key)) groupsMap.set(key, []);
        groupsMap.get(key)!.push(t);
      });
    } else if (groupBy === 'priority') {
      // Group by Priority
      const priorities: Priority[] = ['Urgent', 'High', 'Medium', 'Low'];
      priorities.forEach((p) => groupsMap.set(`Priority: ${p}`, []));
      scheduledTasks.forEach((t) => {
        const key = `Priority: ${t.priority || 'Medium'}`;
        if (!groupsMap.has(key)) groupsMap.set(key, []);
        groupsMap.get(key)!.push(t);
      });
    } else if (groupBy === 'assignee') {
      // Group by Assignee
      scheduledTasks.forEach((t) => {
        const key = t.assignee ? `Assignee: ${t.assignee.fullName}` : 'Unassigned';
        if (!groupsMap.has(key)) groupsMap.set(key, []);
        groupsMap.get(key)!.push(t);
      });
    }

    const result: { id: string; title: string; tasks: Task[] }[] = [];
    groupsMap.forEach((gTasks, gTitle) => {
      if (gTasks.length > 0) {
        result.push({ id: gTitle, title: gTitle, tasks: gTasks });
      }
    });

    return result;
  }, [scheduledTasks, groupBy]);

  // Toggle collapse group
  const toggleGroup = (groupId: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const collapseAll = () => {
    const newState: Record<string, boolean> = {};
    taskGroups.forEach((g) => {
      newState[g.id] = true;
    });
    setCollapsedGroups(newState);
  };

  const expandAll = () => {
    setCollapsedGroups({});
  };

  // Calculate Today vertical line position (%)
  const todayPositionPercent = useMemo(() => {
    const { timelineStart, timelineEnd, totalDuration } = columnsInfo;
    const nowTime = now.getTime();
    if (nowTime < timelineStart.getTime() || nowTime > timelineEnd.getTime()) return null;
    return ((nowTime - timelineStart.getTime()) / totalDuration) * 100;
  }, [columnsInfo, now]);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Jira Control Bar Header ── */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-4 shadow-xs flex flex-col gap-4">
        {/* Row 1: Search, Time Nav, Zoom Level Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Quick Search */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Time Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
              <button
                onClick={prevRange}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-xs transition-all text-slate-600 cursor-pointer"
                title="Previous time range"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={resetToday}
                className="px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-white hover:shadow-xs rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3 text-indigo-500" />
                Today
              </button>
              <button
                onClick={nextRange}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-xs transition-all text-slate-600 cursor-pointer"
                title="Next time range"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <h2 className="text-xs font-bold text-slate-800 m-0 hidden md:block">
              {columnsInfo.headerTitle}
            </h2>
          </div>

          {/* Jira Zoom Level Modes (Days / Weeks / Months / Quarters) */}
          <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
            <span className="text-[0.7rem] font-bold text-slate-400 px-2 uppercase tracking-wider flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Zoom:
            </span>
            {(
              [
                { key: 'days', label: 'Days' },
                { key: 'weeks', label: 'Weeks' },
                { key: 'months', label: 'Months' },
                { key: 'quarters', label: 'Quarters' },
              ] as const
            ).map((mode) => (
              <button
                key={mode.key}
                onClick={() => setViewMode(mode.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === mode.key
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Jira GroupBy Selector, Color Mode & Completion Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Group By Selector (Nhóm theo) */}
          <div className="flex items-center gap-1.5 bg-slate-100/80 rounded-xl p-1">
            <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-indigo-500" /> Group by:
            </span>
            {(
              [
                { key: 'none', label: 'None' },
                { key: 'status', label: 'Status' },
                { key: 'priority', label: 'Priority' },
                { key: 'assignee', label: 'Assignee' },
              ] as const
            ).map((g) => (
              <button
                key={g.key}
                onClick={() => setGroupBy(g.key)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  groupBy === g.key
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {g.label}
              </button>
            ))}

            {groupBy !== 'none' && (
              <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                <button
                  onClick={expandAll}
                  className="px-2 py-0.5 text-[0.68rem] text-slate-500 hover:text-slate-800 rounded transition-colors"
                >
                  Expand All
                </button>
                <button
                  onClick={collapseAll}
                  className="px-2 py-0.5 text-[0.68rem] text-slate-500 hover:text-slate-800 rounded transition-colors"
                >
                  Collapse All
                </button>
              </div>
            )}
          </div>

          {/* Color Mode Switcher & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Color Mode (Hiển thị màu) */}
            <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
              <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-500" /> Color Mode:
              </span>
              <button
                onClick={() => setColorMode('completion')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  colorMode === 'completion'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Status (2 colors)
              </button>
              <button
                onClick={() => setColorMode('priority')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  colorMode === 'priority'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Priority (4 colors)
              </button>
            </div>

            {/* Completion Filter (Tất cả / Hoàn thành / Chưa hoàn thành) */}
            <div className="flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
              <button
                onClick={() => setCompletionFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  completionFilter === 'ALL'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setCompletionFilter('COMPLETED')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  completionFilter === 'COMPLETED'
                    ? 'bg-emerald-500 text-white shadow-xs font-semibold'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </button>
              <button
                onClick={() => setCompletionFilter('UNCOMPLETED')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  completionFilter === 'UNCOMPLETED'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-blue-700 hover:bg-blue-50'
                }`}
              >
                <Circle className="w-3.5 h-3.5" />
                Incomplete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Gantt Roadmap Container ── */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden flex flex-col">
        {scheduledTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-3">
              <Clock className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 m-0">No tasks with start/due dates found</p>
            <p className="text-xs text-slate-400 mt-1 m-0">
              Assign start dates and due dates to view the Timeline Roadmap chart.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[950px]">
              {/* Header Row: Left Task Header (280px) + Timeline Columns */}
              <div className="flex border-b border-slate-200/80 bg-slate-50/90 sticky top-0 z-20">
                <div className="w-[300px] shrink-0 p-3 text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-slate-200/80 flex items-center justify-between">
                  <span>Tasks ({scheduledTasks.length})</span>
                  {colorMode === 'completion' && (
                    <div className="flex items-center gap-2 text-[0.65rem] font-normal normal-case">
                      <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Done
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> Todo
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="flex-1 grid divide-x divide-slate-200/60"
                  style={{ gridTemplateColumns: `repeat(${columnsInfo.columns.length}, minmax(0, 1fr))` }}
                >
                  {columnsInfo.columns.map((col, idx) => (
                    <div key={idx} className="p-2 text-center overflow-hidden">
                      <p className="text-xs font-bold text-slate-800 m-0 truncate">{col.label}</p>
                      <p className="text-[0.65rem] text-slate-400 m-0 truncate">{col.sublabel}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Task Rows Body with Jira Grouping */}
              <div className="relative divide-y divide-slate-100">
                {/* Today Vertical Line Marker */}
                {todayPositionPercent !== null && (
                  <div
                    className="absolute top-0 bottom-0 border-r-2 border-red-500 z-10 pointer-events-none"
                    style={{ left: `calc(300px + (100% - 300px) * ${todayPositionPercent / 100})` }}
                  >
                    <span className="absolute -top-2 -translate-x-1/2 bg-red-500 text-white text-[0.62rem] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                      Today
                    </span>
                  </div>
                )}

                {taskGroups.map((group) => {
                  const isCollapsed = collapsedGroups[group.id];
                  const completedCount = group.tasks.filter((t) => isTaskCompleted(t.status)).length;
                  const progressPct = group.tasks.length > 0 ? Math.round((completedCount / group.tasks.length) * 100) : 0;

                  return (
                    <div key={group.id} className="flex flex-col">
                      {/* Jira Group Header Row */}
                      {groupBy !== 'none' && (
                        <div
                          onClick={() => toggleGroup(group.id)}
                          className="flex items-center justify-between px-3 py-2 bg-slate-100/60 hover:bg-slate-100 border-b border-slate-200/60 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {isCollapsed ? (
                              <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-500" />
                            )}
                            <span className="text-xs font-bold text-slate-800 truncate">{group.title}</span>
                            <span className="px-2 py-0.5 text-[0.65rem] font-bold bg-white text-slate-600 rounded-full border border-slate-200/80 shadow-2xs">
                              {group.tasks.length} task{group.tasks.length > 1 ? 's' : ''}
                            </span>
                          </div>

                          {/* Group Completion Progress Bar */}
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <span className="text-[0.68rem] font-semibold text-slate-500 w-9 text-right">
                              {progressPct}%
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Group Tasks List */}
                      {!isCollapsed &&
                        group.tasks.map((task) => {
                          const completed = isTaskCompleted(task.status);
                          const startDate = parseDate(task.startDate) || parseDate(task.dueDate) || now;
                          const dueDate = parseDate(task.dueDate) || new Date(startDate.getTime() + 86400000 * 3);
                          const finalDue = dueDate >= startDate ? dueDate : new Date(startDate.getTime() + 86400000 * 3);

                          const { timelineStart, timelineEnd, totalDuration } = columnsInfo;

                          const startMs = startDate.getTime();
                          const endMs = finalDue.getTime();

                          const leftOffsetMs = Math.max(0, startMs - timelineStart.getTime());
                          const durationMs = Math.max(86400000 * 1, endMs - startMs);

                          let leftPercent = (leftOffsetMs / totalDuration) * 100;
                          let widthPercent = (durationMs / totalDuration) * 100;

                          leftPercent = Math.max(0, Math.min(95, leftPercent));
                          widthPercent = Math.max(3, Math.min(100 - leftPercent, widthPercent));

                          // Bar color based on active colorMode
                          const barColorClass =
                            colorMode === 'completion'
                              ? completed
                                ? COMPLETION_BAR_COLOR.completed
                                : COMPLETION_BAR_COLOR.incomplete
                              : PRIORITY_BAR_COLOR[task.priority || 'Medium'];

                          return (
                            <div key={task.id} className="flex items-center hover:bg-slate-50/80 transition-colors group">
                              {/* Left Metadata Cell */}
                              <div
                                onClick={() => onTaskClick?.(task, 'details')}
                                className="w-[300px] shrink-0 p-3 border-r border-slate-200/60 flex items-center justify-between gap-2 cursor-pointer"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    {completed ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                    )}
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate m-0">
                                      {task.title}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    <span
                                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[0.65rem] font-semibold border ${
                                        completed
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                          : 'bg-blue-50 text-blue-700 border-blue-200'
                                      }`}
                                    >
                                      {task.status}
                                    </span>
                                    {task.assignee && (
                                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[0.65rem] bg-slate-100 text-slate-700 font-semibold">
                                        <User className="w-3 h-3 text-slate-400" />
                                        {task.assignee.fullName}
                                      </span>
                                    )}
                                    <span className="text-[0.68rem] text-slate-400">
                                      {formatShortDate(startDate)} - {formatShortDate(finalDue)}
                                    </span>
                                  </div>
                                </div>
                                <PriorityBadge priority={task.priority} />
                              </div>

                              {/* Right Timeline Bar Cell */}
                              <div className="flex-1 relative h-12 p-1.5 flex items-center">
                                <div
                                  onClick={() => onTaskClick?.(task, 'details')}
                                  style={{
                                    left: `${leftPercent}%`,
                                    width: `${widthPercent}%`,
                                  }}
                                  className={`absolute h-8 rounded-lg px-2.5 flex items-center justify-between text-xs font-medium shadow-sm cursor-pointer transition-all hover:brightness-105 hover:scale-[1.01] ${barColorClass}`}
                                  title={`${task.title} • Status: ${task.status} (${completed ? 'Completed' : 'Incomplete'}) • Priority: ${task.priority}`}
                                >
                                  <span className="truncate text-[0.72rem] font-semibold mr-1">{task.title}</span>
                                  <span className="text-[0.65rem] font-bold shrink-0 bg-black/25 px-1.5 py-0.5 rounded text-white shadow-2xs">
                                    {task.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Unscheduled Tasks Drawer Footer */}
        {unscheduledTasks.length > 0 && (
          <div className="p-4 bg-slate-50/60 border-t border-slate-200/60">
            <details className="group/unscheduled">
              <summary className="flex items-center justify-between text-xs font-semibold text-slate-500 cursor-pointer hover:text-slate-800 transition-colors list-none">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Unscheduled tasks ({unscheduledTasks.length})
                </span>
                <span className="text-slate-400 group-open/unscheduled:rotate-180 transition-transform text-[10px]">▼</span>
              </summary>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {unscheduledTasks.map((t) => {
                  const completed = isTaskCompleted(t.status);
                  return (
                    <div
                      key={t.id}
                      onClick={() => onTaskClick?.(t, 'details')}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/60 hover:border-indigo-200 hover:bg-indigo-50/20 text-xs cursor-pointer transition-all shadow-2xs"
                    >
                      <div className="min-w-0 flex-1 mr-2 flex items-center gap-2">
                        {completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-blue-500 shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-800 truncate m-0">{t.title}</p>
                          <p className={`text-[0.65rem] font-semibold m-0 ${completed ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {t.status}
                          </p>
                        </div>
                      </div>
                      <PriorityBadge priority={t.priority} />
                    </div>
                  );
                })}
              </div>
            </details>
          </div>
        )}
      </div>
    </div>
  );
}

