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
  token: string | null;           // Access token
  refreshToken: string | null;    // Refresh token (stored for auto-refresh)
  isAuthenticated: boolean;
  pendingLogoutReason: string | null;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  updateUser: (user: Partial<User>) => void;
  triggerForcedLogout: (reason: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      pendingLogoutReason: null,

      // ✅ FIX: Removed duplicate localStorage.setItem — Zustand persist handles storage
      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken: refreshToken || null,
          isAuthenticated: true,
          pendingLogoutReason: null,
        });
      },

      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),

      triggerForcedLogout: (reason) =>
        set((state) => ({
          pendingLogoutReason: state.pendingLogoutReason || reason,
        })),

      logout: () => {
        // ✅ Clean up any legacy keys from old implementation
        localStorage.removeItem('auth_token');
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          pendingLogoutReason: null,
        });
        // Reset tenant store
        useTenantStore.getState().reset();
      },
    }),
    {
      name: 'grocerymart-auth', // localStorage key managed by Zustand persist
      // Only persist essential fields (don't persist pendingLogoutReason)
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

