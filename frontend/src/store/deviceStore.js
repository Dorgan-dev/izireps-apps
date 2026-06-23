import { create } from "zustand";
import { devicesApi } from "../services/api";

export const useDeviceStore = create((set, get) => ({
  devices: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await devicesApi.list();
      set({ devices: res.data.data, isLoading: false });
    } catch {
      set({ error: "Gagal memuat data perangkat", isLoading: false });
    }
  },

  updateStatus: async (id, status, note) => {
    await devicesApi.updateStatus(id, status, note);
    set({
      devices: get().devices.map((d) => (d.id === id ? { ...d, status } : d)),
    });
  },
}));
