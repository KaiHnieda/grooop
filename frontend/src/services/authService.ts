import api from './api';
import type { AuthResponse } from '@groop/shared';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<{ success: boolean; data?: AuthResponse; error?: string }>('/auth/login', { email, password });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Login fehlgeschlagen');
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<{ success: boolean; data?: AuthResponse; error?: string }>('/auth/register', { name, email, password });
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      throw new Error(response.data.error || 'Registrierung fehlgeschlagen');
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};


