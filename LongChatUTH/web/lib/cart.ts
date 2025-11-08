// lib/cart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: number;
  name: string;
  price: number; // giá 1 đơn vị
  unit?: string; // ví dụ: Hộp / Vỉ
  image?: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  inc: (id: number, delta?: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (base, qty = 1) => {
        const items = [...get().items];
        const idx = items.findIndex((i) => i.id === base.id);
        if (idx > -1) {
          items[idx].qty += qty;
        } else {
          items.push({ ...base, qty });
        }
        set({ items });
      },
      setQty: (id, qty) => {
        const items = get().items.map((i) => (i.id === id ? { ...i, qty } : i));
        set({ items });
      },
      inc: (id, delta = 1) => {
        const items = get().items.map((i) =>
          i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
        );
        set({ items });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((s, i) => s + i.qty, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    { name: "lc-cart" }
  )
);

// helper format
export const money = (v: number) => (v || 0).toLocaleString("vi-VN") + "đ";
