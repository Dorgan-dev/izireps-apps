import { create } from 'zustand';
import type { Device } from '../types';
import { devicesApi } from '../services/api';

interface DeviceState {
  devices: Device[];
  isLoading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
  updateStatus: (id: number, status: Device['status'], note?: string) => Promise<void>;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  isLoading: false,
  error: null,

  fetch: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await devicesApi.list();
      set({ devices: res.data.data, isLoading: false });
    } catch {
      set({ error: 'Gagal memuat data perangkat', isLoading: false });
    }
  },

  updateStatus: async (id, status, note) => {
    await devicesApi.updateStatus(id, status, note);
    set({
      devices: get().devices.map((d) =>
        d.id === id ? { ...d, status } : d
      ),
    });
  },
}));
