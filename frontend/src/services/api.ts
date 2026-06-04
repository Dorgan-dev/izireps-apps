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

// ─── Auth Internal (Owner & Kasir) ───────────────────────────────────────────

export const authApi = {
  /** Unified login — backend cek users dulu, fallback ke customers */
  login: async (email: string, password: string) => {
    return api.post<LoginResponse>('/login', { email, password });
  },

  /**
   * Unified Google Auth.
   * from_register=false (login page): cari di users/customers, error jika tidak ada.
   * from_register=true  (register page): buat customer baru jika belum ada.
   */
  loginWithGoogle: async (access_token: string, from_register = false) => {
    return api.post<GoogleAuthResponse>('/auth/google', { access_token, from_register });
  },

  logout: () => api.post('/auth/logout'),
  me: () => api.get<ApiResponse<User>>('/auth/me'),
};

// ─── Auth Customer (hanya register email/password) ───────────────────────────────
export interface GoogleAuthResponse {
  already_registered: boolean;
  user: LoginResponse['user'];
  token: string;
}

export const customerAuthApi = {
  register: async (name: string, email: string, password: string) => {
    return api.post<LoginResponse>('/customer-auth/register', { name, email, password });
  },

  login: async (email: string, password: string) => {
    return api.post<LoginResponse>('/customer-auth/login', { email, password });
  },

  /** from_register=true → backend menandai already_registered jika akun sudah ada */
  loginWithGoogle: async (access_token: string, from_register = false) => {
    return api.post<GoogleAuthResponse>('/customer-auth/google', { access_token, from_register });
  },

  logout: () => api.post('/customer-auth/logout'),
  me: () => api.get<ApiResponse<User>>('/customer-auth/me'),
  publicRegister: (data: { name: string; phone: string; email?: string }) =>
    api.post('customer-auth/register', data),
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
  schedule: (id: number, date: string) =>
    api.get(`/public/devices/${id}/schedule`, { params: { date } }),
  publicList: () => api.get('/public/devices'),
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

  reject: (id: number, reason: string) =>
    api.patch(`/bookings/${id}/reject`, { reason }),

  cancel: (id: number, reason: string) =>
    api.patch(`/bookings/${id}/cancel`, { reason }),

  refund: (id: number, data: { reason: string; refund_method: string }) =>
    api.post<ApiResponse<any>>(`/bookings/${id}/refund`, data),
  changeDevice: (id: number, deviceId: number) =>
    api.patch(`/bookings/${id}/change-device`, { device_id: deviceId }),
  publicCreate: (data: FormData) =>
    api.post('/public/bookings', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const sessionsApi = {
  list: (params?: object) => api.get('/sessions', { params }),
  active: () => api.get<ApiResponse<PlaySession[]>>('/sessions/active'),

  show: (id: number) => api.get<ApiResponse<PlaySession>>(`/sessions/${id}`),

  start: (data: { device_id: number; customer_id?: number; booking_id?: number }) =>
    api.post<ApiResponse<PlaySession>>('/sessions', data),

  end: (id: number) => api.patch<ApiResponse<PlaySession>>(`/sessions/${id}/end`),
  startWalkIn: (data: {
    device_id: number
    session_type: 'per_jam' | 'bebas'
    duration_minutes?: number
    customer?: { name?: string; phone?: string }
    fnb_items?: { fnb_item_id: number; quantity: number }[]
  }) => api.post('/sessions/start-walkin', data),
  startFromBooking: (bookingId: number) =>
    api.post(`/sessions/start-booking/${bookingId}`, { booking_id: bookingId }),
  addFnb: (sessionId: number, items: { fnb_item_id: number; quantity: number }[]) =>
    api.post(`/sessions/${sessionId}/add-fnb`, { items }),
  extend: (sessionId: number, additionalMinutes: number) =>
    api.post(`/sessions/${sessionId}/extend`, { additional_minutes: additionalMinutes }),
  checkout: (sessionId: number, paymentMethod: string, amountPaid: number) =>
    api.post(`/sessions/${sessionId}/checkout`, {
      payment_method: paymentMethod,
      amount_paid: amountPaid,
    }),
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
  deleteItem: (id: number) => api.delete(`/fnb-items/${id}`),
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionsApi = {
  create: (data: {
    session_id: number;
    items: { fnb_item_id: number; quantity: number }[];
    payment_method: string;
    amount_paid: number;
  }) => api.post<ApiResponse<Transaction>>(`/sessions/${data.session_id}/checkout`, data),

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

