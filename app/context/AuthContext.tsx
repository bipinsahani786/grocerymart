import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface AuthContextType {
  user: UserType | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (user: UserType, accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: UserType) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted session on startup
  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('@auth_user');
        const storedToken = await AsyncStorage.getItem('@auth_token');
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
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
      await AsyncStorage.setItem('@auth_user', JSON.stringify(userData));
      await AsyncStorage.setItem('@auth_token', token);
      setUser(userData);
      setAccessToken(token);
    } catch (e) {
      console.error('Failed to save auth session on login:', e);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('@auth_user');
      await AsyncStorage.removeItem('@auth_token');
      setUser(null);
      setAccessToken(null);
    } catch (e) {
      console.error('Failed to clear auth session on logout:', e);
    }
  };

  const updateUser = async (userData: UserType) => {
    try {
      await AsyncStorage.setItem('@auth_user', JSON.stringify(userData));
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
