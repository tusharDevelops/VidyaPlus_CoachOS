import { create } from 'zustand';
import api from '../lib/api';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthState {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  user: (() => {
    const token = localStorage.getItem('admin_access_token');
    const user = localStorage.getItem('admin_user');
    if (token && user) {
      try { return JSON.parse(user); } catch { return null; }
    }
    return null;
  })(),
  isAuthenticated: !!localStorage.getItem('admin_access_token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const sanitizedEmail = email.trim().toLowerCase();
      const { data } = await api.post('/auth/super-admin/login', { email: sanitizedEmail, password });
      const { accessToken, refreshToken, user } = data.data;

      localStorage.setItem('admin_access_token', accessToken);
      localStorage.setItem('admin_refresh_token', refreshToken);
      localStorage.setItem('admin_user', JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed. Please try again.';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch { /* ignore */ }
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
