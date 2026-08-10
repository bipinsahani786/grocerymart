import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const debuggerHost = Constants.expoConfig?.hostUri;
const localhost = debuggerHost ? debuggerHost.split(':')[0] : 'localhost';
const API_URL = `http://${localhost}:5000`;

export type LoginStep = 'phone' | 'otp' | 'profile';

export interface ToastType {
  message: string;
  type: 'success' | 'error' | 'info';
}

export function useAuth() {
  const router = useRouter();

  // Wizard steps
  const [step, setStep] = useState<LoginStep>('phone');
  
  // Form fields
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // States
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastType | null>(null);

  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to trigger toast notification
  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (!message) return;
    
    setToast({ message, type });
    
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4000); // Auto-dismiss after 4 seconds
  };

  // Send OTP (Step 1 -> Step 2)
  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      triggerToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await response.json();

      if (response.ok) {
        triggerToast(data.message || 'Verification code sent successfully.', 'success');
        setStep('otp');
      } else {
        triggerToast(data.error || 'Failed to send verification code. Please try again.', 'error');
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
      const response = await fetch(`${API_URL}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp: otpCode }),
      });
      const data = await response.json();

      if (response.ok) {
        if (data.user && data.user.name) {
          triggerToast('Successfully logged in.', 'success');
          router.replace('/home');
        } else {
          triggerToast('Code verified successfully.', 'success');
          setStep('profile');
        }
      } else {
        triggerToast(data.error || 'Invalid verification code. Please try again.', 'error');
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
    if (dob.length !== 10) {
      triggerToast('Please select your date of birth.', 'error');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/otp/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          name: name.trim(),
          dob,
          referralCode: referralCode.trim() || null,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        triggerToast('Account created successfully!', 'success');
        router.replace('/home');
      } else {
        triggerToast(data.message || 'Failed to complete registration. Please try again.', 'error');
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
    handleSendOtp,
    handleVerifyOtp,
    handleRegisterProfile,
  };
}
