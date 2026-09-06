import api from "./api";

export enum ProjectRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export interface InvitePreviewResponse {
  projectId: number;
  projectTitle: string;
  assignedRole: ProjectRole;
  requiresApproval: boolean;
  memberStatus: MemberStatus | null;
}

export interface ProjectInvitationCreateRequest {
  expireDays?: number;
  role: ProjectRole;
  requiresApproval?: boolean;
}

export interface ProjectInvitationResponseDTO {
  id: number;
  token: string;
  expiresAt: string; // LocalDateTime from backend
  role: ProjectRole;
  requiresApproval: boolean;
}

const InviteService = {
  createInvitation: (projectId: number, payload: ProjectInvitationCreateRequest) => 
    api.post<ProjectInvitationResponseDTO>(`/project-invitations/${projectId}`, payload),
  
  getPreview: (token: string) => 
    api.get<InvitePreviewResponse>(`/project-invitations/${token}/preview`),
  
  getActiveInvitationByUser: (projectId: number) => 
    api.get<ProjectInvitationResponseDTO>(`/project-invitations/${projectId}`),
  
  acceptInvitation: (token: string) =>
    api.post(`/project-invitations/${token}/accept`),
  
  cancelJoinRequest: (token: string) =>
    api.post(`/project-invitations/${token}/cancel`),
  
  getInvitationLink: (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invite/${token}`;
  }
};

export default InviteService;