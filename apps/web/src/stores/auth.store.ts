import { create } from 'zustand';
import api from '../lib/api';

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  photoUrl?: string;
  avatar?: string;
  instituteId?: string;
  instituteName?: string;
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  superAdminLogin: (email: string, password: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<{ message: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  registerSendOtp: (email: string) => Promise<void>;
  registerVerifyOtpOnly: (email: string, otp: string) => Promise<void>;
  registerVerify: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  verifyResetOtp: (email: string, otp: string) => Promise<void>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken, user } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  superAdminLogin: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/super-admin/login', { email, password });
      const { accessToken, refreshToken, user } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Login failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  sendOtp: async (phone) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/otp/send', { phone });
      set({ isLoading: false });
      return data.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to send OTP';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  verifyOtp: async (phone, otp) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/otp/verify', { phone, otp });
      const { accessToken, refreshToken, user } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'OTP verification failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  registerSendOtp: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/public/register/send-otp', { email });
      set({ isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to send OTP';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  registerVerifyOtpOnly: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/public/register/verify-otp-only', { email, otp });
      set({ isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Invalid OTP';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  registerVerify: async (registrationData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/public/register/verify', registrationData);
      const { accessToken, refreshToken, user } = data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.error || 'Registration failed';
      set({ error: message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors on logout
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  fetchUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.data.user, isAuthenticated: true });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set((state) => ({
        user: state.user ? { ...state.user, permissions: data.data.user.permissions } : null
      }));
    } catch {
      // fail silently without disrupting UI
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/forgot-password', { email });
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to send OTP', isLoading: false });
      throw err;
    }
  },

  verifyResetOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/verify-reset-otp', { email, otp });
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Invalid OTP', isLoading: false });
      throw err;
    }
  },

  resetPassword: async (email, otp, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      set({ isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to reset password', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  hasPermission: (permission: string): boolean => {
    const user = get().user;
    if (!user) return false;
    if (user.role === 'owner') return true;
    return user.permissions?.includes(permission) || false;
  },
}));
