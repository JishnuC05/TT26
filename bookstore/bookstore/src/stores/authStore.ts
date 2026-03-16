import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,

      login: async (email, password) => {
        set({ loading: true });
        try {
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (data.success) {
            set({
              user: data.data.user,
              isAuthenticated: true,
              loading: false,
            });
            return { success: true, message: 'Login successful' };
          } else {
            set({ loading: false });
            return { success: false, message: data.error || 'Login failed' };
          }
        } catch (error) {
          set({ loading: false });
          return { success: false, message: 'Network error. Please try again.' };
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
        // Clear token from localStorage
        localStorage.removeItem('auth-storage');
      },

      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password }),
          });

          const data = await response.json();

          if (data.success) {
            set({
              user: data.data.user,
              isAuthenticated: true,
              loading: false,
            });
            return { success: true, message: 'Registration successful' };
          } else {
            set({ loading: false });
            return { success: false, message: data.error || 'Registration failed' };
          }
        } catch (error) {
          set({ loading: false });
          return { success: false, message: 'Network error. Please try again.' };
        }
      },

      checkAuth: async () => {
        const token = getToken();
        if (!token) return;

        try {
          const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (data.success) {
            set({
              user: data.data,
              isAuthenticated: true,
            });
          } else {
            // Token invalid, logout
            get().logout();
          }
        } catch (error) {
          // Network error, keep current state
          console.error('Auth check failed:', error);
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper function to get token
const getToken = () => {
  const authData = localStorage.getItem('auth-storage');
  if (authData) {
    try {
      const parsed = JSON.parse(authData);
      return parsed.state?.token;
    } catch {
      return null;
    }
  }
  return null;
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } as HeadersInit : {} as HeadersInit;
};
