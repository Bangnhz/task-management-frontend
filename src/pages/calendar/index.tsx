import React, { useState, useEffect } from 'react';
import CalendarView from '../../components/common/calendar-view';
import TaskDetailDrawer from '../../components/task/task-detail-drawer';
import TaskService from '../../services/task.service';
import { Skeleton } from '../../components/common/loading-skeleton';
import type { Task } from '../../types/task';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [drawerTab, setDrawerTab] = useState<'details' | 'comments'>('details');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await TaskService.getMyTasks();
      setTasks(res.data || []);
    } catch (err) {
      console.error('Failed to load tasks for calendar:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  function handleTaskClick(task: Task, tab: 'details' | 'comments' = 'details') {
    setSelectedTask(task);
    setDrawerTab(tab);
    setDrawerOpen(true);
  }

  function handleCloseDrawer() {
    setDrawerOpen(false);
    setTimeout(() => setSelectedTask(null), 200);
  }

  function handleCommentCountChange(taskId: string, count: number) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id.toString() === taskId.toString() ? { ...t, commentCount: count } : t
      )
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 p-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full rounded-2xl" />
        <Skeleton className="h-[480px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      <CalendarView
        title="Calendar"
        subtitle="View all your tasks and deadlines by date"
        tasks={tasks}
        onTaskClick={handleTaskClick}
      />

      {drawerOpen && (
        <TaskDetailDrawer
          taskOverride={selectedTask}
          initialTab={drawerTab}
          onClose={handleCloseDrawer}
          onCommentCountChange={handleCommentCountChange}
        />
      )}
    </>
  );
}
