import type { UserSummaryDTO } from './user';

export type NotificationType = 'ASSIGNED' | 'COMMENT' | 'DUE_SOON' | 'STATUS_CHANGED';

export interface NotificationResponse {
  id: number;
  actor?: UserSummaryDTO;
  title: string;
  content?: string;
  type: NotificationType;
  targetId?: number;
  isRead: boolean;
  createdAt: string; // ISO LocalDateTime
}

export interface UnreadCountResponse {
  unreadCount: number;
}
