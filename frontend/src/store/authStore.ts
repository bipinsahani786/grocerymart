import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useTenantStore } from './tenantStore';

interface User {
  id: number | string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
  role?: string;
  userType?: string;
  store?: {
    id: string;
    name: string;
    address?: string;
  } | null;
  roles?: { id: number; name: string }[];
  permissions?: string[];
  businesses?: any[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true });
      },
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
        // Reset tenant store
        useTenantStore.getState().reset();
      },
    }),
    {
      name: 'grocerymart-auth', // localStorage key
    }
  )
);
