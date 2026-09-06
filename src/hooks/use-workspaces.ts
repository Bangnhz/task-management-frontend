import { useEffect, useState } from 'react';
import WorkspaceService from '../services/workspace.service';
import type { WorkspaceResponseDTO } from '../types/workspace';

interface UseWorkspacesResult {
  workspaces: WorkspaceResponseDTO[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  addWorkspace: (workspace: WorkspaceResponseDTO) => void;
}

export function useWorkspaces(): UseWorkspacesResult {
  const [workspaces, setWorkspaces] = useState<WorkspaceResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    WorkspaceService.getWorkspaces()
      .then((res) => { 
        if (!cancelled) setWorkspaces(res.data); 
      })
      .catch((err: any) => {
        if (!cancelled && err?.response?.status !== 401) {
          setError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải workspaces.');
        }
      })
      .finally(() => { 
        if (!cancelled) setIsLoading(false); 
      });

    return () => { cancelled = true; };
  }, [tick]);

  const addWorkspace = (workspace: WorkspaceResponseDTO) => {
    setWorkspaces(prev => [...prev, workspace]);
  };

  return {
    workspaces,
    isLoading,
    error,
    refetch: () => setTick((t) => t + 1),
    addWorkspace,
  };
}