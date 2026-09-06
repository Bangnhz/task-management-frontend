import React, { useState } from 'react';
import { Plus, Pencil, CheckCircle2 } from 'lucide-react';
import type { Task } from '../../../types/task';
import TaskCard from '../../../components/task/task-card';
import CreateTaskForm from '../../../components/task/create-task-form';
import ColumnModal from './column-modal';

interface BoardColumnProps {
  id: number;
  title: string;
  color: string;
  isDone?: boolean;
  tasks: Task[];
  onDragOver: (e: React.DragEvent) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  // 👇 Thêm targetIndex (optional)
  onDrop: (e: React.DragEvent<HTMLDivElement>, targetIndex?: number) => void;
  onTaskDragStart: (e: React.DragEvent, taskId: string) => void;
  onTaskDragEnd: (e: React.DragEvent) => void;
  onTaskClick?: (task: Task, tab?: 'details' | 'comments') => void;
  onTaskCreated: () => void;
  onTaskUpdated?: () => void;
}

export default function BoardColumn({
  id,
  title,
  color,
  isDone = false,
  tasks,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskClick,
  onTaskCreated,
  onTaskUpdated,
}: BoardColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  function handleTaskCreated() {
    setIsAddingTask(false);
    onTaskCreated();
  }

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1 group/column-header">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 truncate" title={title}>
            {title}
          </span>

          {isDone && (
            <span
              className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border border-emerald-200/60 rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0"
              title="Done List"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Done</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Edit button */}
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 opacity-0 group-hover/column-header:opacity-100 transition-all duration-200 cursor-pointer"
            title="Edit list"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Task count */}
          <span className="bg-slate-100 rounded-full px-2 py-0.5 text-xs font-semibold text-slate-500">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Body / Dropzone */}
      <div
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        // Thả vào khoảng trống của cột -> mặc định chèn xuống cuối (targetIndex = undefined)
        onDrop={(e) => onDrop(e)}
        className={`flex flex-col gap-2.5 flex-1 rounded-xl p-2 bg-slate-50 border border-transparent transition-all min-h-[120px] ${
          isDone ? 'bg-emerald-50/20 border-emerald-100/50' : ''
        }`}
      >
        {tasks.map((task, idx) => (
          <TaskCard
            key={task.id}
            task={task}
            index={idx}
            onDragStart={onTaskDragStart}
            onDragEnd={onTaskDragEnd}
            onDropOnTask={(targetIdx) => onDrop({ preventDefault: () => {} } as any, targetIdx)}
            onTaskClick={onTaskClick}
            onTaskUpdated={onTaskUpdated}
          />
        ))}

        {tasks.length === 0 && !isAddingTask && (
          <div className="flex-1 flex items-center justify-center py-8 rounded-lg border-2 border-dashed border-slate-200">
            <p className="text-xs text-slate-300">Drop here</p>
          </div>
        )}

        {isAddingTask ? (
          <CreateTaskForm
            listId={id}
            onSuccess={handleTaskCreated}
            onCancel={() => setIsAddingTask(false)}
          />
        ) : (
          <button
            onClick={() => setIsAddingTask(true)}
            className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200 text-indigo-600 hover:from-indigo-100 hover:to-purple-100 hover:border-indigo-300 hover:shadow-md hover:scale-[1.02] transition-all duration-200 mt-2"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
            <span>Add task</span>
          </button>
        )}
      </div>

      {/* Column Modal (Edit Mode) */}
      <ColumnModal
        mode="edit"
        id={id}
        currentTitle={title}
        currentIsDone={isDone}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => onTaskUpdated?.()}
      />
    </div>
  );
}