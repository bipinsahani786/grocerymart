import Constants from 'expo-constants';

/**
 * Resolves the backend base URL dynamically for local development, emulators, and devices.
 */
export function getApiBaseUrl(): string {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const host = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
  return `http://${host}:5000`;
}
