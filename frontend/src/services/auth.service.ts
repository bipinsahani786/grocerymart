import api from '@/lib/api';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  name: string;
  email: string;
  password: string;
  userType: string;
}

export interface VerifyRegisterOtpParams {
  email: string;
  otp: string;
}

class AuthService {
  async login(data: LoginParams) {
    const response = await api.post('/auth/login-password', data);
    return response.data;
  }

  async register(data: RegisterParams) {
    const response = await api.post('/auth/register', data);
    return response.data;
  }

  async verifyRegisterOtp(data: VerifyRegisterOtpParams) {
    const response = await api.post('/auth/verify-register-otp', data);
    return response.data;
  }
}

export const authService = new AuthService();
