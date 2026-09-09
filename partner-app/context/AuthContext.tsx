import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_RIDER, RiderProfile } from '../constants/mockData';
import { partnerAuthService, VerifyOtpResponseData } from '../services/partnerAuth.service';
import { ApiResponse } from '../services/apiClient';

export interface PartnerKycData {
  name?: string;
  address: string;
  pincode: string;
  city: string;
  aadhaarNumber: string;
  emergencyContact: string;
  bloodGroup: string;
  dlNumber: string;
  dlExpiry: string;
  rcNumber: string;
  vehicleModel: string;
  vehicleType?: 'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE' | string;
  insuranceNumber?: string;
  vehiclePhotoUri?: string;
  profilePhotoUri?: string;
  bankHolderName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  panNumber: string;
  allocatedHub: string;
  riderId?: string;
}

interface AuthContextType {
  user: RiderProfile | null;
  deliveryPartner: any | null;
  token: string | null;
  isLoading: boolean;
  isKycCompleted: boolean;
  sendOtp: (phone: string, authMode?: 'LOGIN' | 'REGISTER') => Promise<ApiResponse>;
  loginWithPhone: (
    phone: string,
    otp: string,
    authMode?: 'LOGIN' | 'REGISTER',
    vehicleType?: 'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE',
    name?: string
  ) => Promise<{ success: boolean; isKycCompleted: boolean; isNewUser: boolean; message?: string }>;
  completeKyc: (kycData: Partial<PartnerKycData>) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<RiderProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = '@grocerymart_partner_user';
const TOKEN_STORAGE_KEY = '@grocerymart_partner_token';
const PARTNER_STORAGE_KEY = '@grocerymart_partner_profile';
const KYC_STORAGE_KEY = '@grocerymart_partner_kyc';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<RiderProfile | null>(null);
  const [deliveryPartner, setDeliveryPartner] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isKycCompleted, setIsKycCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      const storedToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      const storedPartner = await AsyncStorage.getItem(PARTNER_STORAGE_KEY);
      const kycStored = await AsyncStorage.getItem(KYC_STORAGE_KEY);

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      if (storedToken) {
        setToken(storedToken);
      }
      if (storedPartner) {
        setDeliveryPartner(JSON.parse(storedPartner));
      }
      setIsKycCompleted(kycStored === 'true');
    } catch (error) {
      console.error('Error loading partner session:', error);
      setUser(null);
      setToken(null);
      setIsKycCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Request OTP from the backend
   */
  const sendOtp = async (phone: string, authMode: 'LOGIN' | 'REGISTER' = 'LOGIN'): Promise<ApiResponse> => {
    return await partnerAuthService.sendOtp(phone, authMode);
  };

  /**
   * Verify OTP with the backend and set active session
   */
  const loginWithPhone = async (
    phone: string,
    otp: string,
    authMode: 'LOGIN' | 'REGISTER' = 'LOGIN',
    vehicleType: 'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE' = 'EV_BIKE',
    name?: string
  ): Promise<{ success: boolean; isKycCompleted: boolean; isNewUser: boolean; message?: string }> => {
    try {
      const response = await partnerAuthService.verifyOtp({
        phone,
        otp,
        authMode,
        vehicleType,
        name,
      });

      if (!response.success || !response.data) {
        return {
          success: false,
          isKycCompleted: false,
          isNewUser: false,
          message: response.error || response.message || 'Invalid OTP code. Please check and try again.',
        };
      }

      const resData: VerifyOtpResponseData = response.data;
      const verifiedToken = resData.token || resData.accessToken;

      const profile: RiderProfile = {
        ...MOCK_RIDER,
        id: resData.user.id,
        name: resData.user.name || name || 'Delivery Captain',
        phone: resData.user.phone || phone,
        vehicleType: (resData.deliveryPartner?.vehicleType as any) || vehicleType,
        vehicleNumber: resData.deliveryPartner?.rcNumber || MOCK_RIDER.vehicleNumber,
        status: (resData.deliveryPartner?.isOnline ? 'ON_DUTY' : 'OFF_DUTY') as any,
        rating: resData.deliveryPartner?.rating || 5.0,
        totalDeliveries: resData.deliveryPartner?.totalDeliveries || 0,
      };

      setUser(profile);
      setToken(verifiedToken);
      setDeliveryPartner(resData.deliveryPartner);
      setIsKycCompleted(Boolean(resData.isKycCompleted));

      // Persist to AsyncStorage
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      await AsyncStorage.setItem(TOKEN_STORAGE_KEY, verifiedToken);
      await AsyncStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(resData.deliveryPartner));
      await AsyncStorage.setItem(KYC_STORAGE_KEY, resData.isKycCompleted ? 'true' : 'false');

      return {
        success: true,
        isKycCompleted: Boolean(resData.isKycCompleted),
        isNewUser: Boolean(resData.isNewUser),
        message: response.message,
      };
    } catch (err: any) {
      console.error('[loginWithPhone error]', err);
      return {
        success: false,
        isKycCompleted: false,
        isNewUser: false,
        message: err.message || 'Authentication error',
      };
    }
  };

  const completeKyc = async (kycData: Partial<PartnerKycData>): Promise<{ success: boolean; message?: string }> => {
    if (token) {
      const res = await partnerAuthService.updateProfile(kycData, token);
      if (!res.success) {
        throw new Error(res.error || res.message || 'Failed to save KYC to backend. Please check inputs and try again.');
      }
      if (res.data) {
        setDeliveryPartner(res.data);
        await AsyncStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(res.data));
      }
    }

    if (user) {
      const updatedUser: RiderProfile = {
        ...user,
        vehicleNumber: kycData.rcNumber || user.vehicleNumber,
        name: kycData.name || kycData.bankHolderName || user.name,
      };
      setUser(updatedUser);
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    }

    setIsKycCompleted(true);
    await AsyncStorage.setItem(KYC_STORAGE_KEY, 'true');
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    setDeliveryPartner(null);
    setIsKycCompleted(false);
    await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
    await AsyncStorage.removeItem(PARTNER_STORAGE_KEY);
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
        deliveryPartner,
        token,
        isLoading,
        isKycCompleted,
        sendOtp,
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
