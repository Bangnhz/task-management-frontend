import api from './api';
import type { WorkspaceResponseDTO, WorkspaceCreateRequest } from '../types/workspace';
import type { ProjectCardDTO } from '../types/project';

const WorkspaceService = {
  getAllWorkspaces: () => 
    api.get<WorkspaceResponseDTO[]>('/workspaces'),
  
  getMyWorkspaces: () => 
    api.get<WorkspaceResponseDTO[]>('/workspaces/me'),
  
  getWorkspaces: () => 
    api.get<WorkspaceResponseDTO[]>('/workspaces/me'),
  
  getProjectsByWorkspace: (workspaceId: number) => 
    api.get<ProjectCardDTO[]>(`/workspaces/${workspaceId}/projects`),

  createWorkspace: (data: WorkspaceCreateRequest) =>
    api.post<WorkspaceResponseDTO>('/workspaces', data),
};

export default WorkspaceService;