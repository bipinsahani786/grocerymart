import Constants from 'expo-constants';

/**
 * Single Responsibility: Centralized API base URL and endpoints resolution.
 */
function resolveApiBaseUrl(): string {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  return `http://${localhost}:5000`;
}

export const API_CONFIG = {
  BASE_URL: resolveApiBaseUrl(),
  ENDPOINTS: {
    AUTH: {
      SEND_OTP: '/api/auth/otp/send',
      VERIFY_OTP: '/api/auth/otp/verify',
      REGISTER_PROFILE: '/api/auth/profile/register',
      GET_PROFILE: '/api/auth/profile',
      UPDATE_PROFILE: '/api/auth/profile',
    },
    PRODUCTS: {
      LIST: '/api/products',
    },
  },
  DEFAULT_TIMEOUT_MS: 15000,
};
