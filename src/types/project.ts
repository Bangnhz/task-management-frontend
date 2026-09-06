export type ProjectVisibility = 'PUBLIC' | 'PRIVATE' | 'WORKSPACE' | string;

/**
 * Khớp 1-1 với Java ProjectCardDTO:
 *
 *   private Long id;
 *   private String name;
 *   private Long totalTasks;
 *   private ProjectVisibility visibility;
 *   private LocalDateTime updatedAt;
 */
export interface ProjectCardDTO {
  id: number;
  name: string;
  totalTasks: number;
  visibility?: ProjectVisibility;
  updatedAt?: string;
}

/**
 * Project đầy đủ — dùng trong project-header và các view detail
 * Mở rộng thêm field khi BE cung cấp
 */
export interface Project {
  id: string;
  name: string;
  description?: string;
  progress?: number;
  totalTasks?: number;
  status?: string;
  updatedAt?: string;
  memberInitials?: string[];
}
export interface ProjectCreateRequestDTO {
  title: string;
  visibility: ProjectVisibility;
}

export interface PageResponse<T> {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number;
  last?: boolean;
  first?: boolean;
  empty?: boolean;
}

