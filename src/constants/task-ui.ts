export const COMPLETION_BAR_COLOR = {
  completed: 'bg-emerald-500 text-white shadow-sm border border-emerald-400/30 hover:bg-emerald-600',
  incomplete: 'bg-slate-400 text-white shadow-sm border border-slate-300/30 hover:bg-slate-500',
} as const;

// Tạo type tự động từ object để gán prop an toàn
export type CompletionStatus = keyof typeof COMPLETION_BAR_COLOR;

export const PRIORITY_BAR_COLOR = {
  Urgent: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs border border-purple-400/30',
  High: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-xs border border-red-400/30',
  Medium: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs border border-orange-400/30',
  Low: 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-xs border border-blue-400/30',
} as const;

export type PriorityBarType = keyof typeof PRIORITY_BAR_COLOR;

export const PRIORITY_BADGE_MAP = {
  High: 'bg-red-100 text-red-700',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-indigo-100 text-indigo-700',
  Urgent: 'bg-purple-100 text-purple-700',
} as const;

export const EVENT_DOT_MAP = {
  High: 'bg-red-500',
  Medium: 'bg-amber-500',
  Low: 'bg-indigo-500',
  Urgent: 'bg-purple-500',
} as const;
