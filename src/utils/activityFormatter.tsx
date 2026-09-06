import React from 'react';
import {
  PlusCircle,
  Edit3,
  Trash2,
  ArrowRightLeft,
  UserPlus,
  UserMinus,
  CheckCircle2,
  RotateCcw,
  UserCheck,
  LogOut,
  UserX,
  MessageSquare,
  FileText,
} from 'lucide-react';
import type { ActivityLogResponse, ActivityAction, EntityType } from '../types/activity.types';

// ── Component Badge Highlight ──────────────────────────────────────────────
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose' | 'slate' | 'violet';
}

export function ActivityBadge({ children, variant = 'indigo' }: BadgeProps) {
  const styles = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    blue: 'bg-blue-50 text-blue-700 border-blue-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200/80',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 mx-0.5 rounded-md text-xs font-semibold border ${styles[variant]} transition-colors`}
    >
      {children}
    </span>
  );
}

// ── Component Highlight Entity / Task Name ──────────────────────────────────
export function HighlightText({ children }: { children: React.ReactNode }) {
  return <strong className="font-bold text-slate-900 mx-0.5">{children}</strong>;
}

// ── Icon & Color Config for each Action type ───────────────────────────────
export function getActivityActionInfo(action: ActivityAction, entityType?: EntityType) {
  switch (action) {
    case 'CREATED':
      if (entityType === 'COMMENT') {
        return {
          icon: MessageSquare,
          bgColor: 'bg-indigo-50',
          textColor: 'text-indigo-600',
          borderColor: 'border-indigo-200',
          dotColor: 'bg-indigo-500',
        };
      }
      return {
        icon: PlusCircle,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
        dotColor: 'bg-emerald-500',
      };

    case 'UPDATED':
      return {
        icon: Edit3,
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        borderColor: 'border-blue-200',
        dotColor: 'bg-blue-500',
      };

    case 'DELETED':
      return {
        icon: Trash2,
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-600',
        borderColor: 'border-rose-200',
        dotColor: 'bg-rose-500',
      };

    case 'MOVED':
      return {
        icon: ArrowRightLeft,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-200',
        dotColor: 'bg-amber-500',
      };

    case 'ASSIGNED':
      return {
        icon: UserPlus,
        bgColor: 'bg-indigo-50',
        textColor: 'text-indigo-600',
        borderColor: 'border-indigo-200',
        dotColor: 'bg-indigo-500',
      };

    case 'UNASSIGNED':
      return {
        icon: UserMinus,
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200',
        dotColor: 'bg-slate-400',
      };

    case 'COMPLETED':
      return {
        icon: CheckCircle2,
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-600',
        borderColor: 'border-emerald-200',
        dotColor: 'bg-emerald-500',
      };

    case 'REOPENED':
      return {
        icon: RotateCcw,
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        borderColor: 'border-orange-200',
        dotColor: 'bg-orange-500',
      };

    case 'JOINED':
      return {
        icon: UserCheck,
        bgColor: 'bg-teal-50',
        textColor: 'text-teal-600',
        borderColor: 'border-teal-200',
        dotColor: 'bg-teal-500',
      };

    case 'LEFT':
      return {
        icon: LogOut,
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-600',
        borderColor: 'border-amber-200',
        dotColor: 'bg-amber-500',
      };

    case 'KICKED':
      return {
        icon: UserX,
        bgColor: 'bg-rose-50',
        textColor: 'text-rose-600',
        borderColor: 'border-rose-200',
        dotColor: 'bg-rose-500',
      };

    default:
      return {
        icon: FileText,
        bgColor: 'bg-slate-50',
        textColor: 'text-slate-600',
        borderColor: 'border-slate-200',
        dotColor: 'bg-slate-400',
      };
  }
}

// ── Main Formatter rendering clear English action sentences ──────────────────
export function renderActivityDescription(log: ActivityLogResponse): React.ReactNode {
  const details = log.details || {};
  const { action, entityType } = log;

  // Extract common details fields
  const taskTitle = details.taskTitle || details.title || details.name;
  const listTitle = details.listTitle || details.columnTitle;
  const fromListTitle = details.fromListTitle || details.fromColumn;
  const toListTitle = details.toListTitle || details.toColumn;
  const assigneeName = details.assigneeName || details.assignee || details.targetUser;
  const field = details.field || details.fieldName;
  const oldValue = details.oldValue;
  const newValue = details.newValue;
  const commentContent = details.commentContent || details.content;

  // 1. ACTION: CREATED
  if (action === 'CREATED') {
    if (entityType === 'TASK') {
      return (
        <span>
          created task <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>
          {listTitle && (
            <>
              in list <ActivityBadge variant="indigo">{listTitle}</ActivityBadge>
            </>
          )}
        </span>
      );
    }
    if (entityType === 'TASK_LIST') {
      return (
        <span>
          created list <ActivityBadge variant="indigo">{listTitle || taskTitle || `List #${log.entityId}`}</ActivityBadge>
        </span>
      );
    }
    if (entityType === 'COMMENT') {
      return (
        <span>
          commented on <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>
          {commentContent && (
            <span className="block mt-1 p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 italic">
              "{commentContent}"
            </span>
          )}
        </span>
      );
    }
    if (entityType === 'PROJECT') {
      return (
        <span>
          created project <HighlightText>{details.projectName || taskTitle || `Project #${log.entityId}`}</HighlightText>
        </span>
      );
    }
    return (
      <span>
        created {getEntityTypeLabel(entityType).toLowerCase()} <HighlightText>{taskTitle || `#${log.entityId}`}</HighlightText>
      </span>
    );
  }

  // 2. ACTION: MOVED
  if (action === 'MOVED') {
    return (
      <span>
        moved <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>
        {fromListTitle && toListTitle ? (
          <>
            from <ActivityBadge variant="slate">{fromListTitle}</ActivityBadge> to{' '}
            <ActivityBadge variant="indigo">{toListTitle}</ActivityBadge>
          </>
        ) : toListTitle ? (
          <>
            to list <ActivityBadge variant="indigo">{toListTitle}</ActivityBadge>
          </>
        ) : null}
      </span>
    );
  }

  // 3. ACTION: ASSIGNED
  if (action === 'ASSIGNED') {
    return (
      <span>
        assigned <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText> to{' '}
        <ActivityBadge variant="blue">{assigneeName || 'member'}</ActivityBadge>
      </span>
    );
  }

  // 4. ACTION: UNASSIGNED
  if (action === 'UNASSIGNED') {
    return (
      <span>
        unassigned <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>{' '}
        {assigneeName && (
          <>
            from <ActivityBadge variant="rose">{assigneeName}</ActivityBadge>
          </>
        )}
      </span>
    );
  }

  // 5. ACTION: COMPLETED
  if (action === 'COMPLETED') {
    return (
      <span>
        marked <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText> as{' '}
        <ActivityBadge variant="emerald">Completed</ActivityBadge>
      </span>
    );
  }

  // 6. ACTION: REOPENED
  if (action === 'REOPENED') {
    return (
      <span>
        reopened <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>{' '}
        <ActivityBadge variant="amber">Reopened</ActivityBadge>
      </span>
    );
  }

  // 7. ACTION: DELETED
  if (action === 'DELETED') {
    if (entityType === 'TASK') {
      return (
        <span>
          deleted task <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>
        </span>
      );
    }
    if (entityType === 'COMMENT') {
      return (
        <span>
          deleted a comment in <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>
        </span>
      );
    }
    return (
      <span>
        deleted {getEntityTypeLabel(entityType).toLowerCase()} <HighlightText>{taskTitle || `#${log.entityId}`}</HighlightText>
      </span>
    );
  }

  // 8. ACTION: JOINED / LEFT / KICKED
  if (action === 'JOINED') {
    return <span>joined the project</span>;
  }
  if (action === 'LEFT') {
    return <span>left the project</span>;
  }
  if (action === 'KICKED') {
    return (
      <span>
        removed <ActivityBadge variant="rose">{assigneeName || 'member'}</ActivityBadge> from project
      </span>
    );
  }

  // 9. ACTION: UPDATED
  if (action === 'UPDATED') {
    const fieldNameNormalized = (field || '').toLowerCase();

    if (fieldNameNormalized.includes('status')) {
      return (
        <span>
          changed status of <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>
          {oldValue && newValue && (
            <>
              from <ActivityBadge variant="amber">{String(oldValue)}</ActivityBadge> to{' '}
              <ActivityBadge variant="emerald">{String(newValue)}</ActivityBadge>
            </>
          )}
        </span>
      );
    }

    if (fieldNameNormalized.includes('priority')) {
      return (
        <span>
          updated priority of <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>
          {oldValue && newValue && (
            <>
              from <ActivityBadge variant="slate">{String(oldValue)}</ActivityBadge> to{' '}
              <ActivityBadge variant="violet">{String(newValue)}</ActivityBadge>
            </>
          )}
        </span>
      );
    }

    if (fieldNameNormalized.includes('title')) {
      return (
        <span>
          renamed task to <HighlightText>{newValue || taskTitle}</HighlightText>
          {oldValue && <span className="text-slate-400 text-xs ml-1">(previously: "{oldValue}")</span>}
        </span>
      );
    }

    if (fieldNameNormalized.includes('description')) {
      return (
        <span>
          updated description of <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>
        </span>
      );
    }

    if (fieldNameNormalized.includes('due') || fieldNameNormalized.includes('date')) {
      return (
        <span>
          changed due date of <HighlightText>{taskTitle || `Task #${log.entityId}`}</HighlightText>
          {newValue && (
            <>
              to <ActivityBadge variant="blue">{String(newValue)}</ActivityBadge>
            </>
          )}
        </span>
      );
    }

    // Default fallback for UPDATED
    return (
      <span>
        updated {field ? `field ${field}` : 'details'} of{' '}
        <HighlightText>{taskTitle || getEntityTypeLabel(entityType)}</HighlightText>
      </span>
    );
  }

  // Default fallback for unhandled cases
  return (
    <span>
      performed {(action as string).toLowerCase()} on {getEntityTypeLabel(entityType).toLowerCase()}{' '}
      <HighlightText>{taskTitle || (action as string)}</HighlightText>
    </span>
  );
}

function getEntityTypeLabel(entityType: EntityType): string {
  switch (entityType) {
    case 'TASK':
      return 'task';
    case 'TASK_LIST':
      return 'task list';
    case 'PROJECT':
      return 'project';
    case 'WORKSPACE':
      return 'workspace';
    case 'COMMENT':
      return 'comment';
    case 'MEMBER':
      return 'member';
    default:
      return 'entity';
  }
}
