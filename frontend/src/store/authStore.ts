import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.login(email, password);
          set({ user: response.user, token: response.token, loading: false });
        } catch (error: any) {
          set({ error: error.message || 'Login fehlgeschlagen', loading: false });
          throw error;
        }
      },
      register: async (name: string, email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await authService.register(name, email, password);
          set({ user: response.user, token: response.token, loading: false });
        } catch (error: any) {
          set({ error: error.message || 'Registrierung fehlgeschlagen', loading: false });
          throw error;
        }
      },
      logout: () => {
        set({ user: null, token: null });
      },
      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

