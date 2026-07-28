import axios from 'axios';
import { useTenantStore } from '@/store/tenantStore';
import { useAuthStore } from '@/store/authStore';

// Create an Axios instance pointing to our Node API
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Inject the Active Business ID as a Tenant Header
  const activeBusiness = useTenantStore.getState().activeBusiness;
  if (activeBusiness && activeBusiness.id) {
    if (typeof config.headers.set === 'function') {
      config.headers.set('X-Tenant-ID', String(activeBusiness.id));
    } else {
      config.headers['X-Tenant-ID'] = String(activeBusiness.id);
    }
  }
  
  return config;
});

import { toast } from 'sonner';

// Response interceptor to handle 401 & 403 forced logout errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const isAuthLoginRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/send-otp') || error.config?.url?.includes('/auth/verify-otp');
      const data = error.response.data;

      // Handle 401 Unauthenticated or 403 Suspended/Store Inactive Forced Logout
      if ((status === 401 || status === 403) && !isAuthLoginRequest) {
        const isForcedLogout = 
          status === 401 || 
          data?.code === 'ACCOUNT_SUSPENDED' || 
          data?.code === 'STORE_INACTIVE' || 
          data?.code === 'ACCOUNT_DELETED' ||
          data?.message?.toLowerCase().includes('suspended') ||
          data?.message?.toLowerCase().includes('inactive') ||
          data?.message?.toLowerCase().includes('revoked');

        if (isForcedLogout) {
          const reasonMessage = data?.message || 'Your session has been terminated by administrator.';
          toast.error(reasonMessage, { id: 'forced-logout-toast', duration: 15000 });
          useAuthStore.getState().triggerForcedLogout(reasonMessage);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
