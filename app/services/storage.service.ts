import AsyncStorage from '@react-native-async-storage/async-storage';

export interface IStorageService {
  getItem<T = string>(key: string): Promise<T | null>;
  setItem(key: string, value: any): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Single Responsibility & Dependency Inversion:
 * Decouples state stores from the low-level AsyncStorage library.
 */
export class AsyncStorageService implements IStorageService {
  async getItem<T = string>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.error(`[StorageService] Failed to get item for key "${key}":`, error);
      return null;
    }
  }

  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(key, stringValue);
    } catch (error) {
      console.error(`[StorageService] Failed to set item for key "${key}":`, error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`[StorageService] Failed to remove item for key "${key}":`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('[StorageService] Failed to clear storage:', error);
    }
  }
}

export const STORAGE_KEYS = {
  AUTH_USER: '@auth_user',
  AUTH_TOKEN: '@auth_token',
};

export const storageService = new AsyncStorageService();
