export interface WorkspaceResponseDTO {
  id: number;
  name: string;
  createdAt: string;
}

export interface WorkspaceCreateRequest {
  name: string;
}