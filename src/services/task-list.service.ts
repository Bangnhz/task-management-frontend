import api from "./api";
import type { TaskListDTO } from "../types/task";

export interface CreateTaskListPayload {
  title: string;
  isDone?: boolean;
}

export interface UpdateTaskListPayload {
  title?: string;
  isDone?: boolean;
}

const TaskListService = {
  /** Tạo TaskList (cột) mới trong project */
  create: (projectId: number, payload: CreateTaskListPayload) => 
    api.post(`/projects/${projectId}/task-lists`, payload).then(response => {
      return response;
    }),

  /** Sửa TaskList (cột) trong project */
  update: (id: number, payload: UpdateTaskListPayload) =>
    api.put<TaskListDTO>(`/task-lists/${id}`, payload).then(response => {
      return response;
    }),
};

export default TaskListService;
