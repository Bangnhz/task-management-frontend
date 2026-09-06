export interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  avatarUrl?: string;
  role: 'admin' | 'member' | 'viewer';
}
export interface UserSummaryDTO {
  id: number;
  fullName: string;
  avatarUrl?: string;
}

export interface UserMentionDTO {
  id: string;
  fullName: string;
  email:string;
  avatarUrl?: string;
  username:string;
}

export interface ActivityItem {
  id: string;
  userId: string;
  user: string;
  initials: string;
  action: string;
  item: string;
  time: string; 
  createdAt: string;
}
