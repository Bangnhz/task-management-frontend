import React, { useRef, useState, useEffect } from 'react';
import type { Task, TaskListDTO } from '../../../types/task';
import BoardColumn from './board-column';
import ColumnModal from './column-modal';
import TaskCard from '../../../components/task/task-card';
import { transformTask, getColorForStatus } from '../../../utils/task.util';
import { Plus } from 'lucide-react';

interface BoardViewProps {
  taskLists: TaskListDTO[];
  projectId: string;
  onTaskMove?: (taskId: string, targetListId: number, targetIndex?: number) => void;
  onTaskClick?: (task: Task, tab?: 'details' | 'comments') => void;
  onTaskCreated?: () => void;
  onTaskUpdated?: () => void;
}

export default function BoardView({
  taskLists,
  projectId,
  onTaskMove,
  onTaskClick,
  onTaskCreated,
  onTaskUpdated,
}: BoardViewProps) {
  const draggingId = useRef<string | null>(null);

  // State quản lý con trỏ kéo ảo (Custom Drag Preview)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 1. Tạo 1 ảnh trong suốt 1x1 để tắt ảnh mờ mặc định của trình duyệt
  const transparentImage = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = new Image();
    img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>';
    transparentImage.current = img;
  }, []);

  // 2. Lắng nghe vị trí chuột toàn màn hình khi đang kéo
  useEffect(() => {
    if (!draggedTask) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [draggedTask]);

  // ── Drag handlers ──────────────────────────────────────────

  function handleDragStart(e: React.DragEvent, taskId: string) {
    draggingId.current = taskId;
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';

    // Triệt tiêu ảnh mờ mặc định của trình duyệt
    if (transparentImage.current) {
      e.dataTransfer.setDragImage(transparentImage.current, 0, 0);
    }

    // Tìm task đang kéo để hiển thị clone sắc nét
    for (const list of taskLists) {
      const found = list.tasks.find((t) => t.id.toString() === taskId);
      if (found) {
        setDraggedTask(transformTask(found, list.title));
        setMousePos({ x: e.clientX, y: e.clientY });
        break;
      }
    }
  }

  function handleDragEnd(e: React.DragEvent) {
    draggingId.current = null;
    setDraggedTask(null);
    setMousePos(null);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Cập nhật vị trí chuột liên tục khi lướt qua dropzone
    setMousePos({ x: e.clientX, y: e.clientY });
  }

  function handleColumnDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.currentTarget.dataset.dragover = 'true';
    e.currentTarget.classList.add('ring-2', 'ring-indigo-300', 'ring-inset');
  }

  function handleColumnDragLeave(e: React.DragEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      e.currentTarget.classList.remove('ring-2', 'ring-indigo-300', 'ring-inset');
    }
  }

  function handleColumnDrop(
    e: React.DragEvent<HTMLDivElement>,
    targetListId: number,
    targetIndex?: number
  ) {
    if (e.currentTarget?.classList) {
      e.currentTarget.classList.remove('ring-2', 'ring-indigo-300', 'ring-inset');
    }
    e.preventDefault();
    const id = draggingId.current;
    
    // Dọn dẹp preview
    setDraggedTask(null);
    setMousePos(null);

    if (!id) return;
    onTaskMove?.(id, targetListId, targetIndex);
  }

  const columns = [...taskLists]
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .map((taskList) => ({
      id: taskList.id,
      title: taskList.title,
      isDone: taskList.isDone,
      color: getColorForStatus(taskList.title),
      tasks: taskList.tasks.map((taskSummary) => transformTask(taskSummary, taskList.title)),
    }));

  return (
    <div className="relative flex gap-4 px-6 py-4 overflow-x-auto min-h-[calc(100vh-200px)]">
      {/* Existing columns */}
      {columns.map((col) => (
        <BoardColumn
          key={col.id}
          id={col.id}
          title={col.title}
          color={col.color}
          isDone={col.isDone}
          tasks={col.tasks}
          onDragOver={handleDragOver}
          onDragEnter={handleColumnDragEnter}
          onDragLeave={handleColumnDragLeave}
          onDrop={(e, targetIndex) => handleColumnDrop(e, col.id, targetIndex)}
          onTaskDragStart={handleDragStart}
          onTaskDragEnd={handleDragEnd}
          onTaskClick={onTaskClick}
          onTaskCreated={onTaskCreated || (() => {})}
          onTaskUpdated={onTaskUpdated || onTaskCreated}
        />
      ))}

      {/* Add Column button & Modal */}
      <div className="flex items-start w-72 shrink-0">
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="group w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-300 text-slate-600 hover:from-slate-100 hover:to-slate-200 hover:border-slate-400 hover:text-slate-700 hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" />
          <span>Add Column</span>
        </button>
      </div>

      <ColumnModal
        mode="create"
        projectId={projectId}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={onTaskCreated || (() => {})}
      />

      {/* 🚀 Thẻ ảo sắc nét 100% bay theo chuột */}
      {draggedTask && mousePos && (
        <div
          style={{
            position: 'fixed',
            left: `${mousePos.x - 140}px`, // Canh giữa theo con trỏ chuột (thẻ rộng ~280px)
            top: `${mousePos.y - 25}px`,
            width: '280px',
            pointerEvents: 'none',
            zIndex: 9999,
          }}
          className="transition-transform"
        >
          <TaskCard
            task={draggedTask}
            index={-1}
            onDragStart={() => {}}
            onDragEnd={() => {}}
          />
        </div>
      )}
    </div>
  );
}