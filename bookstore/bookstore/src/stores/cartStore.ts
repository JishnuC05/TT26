import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Book, CartItem } from "@/types";
import { getAuthHeaders } from "./authStore";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  addItem: (book: Book, quantity?: number) => Promise<void>;
  removeItem: (bookId: string) => Promise<void>;
  updateQuantity: (bookId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: () => number;
  totalPrice: () => number;
  fetchCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      addItem: async (book, quantity = 1) => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/cart`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ bookId: book.id, quantity }),
          });

          const data = await response.json();

          if (data.success) {
            set({
              items: data.data.items,
              loading: false,
            });
          } else {
            set({ error: data.error || 'Failed to add item to cart', loading: false });
            throw new Error(data.error);
          }
        } catch (error) {
          set({ error: 'Failed to add item to cart', loading: false });
          throw error;
        }
      },

      removeItem: async (bookId) => {
        set({ loading: true, error: null });
        try {
          // Find the cart item ID first
          const cartItem = get().items.find(item => item.book.id === bookId);
          if (!cartItem) {
            set({ loading: false });
            return;
          }

          const response = await fetch(`${API_BASE}/cart/${cartItem.id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          const data = await response.json();

          if (data.success) {
            set({
              items: data.data.items,
              loading: false,
            });
          } else {
            set({ error: data.error || 'Failed to remove item', loading: false });
            throw new Error(data.error);
          }
        } catch (error) {
          set({ error: 'Failed to remove item', loading: false });
          throw error;
        }
      },

      updateQuantity: async (bookId, quantity) => {
        if (quantity <= 0) {
          await get().removeItem(bookId);
          return;
        }

        set({ loading: true, error: null });
        try {
          // Find the cart item ID first
          const cartItem = get().items.find(item => item.book.id === bookId);
          if (!cartItem) {
            set({ loading: false });
            return;
          }

          const response = await fetch(`${API_BASE}/cart/${cartItem.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...getAuthHeaders(),
            },
            body: JSON.stringify({ quantity }),
          });

          const data = await response.json();

          if (data.success) {
            set({
              items: data.data.items,
              loading: false,
            });
          } else {
            set({ error: data.error || 'Failed to update quantity', loading: false });
            throw new Error(data.error);
          }
        } catch (error) {
          set({ error: 'Failed to update quantity', loading: false });
          throw error;
        }
      },

      clearCart: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/cart`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
          });

          const data = await response.json();

          if (data.success) {
            set({
              items: data.data.items,
              loading: false,
            });
          } else {
            set({ error: data.error || 'Failed to clear cart', loading: false });
            throw new Error(data.error);
          }
        } catch (error) {
          set({ error: 'Failed to clear cart', loading: false });
          throw error;
        }
      },

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      totalPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + item.book.price * item.quantity,
          0
        );
      },

      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const response = await fetch(`${API_BASE}/cart`, {
            headers: getAuthHeaders(),
          });

          const data = await response.json();

          if (data.success) {
            set({
              items: data.data.items,
              loading: false,
            });
          } else {
            set({ error: data.error || 'Failed to fetch cart', loading: false });
          }
        } catch (error) {
          set({ error: 'Network error. Please try again.', loading: false });
        }
      },
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

