import { useState } from 'react';
import { useAuthStore } from '../store/use-auth-store';
import AuthService from '../services/auth.service';
import type { AuthResponseDTO, LoginRequestDTO, RegisterRequestDTO, UserResponseDTO } from '../types/auth';

interface UseAuthResult {
  login: (credentials: LoginRequestDTO) => Promise<void>;
  register: (data: RegisterRequestDTO) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

/**
 * Map AuthResponseDTO (flat) → UserResponseDTO
 * Backend trả về: { token, tokenType, userId, email, fullName, avatarUrl }
 */
function toUser(data: AuthResponseDTO): UserResponseDTO {
  return {
    id:       data.userId,
    email:    data.email,
    fullName: data.fullName,
    avatarUrl: data.avatarUrl,
  };
}

export function useAuth(): UseAuthResult {
  const { setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(credentials: LoginRequestDTO) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthService.login(credentials);
      setAuth(res.data.token, toUser(res.data));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Đăng nhập thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(data: RegisterRequestDTO) {
    setIsLoading(true);
    setError(null);
    try {
      const res = await AuthService.register(data);
      setAuth(res.data.token, toUser(res.data));
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Đăng ký thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    AuthService.logout();
    clearAuth();
  }

  return { login, register, logout, isLoading, error };
}
