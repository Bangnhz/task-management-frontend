import { useEffect, useState } from 'react';
import ProjectService from '../services/project.service';
import type { ProjectCardDTO } from '../types/project';

export interface UseMyProjectsResult {
  projects: ProjectCardDTO[];
  isLoading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalElements: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  refetch: () => void;
}

export function useMyProjects(initialPage: number = 0, size: number = 50): UseMyProjectsResult {
  const [projects, setProjects]   = useState<ProjectCardDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [page, setPage]           = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [tick, setTick]           = useState(0);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { setIsLoading(false); return; }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    ProjectService.getMyProjects({ page, size })
      .then((res) => {
        if (!cancelled) {
          if (Array.isArray(res.data)) {
            const raw = res.data;
            setTotalElements(raw.length);
            setTotalPages(Math.ceil(raw.length / size) || 1);
            setProjects(raw.slice(page * size, (page + 1) * size));
          } else {
            const content = res.data?.content ?? [];
            setProjects(content);
            setTotalPages(res.data?.totalPages ?? 1);
            setTotalElements(res.data?.totalElements ?? content.length);
          }
        }
      })
      .catch((err: any) => {
        if (!cancelled && err?.response?.status !== 401) {
          setError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải projects.');
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [page, size, tick]);

  return {
    projects,
    isLoading,
    error,
    page,
    totalPages,
    totalElements,
    setPage,
    refetch: () => setTick((t) => t + 1),
  };
}

export function useProjects(): UseMyProjectsResult {
  return useMyProjects(0, 50);
}
