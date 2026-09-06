import api from './api';
import type { ActivityLogResponse, EntityType } from '../types/activity.types';

const ActivityService = {
  /**
   * Lấy danh sách nhật ký hoạt động của một dự án
   * Endpoint: GET /api/activities/projects/{projectId}
   */
  getByProject: (projectId: number | string) =>
    api.get<ActivityLogResponse[]>(`/activities/projects/${projectId}`),

  /**
   * Lấy danh sách nhật ký hoạt động của 1 thực thể cụ thể (ví dụ: entityType = 'TASK', entityId = 10)
   * Endpoint: GET /api/activities/entities/{entityType}/{entityId}
   */
  getByEntity: (entityType: EntityType, entityId: number | string) =>
    api.get<ActivityLogResponse[]>(`/activities/entities/${entityType}/${entityId}`),

  /**
   * Helper shortcut: Lấy danh sách nhật ký hoạt động của 1 Task
   */
  getByTask: (taskId: number | string) =>
    api.get<ActivityLogResponse[]>(`/activities/entities/TASK/${taskId}`),
};

export default ActivityService;
