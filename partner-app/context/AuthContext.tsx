import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_RIDER, RiderProfile } from '../constants/mockData';

interface AuthContextType {
  user: RiderProfile | null;
  isLoading: boolean;
  loginWithPhone: (phone: string, otp: string, vehicleType?: 'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE') => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<RiderProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@grocerymart_partner_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RiderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Default to logged-in mock partner for seamless experience, or null
        setUser(MOCK_RIDER);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(MOCK_RIDER));
      }
    } catch (error) {
      console.error('Error loading partner session:', error);
      setUser(MOCK_RIDER);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, otp: string, vehicleType?: 'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE'): Promise<boolean> => {
    // In demo/mock mode, any 4-digit or 6-digit OTP works
    const loggedInUser: RiderProfile = {
      ...MOCK_RIDER,
      phone: phone || MOCK_RIDER.phone,
      vehicleType: vehicleType || MOCK_RIDER.vehicleType,
    };
    setUser(loggedInUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
    return true;
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateProfile = (updates: Partial<RiderProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, loginWithPhone, logout, updateProfile }}>
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
