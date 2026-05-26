import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/index';
import { authApi } from '../services/api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;

  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
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
      rememberMe: false,

      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null, rememberMe });
        try {
          const res = await authApi.login(email, password);
          const { user, token } = res.data;
          if (rememberMe) {
            localStorage.setItem('token', token);
            sessionStorage.removeItem('token');
          } else {
            sessionStorage.setItem('token', token);
            localStorage.removeItem('token');
          }
          set({ user, token, isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.message ?? 'Login gagal';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      register: async (name, email, password) => {
        set({ isLoading: true, error: null, rememberMe: true });
        try {
          const res = await authApi.register(name, email, password);
          const { user, token } = res.data;
          localStorage.setItem('token', token);
          sessionStorage.removeItem('token');
          set({ user, token, isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.message ?? 'Registrasi gagal';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          set({ user: null, token: null, rememberMe: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, rememberMe: state.rememberMe }),
      storage: {
        getItem: (name) => {
          const localStr = localStorage.getItem(name);
          if (localStr) return JSON.parse(localStr);
          const sessionStr = sessionStorage.getItem(name);
          if (sessionStr) return JSON.parse(sessionStr);
          return null;
        },
        setItem: (name, value) => {
          try {
            const parsed = JSON.parse(value);
            const remember = parsed.state?.rememberMe;
            if (remember) {
              localStorage.setItem(name, value);
              sessionStorage.removeItem(name);
            } else {
              sessionStorage.setItem(name, value);
              localStorage.removeItem(name);
            }
          } catch (e) {
            localStorage.setItem(name, value);
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        }
      }
    }
  )
);
