import { apiClient, ApiResponse } from './apiClient';
import { API_CONFIG } from '../config/api';

export interface VerifyOtpResponseData {
  token: string;
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
  isKycCompleted: boolean;
  user: {
    id: string;
    phone: string;
    name: string;
    email?: string | null;
    avatar?: string | null;
    role: string;
    status: string;
    createdAt?: string | null;
  };
  deliveryPartner: {
    id: string;
    userId: string;
    vehicleType: string;
    kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    isKycCompleted: boolean;
    isOnline: boolean;
    rating: number;
    totalDeliveries: number;
    totalEarnings: number;
    address?: string | null;
    city?: string | null;
    pincode?: string | null;
    rcNumber?: string | null;
    dlNumber?: string | null;
    allocatedHub?: string | null;
    subscriptionPlan?: string | null;
    subscriptionExpiry?: string | null;
    subscriptionStatus?: string | null;
    hasSubscription?: boolean;
    stores?: any[];
  };
}

export class PartnerAuthService {
  /**
   * Check whether partner user exists, is active, and can log in
   */
  async checkUser(phone: string): Promise<ApiResponse<{
    exists: boolean;
    canLogin: boolean;
    name?: string;
    kycStatus?: string;
    isKycCompleted?: boolean;
    message: string;
    suggestion?: string;
  }>> {
    const cleanPhone = phone.replace(/\D/g, '');
    return await apiClient.post(API_CONFIG.ENDPOINTS.PARTNER.LOGIN_CHECK, {
      phone: cleanPhone,
    });
  }

  /**
   * Request a 4-digit OTP for the given mobile number (Login vs Register)
   */
  async sendOtp(phone: string, authMode: 'LOGIN' | 'REGISTER' = 'LOGIN'): Promise<ApiResponse> {
    const cleanPhone = phone.replace(/\D/g, '');
    const endpoint = authMode === 'LOGIN'
      ? API_CONFIG.ENDPOINTS.PARTNER.LOGIN_SEND_OTP
      : API_CONFIG.ENDPOINTS.PARTNER.SEND_OTP;

    return await apiClient.post(endpoint, {
      phone: cleanPhone,
      authMode,
    });
  }

  /**
   * Verify the 4-digit OTP and obtain session tokens + partner profile
   */
  async verifyOtp(params: {
    phone: string;
    otp: string;
    authMode?: 'LOGIN' | 'REGISTER';
    vehicleType?: string;
    name?: string;
  }): Promise<ApiResponse<VerifyOtpResponseData>> {
    const cleanPhone = params.phone.replace(/\D/g, '');
    const cleanOtp = params.otp.trim();
    const endpoint = params.authMode === 'LOGIN'
      ? API_CONFIG.ENDPOINTS.PARTNER.LOGIN_VERIFY_OTP
      : API_CONFIG.ENDPOINTS.PARTNER.VERIFY_OTP;

    return await apiClient.post<VerifyOtpResponseData>(endpoint, {
      phone: cleanPhone,
      otp: cleanOtp,
      authMode: params.authMode || 'LOGIN',
      vehicleType: params.vehicleType,
      name: params.name,
    });
  }

  /**
   * Fetch authenticated partner profile
   */
  async getProfile(token: string): Promise<ApiResponse> {
    return await apiClient.get(API_CONFIG.ENDPOINTS.PARTNER.PROFILE, { token });
  }

  /**
   * Update partner profile
   */
  async updateProfile(data: any, token: string): Promise<ApiResponse> {
    return await apiClient.put(API_CONFIG.ENDPOINTS.PARTNER.PROFILE, data, { token });
  }

  /**
   * Update partner live duty status (online/offline) in backend
   */
  async updateDuty(
    isOnline: boolean,
    coords?: { lat: number; lng: number } | null,
    token?: string | null
  ): Promise<ApiResponse> {
    return await apiClient.put(
      API_CONFIG.ENDPOINTS.PARTNER.DUTY,
      {
        isOnline,
        currentLat: coords?.lat,
        currentLong: coords?.lng,
      },
      { token: token || undefined }
    );
  }

  /**
   * Upload image file (Avatar / Document) to Cloudflare R2
   */
  async uploadImage(uri: string, token?: string | null): Promise<string> {
    try {
      const formData = new FormData();
      const filename = uri.split('/').pop() || `avatar_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1].toLowerCase() : 'jpg';
      const type = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      formData.append('file', {
        uri,
        name: filename,
        type,
      } as any);

      const endpoint = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PARTNER.UPLOAD}`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const resJson = await response.json();
      if (resJson.success && resJson.data?.url) {
        return resJson.data.url;
      }
      return uri; // Return uri as fallback
    } catch (err) {
      console.warn('Image upload to R2 error, using local fallback:', err);
      return uri;
    }
  }

  /**
   * Buy / Activate rider subscription pass later from the app
   */
  async buySubscription(planKey: string, token: string): Promise<ApiResponse> {
    return await apiClient.post('/api/partner/subscription/buy', { planKey }, { token });
  }

  /**
   * Cancel rider subscription
   */
  async cancelSubscription(token: string): Promise<ApiResponse> {
    return await apiClient.post('/api/partner/subscription/cancel', {}, { token });
  }
}

export const partnerAuthService = new PartnerAuthService();
