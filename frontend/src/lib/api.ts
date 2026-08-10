import axios from 'axios';
import { useTenantStore } from '@/store/tenantStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

// Create an Axios instance pointing to our Node API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// ── Request Interceptor ─────────────────────────────────────────────────────
// ✅ FIX: Read token from Zustand store directly (source of truth), not localStorage
api.interceptors.request.use((config) => {
  // Read token from Zustand store (which is persisted to localStorage via persist middleware)
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Inject the Active Business ID as a Tenant Header for multi-tenant routing
  const activeBusiness = useTenantStore.getState().activeBusiness;
  if (activeBusiness && activeBusiness.id) {
    config.headers['X-Tenant-ID'] = String(activeBusiness.id);
  }

  return config;
});

// ── Response Interceptor ────────────────────────────────────────────────────
// Handle 401 & 403 forced logout scenarios with proper error codes
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const code = data?.code;
      const requestUrl = error.config?.url || '';

      // Skip auth-page requests to avoid logout loop
      const isAuthRequest =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/otp') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/refresh');

      if (!isAuthRequest) {
        // ── Handle Token Expired — attempt refresh ──
        if (status === 401 && code === 'TOKEN_EXPIRED') {
          try {
            const refreshToken = useAuthStore.getState().refreshToken;
            if (refreshToken) {
              const { data: refreshData } = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/refresh`,
                { refreshToken }
              );
              const { accessToken, refreshToken: newRefreshToken } = refreshData.data;
              const currentUser = useAuthStore.getState().user;
              if (currentUser) {
                useAuthStore.getState().setAuth(currentUser, accessToken, newRefreshToken);
              }
              // Retry the original request with new token
              error.config.headers.Authorization = `Bearer ${accessToken}`;
              return api(error.config);
            }
          } catch (_refreshError) {
            // Refresh failed — force logout
            console.warn('[API] Token refresh failed. Logging out.');
          }
        }

        // ── Handle Forced Logout Scenarios ──
        const isForcedLogout =
          code === 'NO_TOKEN' ||
          code === 'TOKEN_EXPIRED' ||
          code === 'INVALID_TOKEN' ||
          code === 'AUTH_FAILED' ||
          code === 'ACCOUNT_DELETED' ||
          code === 'ACCOUNT_SUSPENDED' ||
          code === 'STORE_INACTIVE';

        if (isForcedLogout) {
          const reasonMessage =
            data?.message || 'Your session has expired. Please login again.';
          toast.error(reasonMessage, {
            id: 'forced-logout-toast',
            duration: 15000,
          });
          useAuthStore.getState().triggerForcedLogout(reasonMessage);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
