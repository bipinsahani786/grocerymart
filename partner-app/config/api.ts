import Constants from 'expo-constants';

/**
 * Resolves the backend base URL dynamically:
 * - On physical phone with Expo Go: Uses host machine IP (from Expo hostUri)
 * - On Android emulator/web/simulator: Uses local host or 10.0.2.2 fallback
 */
function resolveApiBaseUrl(): string {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const host = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  return `http://${host}:5000`;
}

export const API_CONFIG = {
  BASE_URL: resolveApiBaseUrl(),
  ENDPOINTS: {
    PARTNER: {
      SEND_OTP: '/api/partner/auth/send-otp',
      VERIFY_OTP: '/api/partner/auth/verify-otp',
      PROFILE: '/api/partner/profile',
      UPLOAD: '/api/partner/upload',
    },
    UPLOAD: '/api/upload',
  },
  DEFAULT_TIMEOUT_MS: 15000,
};
