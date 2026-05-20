import api from '../lib/axios';
import type {
  LoginResponse,
  User,
  Device,
  DeviceRate,
  Customer,
  Booking,
  PlaySession,
  FnbCategory,
  FnbItem,
  Transaction,
  PaginatedResponse,
  ApiResponse,
} from '../types';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  // SEBELUMNYA: api.post<ApiResponse<LoginResponse>>(...)
  // UBAH MENJADI: Langsung gunakan LoginResponse tanpa dibungkus ApiResponse
  login: async (email: string, password: string) => {
    await api.get('../sanctum/csrf-cookie');
    return api.post<LoginResponse>('/auth/login', { email, password });
  },

  logout: () => api.post('/auth/logout'),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
};

// ─── Devices ──────────────────────────────────────────────────────────────────

export const devicesApi = {
  list: () => api.get<ApiResponse<Device[]>>('/devices'),

  show: (id: number) => api.get<ApiResponse<Device>>(`/devices/${id}`),

  create: (data: Partial<Device>) => api.post<ApiResponse<Device>>('/devices', data),

  update: (id: number, data: Partial<Device>) =>
    api.put<ApiResponse<Device>>(`/devices/${id}`, data),

  updateStatus: (id: number, status: Device['status'], note?: string) =>
    api.patch(`/devices/${id}/status`, { status, note }),

  logs: (id: number) => api.get<ApiResponse<any[]>>(`/devices/${id}/logs`),

  rates: (id: number) => api.get<ApiResponse<DeviceRate[]>>(`/devices/${id}/rates`),

  setRate: (id: number, data: Partial<DeviceRate>) =>
    api.post<ApiResponse<DeviceRate>>(`/devices/${id}/rates`, data),
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const customersApi = {
  list: (params?: { search?: string; page?: number }) =>
    api.get<PaginatedResponse<Customer>>('/customers', { params }),

  show: (id: number) => api.get<ApiResponse<Customer>>(`/customers/${id}`),

  create: (data: Partial<Customer>) => api.post<ApiResponse<Customer>>('/customers', data),

  update: (id: number, data: Partial<Customer>) =>
    api.put<ApiResponse<Customer>>(`/customers/${id}`, data),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookingsApi = {
  list: (params?: { status?: string; date?: string; page?: number }) =>
    api.get<PaginatedResponse<Booking>>('/bookings', { params }),

  show: (id: number) => api.get<ApiResponse<Booking>>(`/bookings/${id}`),

  create: (data: Partial<Booking>) => api.post<ApiResponse<Booking>>('/bookings', data),

  confirm: (id: number) => api.patch(`/bookings/${id}/confirm`),

  reject: (id: number, cancel_reason: string) =>
    api.patch(`/bookings/${id}/reject`, { cancel_reason }),

  cancel: (id: number, cancel_reason: string) =>
    api.patch(`/bookings/${id}/cancel`, { cancel_reason }),

  refund: (id: number, data: { reason: string; refund_method: string }) =>
    api.post<ApiResponse<any>>(`/bookings/${id}/refund`, data),
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const sessionsApi = {
  active: () => api.get<ApiResponse<PlaySession[]>>('/sessions/active'),

  show: (id: number) => api.get<ApiResponse<PlaySession>>(`/sessions/${id}`),

  start: (data: { device_id: number; customer_id?: number; booking_id?: number }) =>
    api.post<ApiResponse<PlaySession>>('/sessions', data),

  end: (id: number) => api.patch<ApiResponse<PlaySession>>(`/sessions/${id}/end`),
};

// ─── FnB ─────────────────────────────────────────────────────────────────────

export const fnbApi = {
  categories: () => api.get<ApiResponse<FnbCategory[]>>('/fnb-categories'),

  items: (params?: { category_id?: number; search?: string }) =>
    api.get<ApiResponse<FnbItem[]>>('/fnb-items', { params }),

  createCategory: (data: Partial<FnbCategory>) =>
    api.post<ApiResponse<FnbCategory>>('/fnb-categories', data),

  updateCategory: (id: number, data: Partial<FnbCategory>) =>
    api.put<ApiResponse<FnbCategory>>(`/fnb-categories/${id}`, data),

  createItem: (data: Partial<FnbItem>) =>
    api.post<ApiResponse<FnbItem>>('/fnb-items', data),

  updateItem: (id: number, data: Partial<FnbItem>) =>
    api.put<ApiResponse<FnbItem>>(`/fnb-items/${id}`, data),

  updateStock: (id: number, stock: number) =>
    api.patch(`/fnb-items/${id}/stock`, { stock }),
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionsApi = {
  create: (data: {
    session_id: number;
    items: { fnb_item_id: number; quantity: number }[];
    payment_method: string;
    amount_paid: number;
  }) => api.post<ApiResponse<Transaction>>('/transactions', data),

  show: (id: number) => api.get<ApiResponse<Transaction>>(`/transactions/${id}`),

  list: (params?: { date?: string; cashier_id?: number; page?: number }) =>
    api.get<PaginatedResponse<Transaction>>('/transactions', { params }),
};

// ─── Users (Owner only) ───────────────────────────────────────────────────────

export const usersApi = {
  list: () => api.get<ApiResponse<User[]>>('/users'),

  create: (data: Partial<User> & { password: string }) =>
    api.post<ApiResponse<User>>('/users', data),

  update: (id: number, data: Partial<User> & { password?: string }) =>
    api.put<ApiResponse<User>>(`/users/${id}`, data),

  toggleActive: (id: number) => api.patch(`/users/${id}/toggle-active`),

  delete: (id: number) => api.delete(`/users/${id}`),
};

// ─── Reports (Owner only) ────────────────────────────────────────────────────

export const reportsApi = {
  summary: (params: { from: string; to: string }) =>
    api.get('/reports/summary', { params }),

  revenue: (params: { from: string; to: string; group_by?: 'day' | 'week' | 'month' }) =>
    api.get('/reports/revenue', { params }),

  devices: (params: { from: string; to: string }) =>
    api.get('/reports/devices', { params }),

  export: (type: 'excel' | 'pdf', params: { from: string; to: string }) =>
    api.get(`/reports/export/${type}`, { params, responseType: 'blob' }),
};
