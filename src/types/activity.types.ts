export type EntityType =
  | 'WORKSPACE'
  | 'PROJECT'
  | 'TASK_LIST'
  | 'TASK'
  | 'COMMENT'
  | 'MEMBER';

export type ActivityAction =
  | 'CREATED'
  | 'UPDATED'
  | 'DELETED'
  | 'MOVED'
  | 'ASSIGNED'
  | 'UNASSIGNED'
  | 'COMPLETED'
  | 'REOPENED'
  | 'JOINED'
  | 'LEFT'
  | 'KICKED';

export interface ActivityActor {
  id: number;
  fullName: string;
  avatarUrl?: string | null;
  email?: string | null;
}

export interface ActivityLogResponse {
  id: number;
  workspaceId?: number | null;
  projectId?: number | null;
  entityType: EntityType;
  entityId: number;
  action: ActivityAction;
  actor: ActivityActor;
  details?: Record<string, any> | null;
  createdAt: string;
}
