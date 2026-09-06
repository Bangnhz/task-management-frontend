import React from 'react';
import { UserCheck, MessageSquare, Clock, CheckCircle2, BellOff, CheckCheck, Loader2 } from 'lucide-react';
import type { NotificationResponse, NotificationType } from '../../types/notification';
import { getInitials } from '../../utils/user.util';
import { timeAgo } from '../../utils/format-date';

interface NotificationDropdownProps {
  isOpen: boolean;
  notifications: NotificationResponse[];
  isLoading: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
  onNotificationClick: (notification: NotificationResponse) => void;
}

export default function NotificationDropdown({
  isOpen,
  notifications,
  isLoading,
  onMarkAllAsRead,
  onNotificationClick,
}: NotificationDropdownProps) {
  if (!isOpen) return null;

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'ASSIGNED':
        return (
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
        );
      case 'COMMENT':
        return (
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
        );
      case 'DUE_SOON':
        return (
          <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-3.5 h-3.5" />
          </div>
        );
      case 'STATUS_CHANGED':
        return (
          <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        );
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-3.5 h-3.5" />
          </div>
        );
    }
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/80 z-50 overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900 m-0">Notifications</h3>
          {notifications.length > 0 && (
            <span className="px-2 py-0.5 text-[0.68rem] font-bold rounded-full bg-slate-200/80 text-slate-600">
              {notifications.length}
            </span>
          )}
        </div>

        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
            title="Mark all as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* List content */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
        {isLoading && notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <p className="text-xs font-medium">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <BellOff className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-500 m-0">No notifications</p>
          </div>
        ) : (
          notifications.map((item) => {
            const isUnread = !item.isRead;
            const actorName = item.actor?.fullName;
            const actorAvatar = item.actor?.avatarUrl;

            return (
              <div
                key={item.id}
                onClick={() => onNotificationClick(item)}
                className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer relative group ${
                  isUnread
                    ? 'bg-indigo-50/50 hover:bg-indigo-50/90'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                {/* Avatar & Type Icon Badge */}
                <div className="relative shrink-0 mt-0.5">
                  {actorAvatar ? (
                    <img
                      src={actorAvatar}
                      alt={actorName || ''}
                      className="w-9 h-9 rounded-full object-cover shadow-2xs border border-slate-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                      {getInitials(actorName)}
                    </div>
                  )}
                  {/* Badge Icon đại diện loại thông báo */}
                  <div className="absolute -bottom-1 -right-1 shadow-2xs">
                    {getNotificationIcon(item.type)}
                  </div>
                </div>

                {/* Content info */}
                <div className="flex-1 min-w-0 pr-3">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-xs m-0 leading-snug ${isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                      {item.title}
                    </p>
                  </div>

                  {item.content && (
                    <p className="text-xs text-slate-600 m-0 line-clamp-2 leading-relaxed font-normal">
                      {item.content}
                    </p>
                  )}

                  <span className="text-[0.68rem] text-slate-400 mt-1 block font-medium">
                    {timeAgo(item.createdAt, 'en')}
                  </span>
                </div>

                {/* Unread dot indicator */}
                {isUnread && (
                  <div className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-2 animate-pulse" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
