import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RiderProfile } from '../constants/mockData';
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
  checkUser: (phone: string) => Promise<ApiResponse<any>>;
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
  refreshProfile: () => Promise<void>;
  buySubscription: (planKey: string) => Promise<{ success: boolean; message?: string }>;
  cancelSubscription: () => Promise<{ success: boolean; message?: string }>;
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
        const parsed = JSON.parse(storedUser);
        // Clear out any old mock user leftover in local storage
        if (parsed.name === 'Rajesh Kumar Verma' || parsed.id === 'PRT-88492') {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
          await AsyncStorage.removeItem(PARTNER_STORAGE_KEY);
          await AsyncStorage.removeItem(KYC_STORAGE_KEY);
          setUser(null);
          setToken(null);
          setDeliveryPartner(null);
          setIsKycCompleted(false);
        } else {
          setUser(parsed);
        }
      }
      if (storedToken) {
        setToken(storedToken);
        // Silently sync real profile and wallet data from DB
        partnerAuthService.getProfile(storedToken).then((res) => {
          if (res.success && res.data) {
            const pData = res.data;
            setDeliveryPartner(pData);
            AsyncStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(pData));

            setUser((prev) => {
              const base = prev || {
                id: pData.user?.id || '',
                name: '',
                phone: pData.user?.phone || '',
                email: '',
                avatar: '',
                vehicleType: 'EV_BIKE',
                vehicleNumber: '',
                rating: 5.0,
                totalTrips: 0,
                totalDeliveries: 0,
                acceptanceRate: 100,
                onTimeRate: 100,
                tier: 'Silver',
                joinedDate: 'Recently',
                currentHub: '',
              };
              const fresh: RiderProfile = {
                ...base,
                id: pData.user?.id || base.id,
                name: pData.user?.name || base.name,
                phone: pData.user?.phone || base.phone,
                email: pData.user?.email || base.email,
                avatar: pData.user?.avatar || base.avatar,
                walletBalance: pData.walletBalance ?? pData.user?.walletBalance ?? 0,
                vehicleType: pData.vehicleType || base.vehicleType,
                vehicleNumber: pData.rcNumber || base.vehicleNumber,
                rating: pData.rating || base.rating,
                totalTrips: pData.totalDeliveries || base.totalTrips,
                totalDeliveries: pData.totalDeliveries || base.totalDeliveries,
                currentHub: pData.allocatedHub || base.currentHub,
                subscriptionPlan: pData.subscriptionPlan ?? null,
                subscriptionExpiry: pData.subscriptionExpiry ?? null,
                subscriptionStatus: pData.subscriptionStatus ?? 'NONE',
                hasSubscription: Boolean(pData.hasSubscription),
              };
              AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(fresh));
              return fresh;
            });
          }
        }).catch(() => {});
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
   * Check if partner account exists and is eligible for login
   */
  const checkUser = async (phone: string): Promise<ApiResponse<any>> => {
    return await partnerAuthService.checkUser(phone);
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
        id: resData.user.id,
        name: resData.user.name || name || '',
        phone: resData.user.phone || phone,
        email: resData.user.email || '',
        avatar: resData.user.avatar || '',
        vehicleType: (resData.deliveryPartner?.vehicleType as any) || vehicleType || 'EV_BIKE',
        vehicleNumber: resData.deliveryPartner?.rcNumber || '',
        status: (resData.deliveryPartner?.isOnline ? 'ON_DUTY' : 'OFF_DUTY') as any,
        rating: resData.deliveryPartner?.rating || 5.0,
        totalTrips: resData.deliveryPartner?.totalDeliveries || 0,
        totalDeliveries: resData.deliveryPartner?.totalDeliveries || 0,
        acceptanceRate: 100,
        onTimeRate: 100,
        tier: 'Silver',
        joinedDate: resData.user.createdAt
          ? new Date(resData.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : 'Recently',
        currentHub: resData.deliveryPartner?.allocatedHub || '',
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
    let activeToken = token;
    if (!activeToken) {
      activeToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (activeToken) {
        setToken(activeToken);
      }
    }

    if (!activeToken) {
      throw new Error('Authentication session missing. Please sign in again.');
    }

    const res = await partnerAuthService.updateProfile(kycData, activeToken);
    if (!res.success) {
      throw new Error(res.error || res.message || 'Failed to save KYC to backend. Please check inputs and try again.');
    }

    if (res.data) {
      setDeliveryPartner(res.data);
      await AsyncStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(res.data));
    }

    if (user || res.data?.user) {
      const currentProfile: RiderProfile = user || {
        id: res.data?.user?.id || '',
        name: '',
        phone: res.data?.user?.phone || '',
        email: res.data?.user?.email || '',
        avatar: '',
        vehicleType: (kycData.vehicleType as any) || 'EV_BIKE',
        vehicleNumber: '',
        status: 'OFF_DUTY',
        rating: 5.0,
        totalTrips: 0,
        totalDeliveries: 0,
        acceptanceRate: 100,
        onTimeRate: 100,
        tier: 'Silver',
        joinedDate: 'Recently',
        currentHub: '',
      };

      const updatedUser: RiderProfile = {
        ...currentProfile,
        id: res.data?.user?.id || currentProfile.id,
        name: kycData.name || kycData.bankHolderName || res.data?.user?.name || currentProfile.name,
        vehicleNumber: kycData.rcNumber || res.data?.rcNumber || currentProfile.vehicleNumber,
        avatar: kycData.profilePhotoUri || res.data?.user?.avatar || currentProfile.avatar,
        currentHub: kycData.allocatedHub || res.data?.allocatedHub || currentProfile.currentHub,
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

  const refreshProfile = async () => {
    let activeToken = token;
    if (!activeToken) {
      activeToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (activeToken) setToken(activeToken);
    }
    if (!activeToken) return;

    try {
      const res = await partnerAuthService.getProfile(activeToken);
      if (res.success && res.data) {
        const pData = res.data;
        setDeliveryPartner(pData);
        await AsyncStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(pData));

        const updatedUser: RiderProfile = {
          id: pData.user?.id || pData.userId || user?.id || '',
          name: pData.user?.name || user?.name || '',
          phone: pData.user?.phone || user?.phone || '',
          email: pData.user?.email || user?.email || '',
          avatar: pData.user?.avatar || user?.avatar || '',
          walletBalance: pData.walletBalance ?? pData.user?.walletBalance ?? 0,
          vehicleType: pData.vehicleType || user?.vehicleType || 'EV_BIKE',
          vehicleNumber: pData.rcNumber || user?.vehicleNumber || '',
          status: pData.isOnline ? 'ON_DUTY' : 'OFF_DUTY',
          rating: pData.rating || 5.0,
          totalTrips: pData.totalDeliveries || 0,
          totalDeliveries: pData.totalDeliveries || 0,
          acceptanceRate: 100,
          onTimeRate: 100,
          tier: (pData.totalDeliveries || 0) >= 50 ? 'Platinum Pro' : (pData.totalDeliveries || 0) >= 20 ? 'Gold' : 'Silver',
          joinedDate: pData.user?.createdAt
            ? new Date(pData.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : user?.joinedDate || 'Recently',
          currentHub: pData.allocatedHub || user?.currentHub || '',
          subscriptionPlan: pData.subscriptionPlan ?? null,
          subscriptionExpiry: pData.subscriptionExpiry ?? null,
          subscriptionStatus: pData.subscriptionStatus ?? 'NONE',
          hasSubscription: Boolean(pData.hasSubscription),
        };

        setUser(updatedUser);
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
        setIsKycCompleted(Boolean(pData.isKycCompleted));
        await AsyncStorage.setItem(KYC_STORAGE_KEY, pData.isKycCompleted ? 'true' : 'false');
      }
    } catch (err) {
      console.warn('Failed to refresh partner profile from server:', err);
    }
  };

  const buySubscription = async (planKey: string): Promise<{ success: boolean; message?: string }> => {
    let activeToken = token;
    if (!activeToken) {
      activeToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (activeToken) setToken(activeToken);
    }
    if (!activeToken) {
      return { success: false, message: 'Authentication required' };
    }

    try {
      const res = await partnerAuthService.buySubscription(planKey, activeToken);
      if (res.success) {
        await refreshProfile();
        return { success: true, message: res.message || 'Subscription activated successfully' };
      }
      return { success: false, message: res.error || res.message || 'Failed to activate subscription' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error while buying subscription' };
    }
  };

  const cancelSubscription = async (): Promise<{ success: boolean; message?: string }> => {
    let activeToken = token;
    if (!activeToken) {
      activeToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
      if (activeToken) setToken(activeToken);
    }
    if (!activeToken) {
      return { success: false, message: 'Authentication required' };
    }

    try {
      const res = await partnerAuthService.cancelSubscription(activeToken);
      if (res.success) {
        await refreshProfile();
        return { success: true, message: 'Subscription cancelled successfully' };
      }
      return { success: false, message: res.error || res.message || 'Failed to cancel subscription' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Network error while cancelling subscription' };
    }
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
        checkUser,
        loginWithPhone,
        completeKyc,
        logout,
        updateProfile,
        refreshProfile,
        buySubscription,
        cancelSubscription,
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
