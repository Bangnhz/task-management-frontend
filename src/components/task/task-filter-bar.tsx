import React from 'react';
import {
  Search,
  UserCheck,
  Users,
  AlertCircle,
  Calendar,
  CheckCircle2,
  X,
  CalendarDays,
} from 'lucide-react';
import {
  TaskFilterState,
  DueDateFilterOption,
  CompletionStatusOption,
  hasActiveFilters,
  getActiveFilterCount,
} from '../../utils/filter-task.util';

export interface AssigneeOption {
  id: number;
  fullName: string;
  avatarUrl?: string;
}

interface TaskFilterBarProps {
  filters: TaskFilterState;
  onFilterChange: (filters: TaskFilterState) => void;
  onResetFilters: () => void;
  members?: AssigneeOption[];
  currentUserId?: number | null;
}

export default function TaskFilterBar({
  filters,
  onFilterChange,
  onResetFilters,
  members = [],
  currentUserId,
}: TaskFilterBarProps) {
  const activeCount = getActiveFilterCount(filters);
  const isMyTasksActive =
    Boolean(currentUserId) && filters.assigneeId === currentUserId?.toString();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleClearSearch = () => {
    onFilterChange({ ...filters, searchQuery: '' });
  };

  const toggleMyTasks = () => {
    if (!currentUserId) return;
    if (isMyTasksActive) {
      onFilterChange({ ...filters, assigneeId: 'ALL' });
    } else {
      onFilterChange({ ...filters, assigneeId: currentUserId.toString() });
    }
  };

  const handleAssigneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, assigneeId: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, priority: e.target.value });
  };

  const handleDueDateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as DueDateFilterOption;
    onFilterChange({
      ...filters,
      dueDateFilter: val,
      // If leaving CUSTOM, clean date range
      customStartDate: val === 'CUSTOM' ? filters.customStartDate : '',
      customEndDate: val === 'CUSTOM' ? filters.customEndDate : '',
    });
  };

  const handleCompletionStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, completionStatus: e.target.value as CompletionStatusOption });
  };

  const handleCustomStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, customStartDate: e.target.value });
  };

  const handleCustomEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, customEndDate: e.target.value });
  };

  return (
    <div className="flex flex-col gap-3 bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-xs mb-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left side: Search & Quick My Tasks */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Keyword Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={handleSearchChange}
              placeholder="Search task title..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder-slate-400"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter: My Tasks */}
          {currentUserId && (
            <button
              type="button"
              onClick={toggleMyTasks}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 shrink-0 cursor-pointer shadow-2xs active:scale-95 ${
                isMyTasksActive
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 shadow-sm'
                  : 'bg-indigo-50/80 border-indigo-200/70 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300'
              }`}
              title="Quickly filter tasks assigned to you"
            >
              <UserCheck className={`w-3.5 h-3.5 ${isMyTasksActive ? 'text-white' : 'text-indigo-600'}`} />
              <span>My Tasks</span>
            </button>
          )}
        </div>

        {/* Right side: Filter Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Assignee Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.assigneeId}
              onChange={handleAssigneeChange}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by assignee"
            >
              <option value="ALL">All Assignees</option>
              <option value="UNASSIGNED">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id.toString()}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.priority}
              onChange={handlePriorityChange}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by priority"
            >
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Due Date Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.dueDateFilter}
              onChange={handleDueDateFilterChange}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by due date"
            >
              <option value="ALL">All Due Dates</option>
              <option value="OVERDUE">Overdue</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="NEXT_WEEK">Next Week</option>
              <option value="NO_DUE_DATE">No Due Date</option>
              <option value="CUSTOM">Custom Range</option>
            </select>
          </div>

          {/* Completion Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={filters.completionStatus}
              onChange={handleCompletionStatusChange}
              className="bg-transparent text-xs font-medium text-slate-700 focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by completion status"
            >
              <option value="ALL">All Statuses</option>
              <option value="UNCOMPLETED">Uncompleted</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters(filters) && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
              title="Clear all active filters"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
              <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-800 text-[0.65rem] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Custom Date Range Selection Row (when dueDateFilter === 'CUSTOM') */}
      {filters.dueDateFilter === 'CUSTOM' && (
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 bg-slate-50/50 p-2.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <CalendarDays className="w-4 h-4 text-indigo-600" />
            <span>Custom Date Range:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">From:</label>
            <input
              type="date"
              value={filters.customStartDate || ''}
              onChange={handleCustomStartDateChange}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 font-medium">To:</label>
            <input
              type="date"
              value={filters.customEndDate || ''}
              onChange={handleCustomEndDateChange}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500 text-slate-700 font-medium"
            />
          </div>

          {(filters.customStartDate || filters.customEndDate) && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, customStartDate: '', customEndDate: '' })}
              className="text-xs text-slate-400 hover:text-slate-600 underline ml-auto cursor-pointer"
            >
              Reset dates
            </button>
          )}
        </div>
      )}
    </div>
  );
}
