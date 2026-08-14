import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService, STORAGE_KEYS } from '../services/storage.service';

export interface UserType {
  id: string;
  phone: string;
  name: string | null;
  dob: string | null;
  email: string | null;
  avatar: string | null;
  role: string;
  loyaltyPoints?: number;
  walletBalance?: number;
  totalOrders?: number;
}

export interface AuthContextType {
  user: UserType | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (user: UserType, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Single Responsibility: Manages application-wide user authentication state.
 * Dependency Inversion: Uses storageService abstraction instead of direct AsyncStorage dependency.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await storageService.getItem<UserType>(STORAGE_KEYS.AUTH_USER);
        const storedToken = await storageService.getItem<string>(STORAGE_KEYS.AUTH_TOKEN);
        if (storedUser && storedToken) {
          setUser(storedUser);
          setAccessToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to load auth session:', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadSession();
  }, []);

  const login = async (userData: UserType, token: string) => {
    try {
      await storageService.setItem(STORAGE_KEYS.AUTH_USER, userData);
      await storageService.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      setUser(userData);
      setAccessToken(token);
    } catch (e) {
      console.error('Failed to save auth session on login:', e);
    }
  };

  const logout = async () => {
    try {
      await storageService.removeItem(STORAGE_KEYS.AUTH_USER);
      await storageService.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setUser(null);
      setAccessToken(null);
    } catch (e) {
      console.error('Failed to clear auth session on logout:', e);
    }
  };

  const updateUser = async (userData: UserType) => {
    try {
      await storageService.setItem(STORAGE_KEYS.AUTH_USER, userData);
      setUser(userData);
    } catch (e) {
      console.error('Failed to update auth session:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
