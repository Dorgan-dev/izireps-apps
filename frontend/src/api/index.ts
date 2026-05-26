import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      sessionStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
}

// ─── Devices ──────────────────────────────────────────────────────────────────
export const deviceApi = {
  list: () => api.get('/devices'),
  publicList: () => api.get('/public/devices'),
  show: (id: number) => api.get(`/devices/${id}`),
  create: (data: object) => api.post('/devices', data),
  update: (id: number, data: object) => api.put(`/devices/${id}`, data),
  updateStatus: (id: number, status: string, note?: string) =>
    api.patch(`/devices/${id}/status`, { status, note }),
  logs: (id: number) => api.get(`/devices/${id}/logs`),
  schedule: (id: number, date: string) =>
    api.get(`/public/devices/${id}/schedule`, { params: { date } }),
}

// ─── Sessions ─────────────────────────────────────────────────────────────────
export const sessionApi = {
  list: (params?: object) => api.get('/sessions', { params }),
  show: (id: number) => api.get(`/sessions/${id}`),
  startWalkIn: (data: {
    device_id: number
    session_type: 'per_jam' | 'bebas'
    duration_minutes?: number
    customer?: { name?: string; phone?: string }
    fnb_items?: { fnb_item_id: number; quantity: number }[]
  }) => api.post('/sessions/start-walkin', data),
  startFromBooking: (bookingId: number) =>
    api.post('/sessions/0/start-booking', { booking_id: bookingId }),
  addFnb: (sessionId: number, items: { fnb_item_id: number; quantity: number }[]) =>
    api.post(`/sessions/${sessionId}/add-fnb`, { items }),
  extend: (sessionId: number, additionalMinutes: number) =>
    api.post(`/sessions/${sessionId}/extend`, { additional_minutes: additionalMinutes }),
  checkout: (sessionId: number, paymentMethod: string, amountPaid: number) =>
    api.post(`/sessions/${sessionId}/checkout`, {
      payment_method: paymentMethod,
      amount_paid: amountPaid,
    }),
}

// ─── Bookings ─────────────────────────────────────────────────────────────────
export const bookingApi = {
  list: (params?: object) => api.get('/bookings', { params }),
  show: (id: number) => api.get(`/bookings/${id}`),
  confirm: (id: number) => api.patch(`/bookings/${id}/confirm`),
  reject: (id: number, reason: string) => api.patch(`/bookings/${id}/reject`, { reason }),
  changeDevice: (id: number, deviceId: number) =>
    api.patch(`/bookings/${id}/change-device`, { device_id: deviceId }),
  refund: (id: number, reason: string, refundMethod: string) =>
    api.post(`/bookings/${id}/refund`, { reason, refund_method: refundMethod }),
}

// ─── F&B ──────────────────────────────────────────────────────────────────────
export const fnbApi = {
  categories: () => api.get('/fnb-categories'),
  items: (params?: object) => api.get('/fnb-items', { params }),
  createItem: (data: object) => api.post('/fnb-items', data),
  updateItem: (id: number, data: object) => api.put(`/fnb-items/${id}`, data),
  deleteItem: (id: number) => api.delete(`/fnb-items/${id}`),
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export const transactionApi = {
  list: (params?: object) => api.get('/transactions', { params }),
  show: (id: number) => api.get(`/transactions/${id}`),
}