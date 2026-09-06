import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell } from 'lucide-react';
import NotificationService from '../../services/notification.service';
import type { NotificationResponse } from '../../types/notification';
import NotificationDropdown from './NotificationDropdown';
import { useUIStore } from '../../store/use-ui-store';

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await NotificationService.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err: any) {
      // Ignore polling errors silently
    }
  }, []);

  // 2. Fetch full notification list
  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await NotificationService.getAllNotifications();
      const list = response.data || [];
      setNotifications(list);
      // Re-calculate unread count from list
      const unread = list.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (err: any) {
      console.error('Lỗi tải danh sách thông báo:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Polling unreadCount every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err: any) {
      console.error('Lỗi khi đánh dấu đã đọc tất cả:', err);
    }
  };

  const handleNotificationClick = async (notification: NotificationResponse) => {
    // Nếu thông báo chưa đọc -> Gọi API đánh dấu đã đọc
    if (!notification.isRead) {
      try {
        await NotificationService.markAsRead(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      } catch (err: any) {
        console.error('Lỗi khi đánh dấu thông báo đã đọc:', err);
      }
    }

    // Nếu có targetId (ví dụ: taskId) -> Mở TaskDrawer chi tiết task
    if (notification.targetId) {
      useUIStore.getState().openTaskDrawer(notification.targetId.toString());
    }

    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="w-9 h-9 flex items-center justify-center rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 text-slate-600 transition-colors relative cursor-pointer"
      >
        <Bell className="w-4 h-4" />

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white font-bold text-[0.6rem] flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-150">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      <NotificationDropdown
        isOpen={isOpen}
        notifications={notifications}
        isLoading={isLoading}
        onClose={() => setIsOpen(false)}
        onMarkAllAsRead={handleMarkAllAsRead}
        onNotificationClick={handleNotificationClick}
      />
    </div>
  );
}
