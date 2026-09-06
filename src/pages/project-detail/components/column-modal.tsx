import React, { useState, useEffect } from 'react';
import { X, Plus, Pencil, CheckCircle2, Loader2 } from 'lucide-react';
import TaskListService from '../../../services/task-list.service';

export interface ColumnModalProps {
  mode: 'create' | 'edit';
  projectId?: number | string;
  id?: number;
  currentTitle?: string;
  currentIsDone?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ColumnModal({
  mode,
  projectId,
  id,
  currentTitle = '',
  currentIsDone = false,
  isOpen,
  onClose,
  onSuccess,
}: ColumnModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [isDone, setIsDone] = useState(currentIsDone);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCreate = mode === 'create';

  useEffect(() => {
    if (isOpen) {
      setTitle(isCreate ? '' : currentTitle);
      setIsDone(isCreate ? false : currentIsDone);
      setError(null);
    }
  }, [mode, currentTitle, currentIsDone, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('List title cannot be empty');
      return;
    }
    if (title.length > 100) {
      setError('List title must not exceed 100 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isCreate) {
        if (!projectId) {
          setError('Missing Project ID');
          setIsSubmitting(false);
          return;
        }
        await TaskListService.create(Number(projectId), {
          title: title.trim(),
          isDone: isDone,
        });
      } else {
        if (!id) {
          setError('Missing List ID');
          setIsSubmitting(false);
          return;
        }
        await TaskListService.update(id, {
          title: title.trim(),
          isDone: isDone,
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(isCreate ? '❌ Error creating TaskList:' : '❌ Error updating TaskList:', err);
      setError(err?.response?.data?.message || (isCreate ? 'Failed to create task list' : 'Failed to update task list'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5 text-slate-800 font-bold text-base">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isCreate ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {isCreate ? <Plus className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </div>
            <span>{isCreate ? 'Create New List' : 'Edit List'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium flex items-center gap-2">
              <span>{error}</span>
            </div>
          )}

          {/* Title input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
              List Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="e.g. To Do, In Progress, Done..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
              autoFocus
            />
            <p className="text-[11px] text-slate-400 text-right">{title.length}/100 characters</p>
          </div>

          {/* IsDone checkbox toggle */}
          <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg transition-colors ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    Done List (Completion Column)
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isDone}
                onChange={(e) => setIsDone(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
            </label>
            <p className="text-xs text-slate-500 pl-8 leading-relaxed">
              Tasks placed in this column will be marked as <strong>Completed</strong> by default.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isCreate ? 'Creating...' : 'Saving...'}</span>
                </>
              ) : (
                <span>{isCreate ? 'Create List' : 'Save changes'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
