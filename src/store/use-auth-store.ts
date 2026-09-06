import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponseDTO } from '../types/auth';

interface AuthState {
  user: UserResponseDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  _hydrated: boolean;

  setAuth: (token: string, user: UserResponseDTO) => void;
  clearAuth: () => void;
  updateUser: (user: UserResponseDTO) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:            null,
      token:           null,
      isAuthenticated: false,
      _hydrated:       false,

      setAuth: (token, user) => {
        localStorage.setItem('access_token', token);
        set({ token, user, isAuthenticated: true });
      },

      clearAuth: () => {
        localStorage.removeItem('access_token');
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (user) => set({ user }),

      setHydrated: () => set({ _hydrated: true }),
    }),
    {
      name: 'taskflow-auth',

      partialize: (state) => ({
        token:           state.token,
        user:            state.user,
        isAuthenticated: state.isAuthenticated,
        // _hydrated KHÔNG persist — luôn bắt đầu từ false mỗi lần load trang
      }),

      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('[AuthStore] Lỗi hydrate:', error);
        }
        // Luôn set _hydrated = true sau khi đọc localStorage xong,
        // kể cả khi localStorage trống (state = undefined/null)
        if (state) {
          state.setHydrated();
        } else {
          // localStorage trống — không có session → vẫn phải unlock guards
          useAuthStore.setState({ _hydrated: true });
        }
      },
    }
  )
);
