import type { Task, Priority } from '../types/task';

/**
 * Map backend priority string to frontend Priority type
 */
export function mapPriority(backendPriority: string): Priority {
  switch (backendPriority?.toUpperCase()) {
    case 'HIGH': return 'High';
    case 'MEDIUM': return 'Medium';
    case 'LOW': return 'Low';
    case 'URGENT': return 'Urgent';
    default: return 'Medium';
  }
}

/**
 * Transform TaskSummaryDTO from backend to Task for UI
 */
export function transformTask(taskSummary: any, listTitle: string): Task {
  return {
    id: taskSummary.id.toString(),
    title: taskSummary.title,
    projectId: taskSummary.projectId?.toString() || '',
    projectName: taskSummary.projectTitle || '',
    priority: mapPriority(taskSummary.priority),
    status: listTitle,
    startDate: taskSummary.startDate,
    dueDate: taskSummary.dueDate,
    description: taskSummary.description,
    assignee: taskSummary.assignee ? {
      id: taskSummary.assignee.id,
      fullName: taskSummary.assignee.fullName,
      avatarUrl: taskSummary.assignee.avatarUrl,
    } : undefined,
    commentCount: taskSummary.commentCount,
    createdAt: taskSummary.createdAt,
    updatedAt: taskSummary.updatedAt,
    isDone: taskSummary.isDone,
  };
}

/**
 * Get color class for status/column based on common naming patterns
 */
export function getColorForStatus(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes('backlog')) return 'bg-slate-400';
  if (lower.includes('todo') || lower.includes('to do')) return 'bg-slate-400';
  if (lower.includes('progress') || lower.includes('doing')) return 'bg-blue-500';
  if (lower.includes('review')) return 'bg-purple-500';
  if (lower.includes('done') || lower.includes('complete')) return 'bg-emerald-500';
  return 'bg-indigo-500'; // Default color
}
