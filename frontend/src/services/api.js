import api from "../lib/axios";

// ─── Auth Internal (Owner & Kasir) ───────────────────────────────────────────

export const authApi = {
  /** Unified login — backend cek users dulu, fallback ke customers */
  login: async (email, password) => {
    return api.post("/login", { email, password });
  },

  /**
   * Unified Google Auth.
   * from_register=false (login page): cari di users/customers, error jika tidak ada.
   * from_register=true  (register page): buat customer baru jika belum ada.
   */
  loginWithGoogle: async (access_token, from_register = false) => {
    return api.post("/auth/google", { access_token, from_register });
  },

  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

// ─── Auth Customer (hanya register email/password) ───────────────────────────────

export const customerAuthApi = {
  register: async (name, email, password) => {
    return api.post("/customer-auth/register", { name, email, password });
  },

  login: async (email, password) => {
    return api.post("/customer-auth/login", { email, password });
  },

  /** from_register=true → backend menandai already_registered jika akun sudah ada */
  loginWithGoogle: async (access_token, from_register = false) => {
    return api.post("/customer-auth/google", { access_token, from_register });
  },

  logout: () => api.post("/customer-auth/logout"),
  me: () => api.get("/customer-auth/me"),
  publicRegister: (data) => api.post("customer-auth/register", data),
};

// ─── Devices ──────────────────────────────────────────────────────────────────

export const devicesApi = {
  list: () => api.get("/devices"),
  delete: (id) => api.delete(`/devices/${id}`),

  show: (id) => api.get(`/devices/${id}`),

  create: (data) => api.post("/devices", data),

  update: (id, data) => api.put(`/devices/${id}`, data),

  updateStatus: (id, status, note) =>
    api.patch(`/devices/${id}/status`, { status, note }),

  logs: (id) => api.get(`/devices/${id}/logs`),

  rates: (id) => api.get(`/devices/${id}/rates`),

  updateRate: (rateId, data) => api.put(`/rates/${rateId}`, data),

  setRate: (id, data) => api.post(`/devices/${id}/rates`, data),
  schedule: (id, date) =>
    api.get(`/public/devices/${id}/schedule`, { params: { date } }),
  publicList: () => api.get("/public/devices"),
};

// ─── Customers ────────────────────────────────────────────────────────────────

export const customersApi = {
  list: (params) => api.get("/customers", { params }),

  show: (id) => api.get(`/customers/${id}`),

  create: (data) => api.post("/customers", data),

  update: (id, data) => api.put(`/customers/${id}`, data),
};

// ─── Bookings ─────────────────────────────────────────────────────────────────

export const bookingsApi = {
  list: (params) => api.get("/bookings", { params }),

  show: (id) => api.get(`/bookings/${id}`),

  create: (data) => api.post("/bookings", data),

  confirm: (id) => api.patch(`/bookings/${id}/confirm`),

  reject: (id, reason) => api.patch(`/bookings/${id}/reject`, { reason }),

  cancel: (id, reason) => api.patch(`/bookings/${id}/cancel`, { reason }),

  refund: (id, data) => api.post(`/bookings/${id}/refund`, data),
  changeDevice: (id, deviceId) =>
    api.patch(`/bookings/${id}/change-device`, { device_id: deviceId }),
  publicCreate: (data) =>
    api.post("/public/bookings", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /** Hitung estimasi biaya & DP, dapatkan QRIS string — tanpa simpan ke DB */
  publicCalculate: (data) => api.post("/public/bookings/calculate", data),
};

// ─── Sessions ─────────────────────────────────────────────────────────────────

export const sessionsApi = {
  list: (params) => api.get("/sessions", { params }),
  active: () => api.get("/sessions/active"),

  show: (id) => api.get(`/sessions/${id}`),

  start: (data) => api.post("/sessions", data),

  end: (id) => api.patch(`/sessions/${id}/end`),
  startWalkIn: (data) => api.post("/sessions/start-walkin", data),
  startFromBooking: (bookingId) =>
    api.post(`/sessions/start-booking/${bookingId}`, { booking_id: bookingId }),
  addFnb: (sessionId, items) =>
    api.post(`/sessions/${sessionId}/add-fnb`, { items }),
  extend: (sessionId, additionalMinutes) =>
    api.post(`/sessions/${sessionId}/extend`, {
      additional_minutes: additionalMinutes,
    }),
  checkout: (sessionId, paymentMethod, amountPaid) =>
    api.post(`/sessions/${sessionId}/checkout`, {
      payment_method: paymentMethod,
      amount_paid: amountPaid,
    }),
};

// ─── FnB ─────────────────────────────────────────────────────────────────────

export const fnbApi = {
  categories: () => api.get("/fnb-categories"),

  items: (params) => api.get("/fnb-items", { params }),

  createCategory: (data) => api.post("/fnb-categories", data),

  updateCategory: (id, data) => api.put(`/fnb-categories/${id}`, data),

  createItem: (data) => api.post("/fnb-items", data),

  updateItem: (id, data) => api.put(`/fnb-items/${id}`, data),

  updateStock: (id, stock) => api.patch(`/fnb-items/${id}/stock`, { stock }),
  deleteItem: (id) => api.delete(`/fnb-items/${id}`),
};

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactionsApi = {
  create: (data) => api.post(`/sessions/${data.session_id}/checkout`, data),

  show: (id) => api.get(`/transactions/${id}`),

  list: (params) => api.get("/transactions", { params }),
};

// ─── Users (Owner only) ───────────────────────────────────────────────────────

export const usersApi = {
  list: () => api.get("/users"),

  create: (data) => api.post("/users", data),

  update: (id, data) => api.put(`/users/${id}`, data),

  toggleActive: (id) => api.patch(`/users/${id}/toggle-active`),

  delete: (id) => api.delete(`/users/${id}`),
};

// ─── Reports (Owner only) ────────────────────────────────────────────────────

export const reportsApi = {
  summary: (params) => api.get("/reports/summary", { params }),

  revenue: (params) => api.get("/reports/revenue", { params }),

  devices: (params) => api.get("/reports/devices", { params }),

  export: (type, params) =>
    api.get(`/reports/export/${type}`, { params, responseType: "blob" }),
};

// ─── Settings (Owner: read/write | Public: read-only) ────────────────────────

export const settingsApi = {
  /** GET /settings — owner: semua setting termasuk qris_string */
  getAll: () => api.get("/settings"),

  /** PUT /settings — owner: update satu atau beberapa setting */
  update: (data) => api.put("/settings", data),

  /** GET /public/settings — informasi publik (nama toko) */
  public: () => api.get("/public/settings"),
};
