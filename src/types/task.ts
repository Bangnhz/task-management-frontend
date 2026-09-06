import type { UserSummaryDTO } from './user';

/**
 * Khớp 1-1 với Java enum TaskPriority.
 * Giá trị phụ thuộc cách Spring serialize — nếu dùng @JsonValue thì
 * đổi lại cho khớp (VD: 'HIGH' | 'MEDIUM' | 'LOW').
 */
export type Priority = 'High' | 'Medium' | 'Low' | 'Urgent';

// TaskStatus is now dynamic string (not fixed enum) to accept any TaskList title from backend
export type TaskStatus = string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  projectName: string;
  priority: Priority;
  status: TaskStatus;
  startDate?: string;
  dueDate: string;
  assignee?: UserSummaryDTO;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
  isDone?: boolean;
  listId?: number;
}

export interface Deadline {
  day: string;
  task: string;
  project: string;
  date: string;
  priority: Priority;
}

// TaskSummaryDTO từ backend
export interface TaskSummaryDTO {
  id: number;
  title: string;
  priority: string; // 'HIGH', 'MEDIUM', 'LOW', 'URGENT'
  startDate?: string;
  dueDate: string; // LocalDateTime
  listTitle: string; // Status name
  projectTitle: string;
  position: number;
  isDone?: boolean;
  assignee?: UserSummaryDTO;
  commentCount?: number;
  description?: string;
}

// TaskListDTO từ backend  
export interface TaskListDTO {
  id: number;
  title: string; // Status name (To Do, In Progress, Done, etc.)
  position: number;
  isDone?: boolean;
  tasks: TaskSummaryDTO[];
}
export interface TaskMoveDTO {
  targetListId: number;
  position: number;
}