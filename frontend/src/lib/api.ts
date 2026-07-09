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

// Response interceptor to handle 401 Unauthenticated errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Do not force logout/redirect if the 401 came from the login endpoint itself
      const isAuthRequest = error.config?.url?.includes('/auth/');
      if (!isAuthRequest) {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
