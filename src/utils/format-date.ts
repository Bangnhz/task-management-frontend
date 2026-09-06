import { format } from 'date-fns/format';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { isToday } from 'date-fns/isToday';
import { isTomorrow } from 'date-fns/isTomorrow';
import { parseISO } from 'date-fns/parseISO';
import { vi } from 'date-fns/locale/vi';

/** Format ISO → "Jul 30" */
export function formatShortDate(iso: string): string {
  return format(parseISO(iso), 'MMM dd');
}

/** Format ISO → "July 30, 2026" */
export function formatFullDate(iso: string): string {
  return format(parseISO(iso), 'MMMM dd, yyyy');
}

/** "Today" | "Tomorrow" | "Aug 02" */
export function formatRelativeDay(iso: string): string {
  const date = parseISO(iso);
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM dd');
}

/** "2 minutes ago" | "3 ngày trước" */
export function timeAgo(iso: string, locale: 'en' | 'vi' = 'en'): string {
  return formatDistanceToNow(parseISO(iso), {
    addSuffix: true,
    locale: locale === 'vi' ? vi : undefined,
  });
}

/**
 * Format ISO → "02/08 14:30"  (dùng cho timestamp comment)
 */
export function formatDateTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return (
    d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) +
    ' ' +
    d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  );
}

/**
 * Format ISO or YYYY-MM-DD → "MM/DD"
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[2]}/${match[3]}`;
  }
  return dateStr.length >= 10 ? dateStr.slice(5, 10).replace('-', '/') : dateStr;
}

/**
 * Returns formatted date range string for task display
 * Handles startDate, dueDate or both
 */
export function getTaskDateDisplay(startDate?: string, dueDate?: string): string | null {
  const start = formatDate(startDate);
  const due = formatDate(dueDate);
  if (start && due) return `${start} - ${due}`;
  if (start) return `Start: ${start}`;
  if (due) return `Due: ${due}`;
  return null;
}
