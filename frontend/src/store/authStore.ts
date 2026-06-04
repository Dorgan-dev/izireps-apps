import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '../types/index';
import { authApi, customerAuthApi } from '../services/api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  rememberMe: boolean;
  isAuthenticated: boolean;

  /** Unified login — satu fungsi untuk semua role */
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;

  /**
   * Unified Google Auth.
   * @param fromRegister true  = dipanggil dari halaman Register (bisa buat customer baru)
   *                     false = dipanggil dari halaman Login (hanya login, tidak register)
   * @returns { alreadyRegistered } — true jika akun sudah ada saat from halaman Register
   */
  loginWithGoogle: (
    accessToken: string,
    rememberMe?: boolean,
    fromRegister?: boolean
  ) => Promise<{ alreadyRegistered: boolean }>;

  /** Register pelanggan baru via email/password */
  register: (name: string, email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      error: null,
      isLoading: false,
      rememberMe: false,
      isAuthenticated: false,

      // ── Unified Login (email/password) ──────────────────────────────────
      login: async (email, password, rememberMe = false) => {
        set({ isLoading: true, error: null, rememberMe, isAuthenticated: true });
        try {
          const res = await authApi.login(email, password);
          const { user, token } = res.data;
          set({ user, token, isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.message ?? 'Login gagal';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      // ── Unified Google Auth ──────────────────────────────────────────────
      loginWithGoogle: async (accessToken, rememberMe = false, fromRegister = false) => {
        set({ isLoading: true, error: null, rememberMe: fromRegister ? true : rememberMe, isAuthenticated: true });
        try {
          const res = await authApi.loginWithGoogle(accessToken, fromRegister);
          const { already_registered, user, token } = res.data;
          // Simpan ke state (token sudah ada, siap dipakai untuk "Lanjutkan")
          set({ user, token, isLoading: false });

          return { alreadyRegistered: already_registered };
        } catch (err: any) {
          const message = err.response?.data?.message ?? 'Google Auth gagal';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      // ── Register pelanggan (email/password) ──────────────────────────────
      register: async (name, email, password) => {
        set({ isLoading: true, error: null, rememberMe: true, isAuthenticated: true });
        try {
          const res = await customerAuthApi.register(name, email, password);
          const { user, token } = res.data;
          set({ user, token, isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.message ?? 'Registrasi gagal';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      // ── Logout ───────────────────────────────────────────────────────────
      logout: async () => {
        try {
          // Endpoint /auth/logout sekarang unified — berlaku untuk semua token
          await authApi.logout();
        } catch {
          // Tetap bersihkan state meskipun request gagal
        } finally {
          set({ user: null, token: null, rememberMe: false, isAuthenticated: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      /**
       * Hanya persistkan field yang diperlukan.
       * axios.ts membaca token dari storage ini (key 'auth-storage').
       */
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        rememberMe: state.rememberMe,
      }),
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
            // 1. Ubah objek value menjadi string JSON yang valid untuk disimpan
            const stringifiedValue = JSON.stringify(value);

            // 2. Ambil nilai rememberMe langsung dari objek 'value' asli (bukan dari string hasil parse)
            const remember = value.state?.rememberMe;

            if (remember) {
              localStorage.setItem(name, stringifiedValue);
              sessionStorage.removeItem(name);
            } else {
              sessionStorage.setItem(name, stringifiedValue);
              localStorage.removeItem(name);
            }
          } catch {
            // Fallback jika terjadi error saat stringify
            localStorage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
          sessionStorage.removeItem(name);
        },
      },
    }
  )
);
