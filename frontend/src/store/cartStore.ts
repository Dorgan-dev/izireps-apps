import { create } from 'zustand';
import type { FnbItem } from '../types';

export interface CartItem {
  fnb_item_id: number;
  name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: FnbItem) => void;
  removeItem: (fnb_item_id: number) => void;
  updateQty: (fnb_item_id: number, qty: number) => void;
  clear: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const existing = get().items.find((i) => i.fnb_item_id === item.id);
    if (existing) {
      set({
        items: get().items.map((i) =>
          i.fnb_item_id === item.id
            ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unit_price }
            : i
        ),
      });
    } else {
      set({
        items: [
          ...get().items,
          { fnb_item_id: item.id, name: item.name, unit_price: item.price, quantity: 1, subtotal: item.price },
        ],
      });
    }
  },

  removeItem: (fnb_item_id) =>
    set({ items: get().items.filter((i) => i.fnb_item_id !== fnb_item_id) }),

  updateQty: (fnb_item_id, qty) => {
    if (qty <= 0) {
      get().removeItem(fnb_item_id);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.fnb_item_id === fnb_item_id
          ? { ...i, quantity: qty, subtotal: qty * i.unit_price }
          : i
      ),
    });
  },

  clear: () => set({ items: [] }),

  total: () => get().items.reduce((sum, i) => sum + i.subtotal, 0),
}));
