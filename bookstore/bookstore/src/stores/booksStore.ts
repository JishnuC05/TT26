import { create } from "zustand";
import type { Book, Category, Order } from "@/types";
import { getAuthHeaders } from "./authStore";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

type SortOption = "default" | "price-asc" | "price-desc" | "rating" | "title";

interface BooksState {
  books: Book[];
  orders: Order[];
  searchQuery: string;
  selectedCategory: Category | "All";
  sortBy: SortOption;
  loading: boolean;
  error: string | null;
  setSearchQuery: (q: string) => void;
  setCategory: (cat: Category | "All") => void;
  setSortBy: (sort: SortOption) => void;
  fetchBooks: () => Promise<void>;
  getBook: (id: string) => Book | undefined;
  addBook: (book: Book) => Promise<void>;
  updateBook: (book: Book) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  filteredBooks: () => Book[];
}

export const useBooksStore = create<BooksState>()((set, get) => ({
  books: [],
  orders: [],
  searchQuery: "",
  selectedCategory: "All",
  sortBy: "default",
  loading: false,
  error: null,

  setSearchQuery: (q) => set({ searchQuery: q }),
  setCategory: (cat) => set({ selectedCategory: cat }),
  setSortBy: (sort) => set({ sortBy: sort }),

  fetchBooks: async () => {
    set({ loading: true, error: null });
    try {
      const params = new URLSearchParams();
      if (get().searchQuery) params.append('search', get().searchQuery);
      if (get().selectedCategory !== "All") params.append('category', get().selectedCategory);
      if (get().sortBy !== "default") params.append('sort', get().sortBy);

      const response = await fetch(`${API_BASE}/books?${params}`);
      const data = await response.json();

      if (data.success) {
        set({ books: data.data.books, loading: false });
      } else {
        set({ error: data.error || 'Failed to fetch books', loading: false });
      }
    } catch (error) {
      set({ error: 'Network error. Please try again.', loading: false });
    }
  },

  getBook: (id) => {
    return get().books.find((book) => book.id === id);
  },

  addBook: async (book) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/books`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(book),
      });

      const data = await response.json();

      if (data.success) {
        set((state) => ({
          books: [...state.books, data.data],
          loading: false,
        }));
      } else {
        set({ error: data.error || 'Failed to add book', loading: false });
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: 'Failed to add book', loading: false });
      throw error;
    }
  },

  updateBook: async (book) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/books/${book.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(book),
      });

      const data = await response.json();

      if (data.success) {
        set((state) => ({
          books: state.books.map((b) => (b.id === book.id ? data.data : b)),
          loading: false,
        }));
      } else {
        set({ error: data.error || 'Failed to update book', loading: false });
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: 'Failed to update book', loading: false });
      throw error;
    }
  },

  deleteBook: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/books/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        set((state) => ({
          books: state.books.filter((b) => b.id !== id),
          loading: false,
        }));
      } else {
        set({ error: data.error || 'Failed to delete book', loading: false });
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: 'Failed to delete book', loading: false });
      throw error;
    }
  },

  fetchOrders: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.success) {
        set({ orders: data.data, loading: false });
      } else {
        set({ error: data.error || 'Failed to fetch orders', loading: false });
      }
    } catch (error) {
      set({ error: 'Network error. Please try again.', loading: false });
    }
  },

  updateOrderStatus: async (orderId, status) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (data.success) {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId ? data.data : order
          ),
          loading: false,
        }));
      } else {
        set({ error: data.error || 'Failed to update order', loading: false });
        throw new Error(data.error);
      }
    } catch (error) {
      set({ error: 'Failed to update order', loading: false });
      throw error;
    }
  },

  filteredBooks: () => {
    // Since we're now fetching filtered data from API, just return current books
    return get().books;
  },
}));
