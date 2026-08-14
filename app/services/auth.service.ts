import { apiClient, ApiResponse } from './apiClient';
import { API_CONFIG } from '../config/api';

export interface SendOtpPayload {
  phone: string;
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface RegisterProfilePayload {
  phone: string;
  name: string;
  dob?: string;
  referralCode?: string;
}

export interface UpdateProfilePayload {
  name: string;
  email?: string;
  dob?: string;
}

/**
 * Single Responsibility: Manages all authentication network interactions.
 */
export class AuthService {
  async sendOtp(phone: string): Promise<ApiResponse> {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, { phone });
  }

  async verifyOtp(phone: string, otp: string): Promise<ApiResponse> {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP, { phone, otp });
  }

  async registerProfile(payload: RegisterProfilePayload): Promise<ApiResponse> {
    return apiClient.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER_PROFILE, payload);
  }

  async getProfile(token: string): Promise<ApiResponse> {
    return apiClient.get(API_CONFIG.ENDPOINTS.AUTH.GET_PROFILE, { token });
  }

  async updateProfile(token: string, payload: UpdateProfilePayload): Promise<ApiResponse> {
    return apiClient.patch(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, payload, { token });
  }
}

export const authService = new AuthService();
