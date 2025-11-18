"use client";

import { create } from "zustand";

export type CartPeek = {
  id: number;
  name: string;
  price: number;
  priceText?: string;
  unit?: string;
  image?: string;
  qty?: number;
};

type CartUiState = {
  drawerOpen: boolean;
  peek?: CartPeek;
  peekVisible: boolean;
  showPeek: (peek: CartPeek) => void;
  hidePeek: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

export const useCartUi = create<CartUiState>((set) => ({
  drawerOpen: false,
  peek: undefined,
  peekVisible: false,
  showPeek: (peek) => set({ peek, peekVisible: true }),
  hidePeek: () => set({ peekVisible: false }),
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
}));