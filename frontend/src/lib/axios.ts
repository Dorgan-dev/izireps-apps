import axios from 'axios';

/**
 * Axios instance terpusat untuk IZIREPS API.
 *
 * - baseURL '/api' akan di-proxy oleh Vite ke http://localhost:8000/api
 *   sehingga tidak ada masalah CORS saat development.
 * - Interceptor otomatis menyisipkan Bearer Token dari localStorage.
 */
const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Diperlukan untuk Laravel Sanctum cookie-based auth
});

// ── Request Interceptor ──────────────────────────────────────────────────────
// Tambahkan Authorization header jika token tersedia di localStorage atau sessionStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────────────────────
// Handle error 401 (Unauthenticated) → hapus token dan redirect ke login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // Redirect ke halaman login jika bukan sudah di sana
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;

