import api from './api';
import type { ProjectCardDTO, ProjectCreateRequestDTO, PageResponse } from '../types/project';

const ProjectService = {
  getProjects: () => api.get<ProjectCardDTO[]>('/projects'),
  getMyProjects: (params?: { page?: number; size?: number }) =>
    api.get<PageResponse<ProjectCardDTO> | ProjectCardDTO[]>('/projects/me', { params }),
  getProjectsByWorkspace: (workspaceId: number) =>
    api.get<ProjectCardDTO[]>(`/workspaces/${workspaceId}/projects`),
  createProject: (workspaceId: number, project: ProjectCreateRequestDTO) =>
    api.post<ProjectCardDTO>(`/workspaces/${workspaceId}/projects`, project),
};

export default ProjectService;
