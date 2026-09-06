import api from "./api";
import { ProjectRole, MemberStatus } from "./invite.service";

export interface ProjectMemberResponseDTO {
  id: number;
  projectId: number;
  userId: number;
  fullName: string;
  email: string;
  avatarUrl?: string;
  role: ProjectRole;
  status: MemberStatus;
  joinedAt: string;  
}
export interface ProjectMemberStatusRequestDTO{
  status: MemberStatus;
}
const ProjectMemberService = {
  getPendingMembers: (projectId: number) => 
    api.get<ProjectMemberResponseDTO[]>(`/projects/${projectId}/members/pending`),
  
  getAllMembers: (projectId: number) =>
    api.get<ProjectMemberResponseDTO[]>(`/projects/${projectId}/members`),
  
  updateMemberRole: (projectId: number, userId: number, role: ProjectRole) =>
    api.patch(`/projects/${projectId}/members/${userId}/role`, { role }),
  
  updateMemberStatus: (projectId: number, memberId: number, payload: ProjectMemberStatusRequestDTO) =>
    api.patch(`/projects/${projectId}/members/${memberId}`,payload),
  
  removeMember: (projectId: number, userId: number) =>
    api.delete(`/projects/${projectId}/members/${userId}`),
};

export default ProjectMemberService;