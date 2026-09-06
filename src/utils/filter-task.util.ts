import type { Task } from '../types/task';

export type DueDateFilterOption =
  | 'ALL'
  | 'OVERDUE'
  | 'TODAY'
  | 'THIS_WEEK'
  | 'NEXT_WEEK'
  | 'NO_DUE_DATE'
  | 'CUSTOM';

export type CompletionStatusOption = 'ALL' | 'UNCOMPLETED' | 'COMPLETED';

export interface TaskFilterState {
  searchQuery: string;
  assigneeId: string; // 'ALL' | 'UNASSIGNED' | string (userId)
  priority: string;   // 'ALL' | 'High' | 'Medium' | 'Low' | 'Urgent'
  dueDateFilter: DueDateFilterOption;
  customStartDate?: string; // YYYY-MM-DD
  customEndDate?: string;   // YYYY-MM-DD
  completionStatus: CompletionStatusOption;
}

export const DEFAULT_TASK_FILTER_STATE: TaskFilterState = {
  searchQuery: '',
  assigneeId: 'ALL',
  priority: 'ALL',
  dueDateFilter: 'ALL',
  customStartDate: '',
  customEndDate: '',
  completionStatus: 'ALL',
};

/** Helper parsing date string YYYY-MM-DD or ISO safely to start-of-day Date object */
export function parseDateStartOfDay(dateStr?: string): Date | null {
  if (!dateStr) return null;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10), 0, 0, 0, 0);
  }
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/** Check if task status string indicates completion */
export function isTaskCompletedStatus(status?: string): boolean {
  if (!status) return false;
  const s = status.toLowerCase();
  return s.includes('done') || s.includes('complete') || s.includes('hoàn thành') || s.includes('finish');
}

/** Determines if task is completed considering task.isDone or status title */
export function getTaskIsDone(task: Task): boolean {
  if (task.isDone !== undefined) return task.isDone;
  return isTaskCompletedStatus(task.status);
}

/** Calculate start (Monday 00:00:00) and end (Sunday 23:59:59) for a given week reference date */
export function getWeekRange(referenceDate: Date): { start: Date; end: Date } {
  const day = referenceDate.getDay();
  // Monday is index 1, Sunday is index 0
  const diffToMonday = (day + 6) % 7;
  
  const start = new Date(referenceDate);
  start.setDate(referenceDate.getDate() - diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

/** Filter single task against TaskFilterState */
export function filterTask(task: Task, filters: TaskFilterState, todayRef?: Date): boolean {
  const today = todayRef ? new Date(todayRef) : new Date();
  today.setHours(0, 0, 0, 0);

  const isDone = getTaskIsDone(task);

  // 1. Keyword search on title
  if (filters.searchQuery.trim()) {
    const query = filters.searchQuery.trim().toLowerCase();
    if (!task.title.toLowerCase().includes(query)) {
      return false;
    }
  }

  // 2. Assignee filter
  if (filters.assigneeId !== 'ALL') {
    if (filters.assigneeId === 'UNASSIGNED') {
      if (task.assignee && task.assignee.id) return false;
    } else {
      if (!task.assignee || task.assignee.id.toString() !== filters.assigneeId) {
        return false;
      }
    }
  }

  // 3. Priority filter
  if (filters.priority !== 'ALL') {
    if (task.priority !== filters.priority) {
      return false;
    }
  }

  // 4. Completion Status filter
  if (filters.completionStatus === 'UNCOMPLETED' && isDone) {
    return false;
  }
  if (filters.completionStatus === 'COMPLETED' && !isDone) {
    return false;
  }

  // 5. Due Date filter
  if (filters.dueDateFilter !== 'ALL') {
    if (filters.dueDateFilter === 'NO_DUE_DATE') {
      if (task.dueDate) return false;
    } else {
      // Must have due date for other date filters
      if (!task.dueDate) return false;
      const taskDue = parseDateStartOfDay(task.dueDate);
      if (!taskDue) return false;

      switch (filters.dueDateFilter) {
        case 'OVERDUE': {
          // Condition: dueDate < today AND isDone == false
          if (taskDue.getTime() >= today.getTime() || isDone) {
            return false;
          }
          break;
        }

        case 'TODAY': {
          // Condition: dueDate == today
          if (taskDue.getTime() !== today.getTime()) {
            return false;
          }
          break;
        }

        case 'THIS_WEEK': {
          const { start, end } = getWeekRange(today);
          if (taskDue.getTime() < start.getTime() || taskDue.getTime() > end.getTime()) {
            return false;
          }
          break;
        }

        case 'NEXT_WEEK': {
          const nextWeekRef = new Date(today);
          nextWeekRef.setDate(today.getDate() + 7);
          const { start, end } = getWeekRange(nextWeekRef);
          if (taskDue.getTime() < start.getTime() || taskDue.getTime() > end.getTime()) {
            return false;
          }
          break;
        }

        case 'CUSTOM': {
          if (filters.customStartDate) {
            const customStart = parseDateStartOfDay(filters.customStartDate);
            if (customStart && taskDue.getTime() < customStart.getTime()) {
              return false;
            }
          }
          if (filters.customEndDate) {
            const customEnd = parseDateStartOfDay(filters.customEndDate);
            if (customEnd) {
              const customEndFull = new Date(customEnd);
              customEndFull.setHours(23, 59, 59, 999);
              if (taskDue.getTime() > customEndFull.getTime()) {
                return false;
              }
            }
          }
          break;
        }
      }
    }
  }

  return true;
}

/** Check if any filter in TaskFilterState is active (non-default) */
export function hasActiveFilters(filters: TaskFilterState): boolean {
  return (
    filters.searchQuery.trim() !== '' ||
    filters.assigneeId !== 'ALL' ||
    filters.priority !== 'ALL' ||
    filters.dueDateFilter !== 'ALL' ||
    filters.completionStatus !== 'ALL' ||
    Boolean(filters.customStartDate) ||
    Boolean(filters.customEndDate)
  );
}

/** Count active filters */
export function getActiveFilterCount(filters: TaskFilterState): number {
  let count = 0;
  if (filters.searchQuery.trim() !== '') count++;
  if (filters.assigneeId !== 'ALL') count++;
  if (filters.priority !== 'ALL') count++;
  if (filters.dueDateFilter !== 'ALL') count++;
  if (filters.completionStatus !== 'ALL') count++;
  if (filters.customStartDate || filters.customEndDate) count++;
  return count;
}
