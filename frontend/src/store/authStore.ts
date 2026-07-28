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
  pendingLogoutReason: string | null;
  setAuth: (user: User, token: string) => void;
  updateUser: (user: Partial<User>) => void;
  triggerForcedLogout: (reason: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      pendingLogoutReason: null,
      setAuth: (user, token) => {
        localStorage.setItem('auth_token', token);
        set({ user, token, isAuthenticated: true, pendingLogoutReason: null });
      },
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
      triggerForcedLogout: (reason) => set((state) => ({ 
        pendingLogoutReason: state.pendingLogoutReason || reason 
      })),
      logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false, pendingLogoutReason: null });
        // Reset tenant store
        useTenantStore.getState().reset();
      },
    }),
    {
      name: 'grocerymart-auth', // localStorage key
    }
  )
);
