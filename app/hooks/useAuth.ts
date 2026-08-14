import { useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { useToast, ToastType } from './useToast';

export type LoginStep = 'phone' | 'otp' | 'profile';

/**
 * Single Responsibility: Manages multi-step authentication wizard flow and form states.
 * Dependency Inversion: Delegates API calls to authService and toasts to useToast.
 */
export function useAuth() {
  const { login } = useAuthContext();
  const { toast, setToast, triggerToast, dismissToast } = useToast();

  // Wizard steps
  const [step, setStep] = useState<LoginStep>('phone');

  // Form fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Loading state
  const [loading, setLoading] = useState(false);

  // Send OTP (Step 1 -> Step 2)
  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      triggerToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    setLoading(true);

    try {
      const response = await authService.sendOtp(phoneNumber);

      if (response.success) {
        triggerToast(response.message || 'Verification code sent successfully.', 'success');
        setStep('otp');
      } else {
        triggerToast(response.error || response.message || 'Failed to send verification code. Please try again.', 'error');
      }
    } catch {
      triggerToast('Network connection error. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (Step 2 -> Step 3 or Home)
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 4) {
      triggerToast('Please enter the 4-digit verification code.', 'error');
      return;
    }
    setLoading(true);

    try {
      const response = await authService.verifyOtp(phoneNumber, otpCode);

      if (response.success) {
        if (response.isNewUser === false && response.data?.user && response.data?.accessToken) {
          triggerToast('Successfully logged in.', 'success');
          login(response.data.user, response.data.accessToken);
        } else {
          triggerToast('Code verified successfully.', 'success');
          setStep('profile');
        }
      } else {
        triggerToast(response.error || response.message || 'Invalid verification code. Please try again.', 'error');
      }
    } catch {
      triggerToast('Network connection error. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Register Profile (Step 3 -> Home)
  const handleRegisterProfile = async () => {
    if (!name.trim()) {
      triggerToast('Please enter your full name.', 'error');
      return;
    }
    setLoading(true);

    try {
      const response = await authService.registerProfile({
        phone: phoneNumber,
        name: name.trim(),
        dob: dob.trim() || undefined,
        referralCode: referralCode.trim() || undefined,
      });

      if (response.success && response.data?.user && response.data?.accessToken) {
        triggerToast('Profile completed successfully. Welcome!', 'success');
        login(response.data.user, response.data.accessToken);
      } else {
        triggerToast(response.error || response.message || 'Failed to create profile. Please try again.', 'error');
      }
    } catch {
      triggerToast('Network connection error. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    phoneNumber,
    setPhoneNumber,
    otpCode,
    setOtpCode,
    name,
    setName,
    dob,
    setDob,
    referralCode,
    setReferralCode,
    loading,
    toast,
    setToast,
    triggerToast,
    dismissToast,
    handleSendOtp,
    handleVerifyOtp,
    handleRegisterProfile,
  };
}

export type { ToastType };
