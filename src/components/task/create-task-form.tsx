import React, { useState } from 'react';
import { Calendar, Clock, X } from 'lucide-react';
import TaskService, { CreateTaskPayload } from '../../services/task.service';

interface CreateTaskFormProps {
  listId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreateTaskForm({ listId, onSuccess, onCancel }: CreateTaskFormProps) {
  const [title, setTitle] = useState('');
  const [showDates, setShowDates] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || isCreating) return;

    setIsCreating(true);
    try {
      const payload: CreateTaskPayload = {
        listId: listId,
        title: title.trim(),
        priority: 'MEDIUM',
      };

      if (showDates && startDate) {
        payload.startDate = new Date(startDate).toISOString();
      }

      if (showDates && dueDate) {
        payload.dueDate = new Date(dueDate).toISOString();
      }

      await TaskService.createInList(listId, payload);

      setTitle('');
      setStartDate('');
      setDueDate('');
      setShowDates(false);
      onSuccess();
    } catch (error: any) {
      console.error('❌ Failed to create task:', error);
      alert(error?.response?.data?.message || 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <div className="bg-white border-2 border-indigo-200 rounded-xl p-3.5 flex flex-col gap-3 shadow-sm">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter task title..."
          autoFocus
          disabled={isCreating}
          className="w-full text-sm font-semibold border-none outline-none focus:ring-0 p-0 placeholder:text-slate-400 text-slate-800"
        />

        {/* Add Dates toggle button */}
        {!showDates ? (
          <div>
            <button
              type="button"
              onClick={() => setShowDates(true)}
              disabled={isCreating}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50/50 text-xs font-medium transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Add dates</span>
            </button>
          </div>
        ) : (
          /* Date Inputs */
          <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-200 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                Work Schedule
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowDates(false);
                  setStartDate('');
                  setDueDate('');
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors cursor-pointer"
                title="Clear dates"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={isCreating}
                  className="w-full text-xs border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-slate-400 mb-0.5">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  disabled={isCreating}
                  className="w-full text-xs border border-slate-200 rounded-md px-2 py-1 outline-none focus:ring-1 focus:ring-indigo-300 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            type="submit"
            disabled={!title.trim() || isCreating}
            className="flex-1 px-3 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm cursor-pointer"
          >
            {isCreating ? 'Creating...' : 'Add task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isCreating}
            className="px-3 py-2 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
