import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_RIDER, RiderProfile } from '../constants/mockData';

export interface PartnerKycData {
  address: string;
  pincode: string;
  city: string;
  aadhaarNumber: string;
  emergencyContact: string;
  dlNumber: string;
  dlExpiry: string;
  rcNumber: string;
  vehicleModel: string;
  insuranceNumber: string;
  vehiclePhotoUri?: string;
  profilePhotoUri?: string;
  bankHolderName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  panNumber: string;
  allocatedHub: string;
  riderId: string;
}

interface AuthContextType {
  user: RiderProfile | null;
  isLoading: boolean;
  isKycCompleted: boolean;
  loginWithPhone: (phone: string, otp: string, vehicleType?: 'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE', name?: string) => Promise<boolean>;
  completeKyc: (kycData: Partial<PartnerKycData>) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<RiderProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@grocerymart_partner_user';
const KYC_STORAGE_KEY = '@grocerymart_partner_kyc';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RiderProfile | null>(null);
  const [isKycCompleted, setIsKycCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const kycStored = await AsyncStorage.getItem(KYC_STORAGE_KEY);
      if (stored) {
        setUser(JSON.parse(stored));
        setIsKycCompleted(kycStored === 'true');
      } else {
        setUser(null);
        setIsKycCompleted(false);
      }
    } catch (error) {
      console.error('Error loading partner session:', error);
      setUser(null);
      setIsKycCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPhone = async (
    phone: string,
    _otp: string,
    vehicleType?: 'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE',
    name?: string
  ): Promise<boolean> => {
    const loggedInUser: RiderProfile = {
      ...MOCK_RIDER,
      name: name || MOCK_RIDER.name,
      phone: phone || MOCK_RIDER.phone,
      vehicleType: vehicleType || MOCK_RIDER.vehicleType,
    };
    setUser(loggedInUser);
    await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(loggedInUser));
    return true;
  };

  const completeKyc = async (kycData: Partial<PartnerKycData>) => {
    if (user) {
      const updatedUser: RiderProfile = {
        ...user,
        vehicleNumber: kycData.rcNumber || user.vehicleNumber,
        name: kycData.bankHolderName || user.name,
      };
      setUser(updatedUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    }
    setIsKycCompleted(true);
    await AsyncStorage.setItem(KYC_STORAGE_KEY, 'true');
  };

  const logout = async () => {
    setUser(null);
    setIsKycCompleted(false);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    await AsyncStorage.removeItem(KYC_STORAGE_KEY);
  };

  const updateProfile = (updates: Partial<RiderProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isKycCompleted,
        loginWithPhone,
        completeKyc,
        logout,
        updateProfile,
      }}
    >
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
