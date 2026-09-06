import { useEffect, useState } from 'react';
import TaskService from '../services/task.service';
import type { TaskSummaryDTO } from '../types/task';

interface UseTasksByUserResult {
  tasks: TaskSummaryDTO[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTasksByUser(): UseTasksByUserResult {
  const [tasks, setTasks]       = useState<TaskSummaryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [tick, setTick]         = useState(0);

  useEffect(() => {
    // Không gọi API nếu chưa có token — tránh 401 loop
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    TaskService.getTasksByUserId()
      .then((res)  => { if (!cancelled) setTasks(res.data); })
      .catch((err: any) => {
        if (!cancelled) {
          // 401 đã được xử lý ở interceptor — không set error để tránh flash UI
          if (err?.response?.status !== 401) {
            setError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải task.');
          }
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [tick]); // [tick] — chỉ re-fetch khi gọi refetch() thủ công

  return { tasks, isLoading, error, refetch: () => setTick((t) => t + 1) };
}
