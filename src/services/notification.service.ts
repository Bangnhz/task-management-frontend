import api from './api';
import type { NotificationResponse, UnreadCountResponse } from '../types/notification';

const NotificationService = {
  /** Lấy danh sách toàn bộ thông báo của user hiện tại (mới nhất lên đầu) */
  getAllNotifications: () =>
    api.get<NotificationResponse[]>('/notifications'),

  /** Lấy số lượng thông báo chưa đọc */
  getUnreadCount: () =>
    api.get<UnreadCountResponse>('/notifications/unread-count'),

  /** Đánh dấu 1 thông báo là đã đọc */
  markAsRead: (id: number) =>
    api.patch(`/notifications/${id}/read`),

  /** Đánh dấu tất cả thông báo là đã đọc */
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
};

export default NotificationService;
