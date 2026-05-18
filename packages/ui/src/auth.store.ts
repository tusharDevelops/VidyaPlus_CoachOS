import { create } from 'zustand';
import type { AxiosInstance } from 'axios';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  role: string;
  photoUrl?: string;
  avatar?: string;
  instituteId?: string;
  instituteName?: string;
  permissions?: string[];
  dob?: string;
  address?: string;
  studentProfile?: {
    id: string;
    studentCode: string;
    parentName: string;
    parentPhone: string;
    enrolledAt: string;
  };
  institute?: {
    id: string;
    name: string;
    subdomain: string;
    status: string;
    setupCompleted: boolean;
  };
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAuth: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: (api: AxiosInstance) => Promise<void>;
  fetchUser: (api: AxiosInstance) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  hasPermission: (permission: string) => boolean;
}

/**
 * Shared auth store factory.
 * Each app creates its own store instance but uses the same shape.
 */
export function createAuthStore() {
  return create<AuthState>((set, get) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,

    setAuth: (user, accessToken, refreshToken) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, isLoading: false, error: null });
    },

    logout: async (api) => {
      try {
        await api.post('/auth/logout');
      } catch {
        // Ignore errors on logout
      }
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    },

    fetchUser: async (api) => {
      try {
        const { data } = await api.get('/auth/me');
        set({ user: data.data.user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
      }
    },

    clearError: () => set({ error: null }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error, isLoading: false }),

    hasPermission: (permission: string): boolean => {
      const user = get().user;
      if (!user) return false;
      if (user.role === 'owner') return true;
      return user.permissions?.includes(permission) || false;
    },
  }));
}
