import api from './api';
import type { Task, TaskSummaryDTO, TaskListDTO, TaskMoveDTO } from '../types/task';

export interface CreateTaskPayload {
  listId: number;
  title: string;
  description?: string;
  priority?: string;  // 'HIGH', 'MEDIUM', 'LOW', 'URGENT'
  startDate?: string; // ISO datetime string
  dueDate?: string;   // ISO datetime string
  assigneeId?: number;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: string;
}

export interface ReorderTaskPayload {
  taskId: string;
  targetStatus: Task['status'];
  newIndex: number;
}

const TaskService = {

  getTasksByUserId: () =>
    api.get<TaskSummaryDTO[]>('/tasks'),

  /** Lấy tất cả task (có thể lọc theo projectId) */
  getAll: (projectId?: string) =>
    api.get<Task[]>('/tasks', { params: projectId ? { projectId } : undefined }),

  /** Lấy tasks của project cụ thể */
  getTasksByProject: (projectId: string) =>
    api.get<any[]>(`/projects/${projectId}/tasks`).then(response => {
      // Transform TaskCardDTO to Task type
      const transformedTasks: Task[] = response.data.map((item: any) => {
        // Extract task object từ nesting {task: {...}}
        const taskData = item.task || item;

        // Map TaskCardDTO fields to Task type
        // Note: TaskCardDTO có listTitle (status), projectTitle (projectName)
        return {
          id: taskData.id?.toString() || '',
          title: taskData.title || '',
          description: taskData.description,
          projectId: projectId, // Set từ param
          projectName: taskData.projectTitle || taskData.projectName,
          priority: taskData.priority, // 'HIGH', 'MEDIUM', etc.
          status: taskData.listTitle || taskData.status, // 'Done', 'In Progress', 'To Do'
          dueDate: taskData.dueDate,
          assignee: taskData.assignee ? {
            id: taskData.assignee.id,
            fullName: taskData.assignee.fullName,
            avatarUrl: taskData.assignee.avatarUrl,
          } : undefined,
          commentCount: taskData.commentCount,
          createdAt: taskData.createdAt,
          updatedAt: taskData.updatedAt
        };
      });
      return { ...response, data: transformedTasks };
    }),

  /** Lấy TaskLists của project (new endpoint) */
  getTaskListsByProject: (projectId: number) =>
    api.get<TaskListDTO[]>(`/projects/${projectId}/task-lists`).then(response => {

      if (response.data && response.data.length > 0) {
        response.data.forEach((list: TaskListDTO, index: number) => {
          if (list.tasks && list.tasks.length > 0) {
          }
        });
      }

      return response;
    }),

  /** Lấy task của user đang đăng nhập */
  getMyTasks: () => api.get<Task[]>('/tasks/my'),

  /** Lấy chi tiết 1 task */
  getById: (id: string) => api.get<Task>(`/tasks/${id}`),

  /** Tạo task mới trong TaskList */
  createInList: (taskListId: number, payload: CreateTaskPayload) =>
    api.post<any>(`/task-lists/${taskListId}/tasks`, payload).then(response => {
      return response;
    }),

  /** Tạo task mới (old method - deprecated) */
  create: (payload: CreateTaskPayload) => api.post<Task>('/tasks', payload),

  /** Cập nhật task */
  update: (payload: UpdateTaskPayload) => {
    const { id, ...data } = payload;
    return api.put<Task>(`/tasks/${id}`, data);
  },

  /** Xóa task */
  delete: (id: string) => api.delete(`/tasks/${id}`),

  /** Kéo thả — di chuyển task sang TaskList khác */
  reorder: (taskId: number, payload: TaskMoveDTO) =>
    api.patch<Task>(`/tasks/${taskId}/move`, payload).then(response => {
      return response;
    }),
};

export default TaskService;
