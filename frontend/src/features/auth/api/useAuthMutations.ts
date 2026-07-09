import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import type { LoginParams, RegisterParams, VerifyRegisterOtpParams } from '@/services/auth.service';

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: LoginParams) => authService.login(data),
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterParams) => authService.register(data),
  });
};

export const useVerifyRegisterOtp = () => {
  return useMutation({
    mutationFn: (data: VerifyRegisterOtpParams) => authService.verifyRegisterOtp(data),
  });
};
