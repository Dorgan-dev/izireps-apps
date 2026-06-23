import axios from "axios";

/**
 * Axios instance terpusat untuk IZIREPS API.
 *
 * - baseURL 'http://localhost:8000/api/' di-proxy Vite ke backend.
 * - Interceptor membaca token dari zustand persist storage ('auth-storage')
 *   sehingga satu sumber kebenaran — tidak ada key 'token' terpisah.
 */
const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/**
 * Baca token dari zustand persist storage.
 * Zustand menyimpan { state: { user, token, rememberMe }, version } di key 'auth-storage'.
 * Bergantung pada rememberMe, data ada di localStorage atau sessionStorage.
 */
function getStoredToken() {
  try {
    const raw =
      localStorage.getItem("auth-storage") ||
      sessionStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

// ── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// Handle 401 → bersihkan SEMUA auth storage dan redirect ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth-storage");
      sessionStorage.removeItem("auth-storage");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
