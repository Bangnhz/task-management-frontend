/**
 * DTO tương ứng với backend Auth controller
 */

export interface RegisterRequestDTO {
  email: string;
  password: string;
  fullName: string;
  avatarUrl?: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  tokenType: string;  
  userId: number;      
  email: string;
  fullName: string;
  avatarUrl?: string;
}

export interface UserResponseDTO {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role?: string;
  createdAt?: string;
}
