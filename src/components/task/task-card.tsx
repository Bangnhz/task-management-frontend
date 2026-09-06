import React, { useState } from 'react';
import { MoreVertical, Pencil, Clock, Calendar, Check, X, User } from 'lucide-react';
import type { Task } from '../../types/task';
import PriorityBadge from '../common/priority-badge';
import TaskService from '../../services/task.service';
import { getTaskDateDisplay } from '../../utils/format-date';
import { getInitials } from '../../utils/user.util';

interface TaskCardProps {
  task: Task;
  index: number;
  onDragStart: (e: React.DragEvent, taskId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDropOnTask?: (targetIndex: number) => void;
  onTaskClick?: (task: Task, tab?: 'details' | 'comments') => void;
  onTaskUpdated?: () => void;
}

function formatForDateInput(isoString?: string): string {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString.slice(0, 10);
    const pad = (n: number) => (n < 10 ? '0' + n : n);
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    return `${year}-${month}-${day}`;
  } catch {
    return isoString?.slice(0, 10) || '';
  }
}

export default function TaskCard({
  task,
  index,
  onDragStart,
  onDragEnd,
  onDropOnTask,
  onTaskClick,
  onTaskUpdated,
}: TaskCardProps) {
  const count = Number(task.commentCount || 0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState<'none' | 'title' | 'time'>('none');

  const [editTitle, setEditTitle] = useState(task.title);
  const [editStartDate, setEditStartDate] = useState(formatForDateInput(task.startDate));
  const [editDueDate, setEditDueDate] = useState(formatForDateInput(task.dueDate));
  const [isSaving, setIsSaving] = useState(false);

  async function handleSaveTitle(e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await TaskService.update({
        id: task.id,
        title: editTitle.trim(),
      });
      setEditMode('none');
      onTaskUpdated?.();
    } catch (error: any) {
      console.error('❌ Failed to update title:', error);
      alert(error?.response?.data?.message || 'Failed to update task title');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSaveTime(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      await TaskService.update({
        id: task.id,
        startDate: editStartDate || undefined,
        dueDate: editDueDate || undefined,
      });
      setEditMode('none');
      onTaskUpdated?.();
    } catch (error: any) {
      console.error('❌ Failed to update time:', error);
      alert(error?.response?.data?.message || 'Failed to update task dates');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div
      draggable={editMode === 'none'}
      onDragStart={(e) => editMode === 'none' && onDragStart(e, task.id.toString())}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDropOnTask?.(index);
      }}
      className="bg-white border border-slate-200/80 rounded-xl p-3.5 flex flex-col gap-3 cursor-grab active:cursor-grabbing hover:border-indigo-300 hover:shadow-md transition-all select-none relative group"
    >
      {/* Top row: Title + Edit menu button */}
      <div className="flex items-start justify-between gap-2">
        {editMode === 'title' ? (
          <form
            onSubmit={handleSaveTitle}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex gap-1 items-center"
          >
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              disabled={isSaving}
              className="flex-1 text-xs border border-indigo-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-indigo-300 font-semibold"
            />
            <button
              type="submit"
              disabled={!editTitle.trim() || isSaving}
              className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
              title="Save title"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setEditMode('none')}
              disabled={isSaving}
              className="p-1.5 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition-colors cursor-pointer"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <p
            onClick={() => onTaskClick?.(task, 'details')}
            className="flex-1 text-sm font-medium text-slate-900 m-0 leading-snug hover:text-indigo-600 cursor-pointer transition-colors"
          >
            {task.title}
          </p>
        )}

        {/* Edit menu button */}
        {editMode === 'none' && (
          <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Edit task"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {/* Menu options */}
            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEditTitle(task.title);
                      setEditMode('title');
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit title</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditStartDate(formatForDateInput(task.startDate));
                      setEditDueDate(formatForDateInput(task.dueDate));
                      setEditMode('time');
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit dates</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Inline Date Form */}
      {editMode === 'time' && (
        <form
          onSubmit={handleSaveTime}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              Edit Task Dates
            </span>
            <button
              type="button"
              onClick={() => setEditMode('none')}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <div>
              <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                Start Date
              </label>
              <input
                type="date"
                value={editStartDate}
                onChange={(e) => setEditStartDate(e.target.value)}
                disabled={isSaving}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-indigo-300"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                Due Date
              </label>
              <input
                type="date"
                value={editDueDate}
                onChange={(e) => setEditDueDate(e.target.value)}
                disabled={isSaving}
                className="w-full text-xs border border-slate-200 rounded px-2 py-1 bg-white outline-none focus:ring-1 focus:ring-indigo-300"
              />
            </div>
          </div>

          <div className="flex gap-1.5 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-1.5 bg-indigo-600 text-white text-xs font-semibold rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isSaving ? 'Saving...' : 'Save dates'}
            </button>
            <button
              type="button"
              onClick={() => setEditMode('none')}
              disabled={isSaving}
              className="px-2.5 py-1.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Bottom row: Priority, comment, date, assignee */}
      <div className="flex items-center justify-between gap-2">
        <PriorityBadge priority={task.priority} />

        <div className="flex items-center gap-3">
          {(() => {
            const dateDisplay = getTaskDateDisplay(task.startDate, task.dueDate);
            if (!dateDisplay) return null;
            return (
              <div
                className="flex items-center gap-1 text-[0.7rem] text-slate-500 bg-slate-100/90 hover:bg-slate-100 px-1.5 py-0.5 rounded-md transition-colors"
                title={dateDisplay}
              >
                <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="font-medium whitespace-nowrap">
                  {dateDisplay}
                </span>
              </div>
            );
          })()}

          {/* Comment button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTaskClick?.(task, 'comments');
            }}
            title={count > 0 ? `${count} comments` : 'View & add comments'}
            className="relative flex items-center justify-center p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>

            {count > 0 && (
              <span className="absolute -top-1 -right-1.5 min-w-[15px] h-[15px] px-0.5 bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none ring-2 ring-white">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </button>

          {task.assignee ? (
            <div
              className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[0.6rem] font-bold flex items-center justify-center shrink-0 border border-indigo-200 cursor-pointer overflow-hidden shadow-2xs"
              title={`Assignee: ${task.assignee.fullName}`}
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick?.(task, 'details');
              }}
            >
              {task.assignee.avatarUrl ? (
                <img src={task.assignee.avatarUrl} alt={task.assignee.fullName} className="w-full h-full object-cover" />
              ) : (
                getInitials(task.assignee.fullName)
              )}
            </div>
          ) : (
            <div
              className="w-6 h-6 rounded-full bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 text-[0.6rem] font-bold flex items-center justify-center shrink-0 border border-dashed border-slate-300 hover:border-indigo-300 transition-colors cursor-pointer"
              title="Click to assign member"
              onClick={(e) => {
                e.stopPropagation();
                onTaskClick?.(task, 'details');
              }}
            >
              <User className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}