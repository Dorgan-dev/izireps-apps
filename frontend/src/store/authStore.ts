import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/index';
import { authApi } from '../services/api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login(email, password);
          const { user, token } = res.data;
          localStorage.setItem('token', token);
          set({ user, token, isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.message ?? 'Login gagal';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          localStorage.removeItem('token');
          set({ user: null, token: null });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
