import React, { useEffect, useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { parseISO } from 'date-fns/parseISO';
import { isValid } from 'date-fns/isValid';
import { History, RefreshCw, AlertCircle } from 'lucide-react';
import ActivityService from '../../services/activity.service';
import {
  renderActivityDescription,
  getActivityActionInfo
} from '../../utils/activityFormatter';
import type {
  ActivityLogResponse,
  EntityType
} from '../../types/activity.types';

// ── Props ──────────────────────────────────────────────────────────────────
interface ActivityTimelineProps {
  /** Project ID để fetch danh sách log theo dự án */
  projectId?: number | string;
  /** Thực thể cụ thể (ví dụ: 'TASK', 'COMMENT', 'PROJECT',...) */
  entityType?: EntityType;
  /** ID của thực thể */
  entityId?: number | string;
  /** Truyền sẵn danh sách log (nếu parent component tự quản lý) */
  logs?: ActivityLogResponse[];
  /** Tự động refresh interval (ms), mặc định không tự poll */
  autoRefreshMs?: number;
  /** Custom message khi trống */
  emptyMessage?: string;
  /** Custom CSS classes */
  className?: string;
}

export function ActivityTimeline({
  projectId,
  entityType,
  entityId,
  logs: propLogs,
  emptyMessage = 'No activity recorded yet',
  className = '',
}: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityLogResponse[]>(propLogs || []);
  const [isLoading, setIsLoading] = useState<boolean>(!propLogs);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch Data ───────────────────────────────────────────────────────────
  const fetchActivities = useCallback(async () => {
    // Nếu truyền propLogs trực tiếp thì dùng propLogs
    if (propLogs) {
      setActivities(propLogs);
      setIsLoading(false);
      return;
    }

    if (!projectId && (!entityType || !entityId)) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let res;
      if (entityType && entityId) {
        res = await ActivityService.getByEntity(entityType, entityId);
      } else if (projectId) {
        res = await ActivityService.getByProject(projectId);
      }

      if (res && res.data) {
        // Đảm bảo sắp xếp mới nhất lên đầu
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setActivities(sorted);
      }
    } catch (err: any) {
      console.error('❌ Error loading Activity Log:', err);
      setError(err?.response?.data?.message || 'Failed to load activity log');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, entityType, entityId, propLogs]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Cập nhật lại khi propLogs thay đổi
  useEffect(() => {
    if (propLogs) {
      setActivities(propLogs);
    }
  }, [propLogs]);

  // ── Render Relative Time ─────────────────────────────────────────────────
  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : new Date(dateString);
      if (!isValid(date)) return dateString;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (e) {
      return dateString;
    }
  };

  // ── Render Initials Avatar ───────────────────────────────────────────────
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // ── Render Skeleton Loading ──────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className={`space-y-6 p-4 ${className}`}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Render Error State ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center p-6 text-center text-slate-500 ${className}`}>
        <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
        <p className="text-sm font-medium text-slate-700 mb-2">{error}</p>
        <button
          onClick={fetchActivities}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  // ── Render Empty State ───────────────────────────────────────────────────
  if (!activities || activities.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 ${className}`}>
        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center mb-3 text-slate-400">
          <History className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 mb-1">No activities yet</h4>
        <p className="text-xs text-slate-500 max-w-xs">{emptyMessage}</p>
      </div>
    );
  }

  // ── Main Timeline View ───────────────────────────────────────────────────
  return (
    <div className={`relative ${className}`}>
      {/* Nút Refresh nhỏ ở góc trên nếu tự fetch */}
      {!propLogs && (
        <div className="flex justify-end mb-3">
          <button
            onClick={fetchActivities}
            title="Refresh activities"
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dòng kẻ timeline đằng sau */}
      <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-200/70" />

      <div className="space-y-5 relative">
        {activities.map((log) => {
          const actionInfo = getActivityActionInfo(log.action, log.entityType);
          const IconComponent = actionInfo.icon;
          const actorName = log.actor?.fullName || 'User';
          const avatarUrl = log.actor?.avatarUrl;

          return (
            <div key={log.id} className="flex gap-3 group relative items-start">
              {/* Avatar + Icon Action badge */}
              <div className="relative shrink-0 z-10">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={actorName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-xs"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white font-bold text-xs flex items-center justify-center border-2 border-white shadow-xs">
                    {getInitials(actorName)}
                  </div>
                )}

                {/* Badge Icon nhỏ góc dưới avatar */}
                <div
                  className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${actionInfo.bgColor} ${actionInfo.textColor} border border-white flex items-center justify-center shadow-xs`}
                  title={log.action}
                >
                  <IconComponent className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Chi tiết thông tin activity */}
              <div className="flex-1 bg-white p-3 rounded-xl border border-slate-200/70 shadow-xs hover:border-slate-300 transition-all">
                <div className="text-xs text-slate-700 leading-relaxed">
                  <span className="font-semibold text-slate-900 mr-1">{actorName}</span>
                  {renderActivityDescription(log)}
                </div>

                <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                  <span>{formatTimeAgo(log.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ActivityTimeline;
