import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar as RNStatusBar,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '../context/AuthContext';
import { Colors } from '../constants/theme';
import { validatePhoneNumber, validateOtp } from '../utils/validation';
import tw from 'twrnc';

import {
  WelcomeLanding,
  AuthHeader,
  PhoneInputSection,
  OtpInputSection,
  AuthSubmitButton,
} from '../components/auth';

type ViewMode = 'WELCOME' | 'PHONE_AUTH';
type AuthMode = 'LOGIN' | 'REGISTER';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { sendOtp, loginWithPhone, checkUser } = useAuthContext();

  const [viewMode, setViewMode] = useState<ViewMode>('WELCOME');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');

  // Input states
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showRegisterPrompt, setShowRegisterPrompt] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Refs for 4 OTP inputs
  const otpRef0 = useRef<TextInput>(null);
  const otpRef1 = useRef<TextInput>(null);
  const otpRef2 = useRef<TextInput>(null);
  const otpRef3 = useRef<TextInput>(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3];

  // Resend cooldown timer effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Real-time existence check: if in REGISTER mode and 10 digits entered, check if user exists BEFORE sending OTP
  useEffect(() => {
    if (authMode !== 'REGISTER' || phone.length !== 10 || otpSent) return;

    const validation = validatePhoneNumber(phone);
    if (!validation.isValid) return;

    let isMounted = true;
    checkUser(validation.cleanValue)
      .then((checkResult) => {
        if (!isMounted) return;
        if (checkResult.success && checkResult.data?.exists && checkResult.data?.canLogin) {
          setError(
            `This mobile number (+91 ${validation.cleanValue}) is already registered. Please sign in instead.`
          );
          setShowLoginPrompt(true);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [phone, authMode, otpSent]);

  // Auto-dismiss Toast notifications after 5 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  useEffect(() => {
    if (!infoMessage) return;
    const timer = setTimeout(() => setInfoMessage(''), 5000);
    return () => clearTimeout(timer);
  }, [infoMessage]);

  const handleOtpChange = (value: string, index: number) => {
    const cleanValue = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanValue;
    setOtpDigits(newDigits);
    setError('');

    // Auto-focus next box if digit entered
    if (cleanValue && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleSendOtp = async () => {
    const validation = validatePhoneNumber(phone);
    if (!validation.isValid) {
      setError(validation.error || 'Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');
    setInfoMessage('');
    setShowRegisterPrompt(false);
    setShowLoginPrompt(false);

    // Strict Pre-Check BEFORE sending OTP when in REGISTER mode
    if (authMode === 'REGISTER') {
      try {
        const checkResult = await checkUser(validation.cleanValue);
        if (checkResult.success && checkResult.data?.exists && checkResult.data?.canLogin) {
          setLoading(false);
          setError(
            `This mobile number (+91 ${validation.cleanValue}) is already registered as a delivery partner. Please sign in instead.`
          );
          setShowLoginPrompt(true);
          return; // Strictly stop here: DO NOT send OTP!
        }
      } catch {
        // Fallback to server response if network check fails
      }
    }

    try {
      const response = await sendOtp(validation.cleanValue, authMode);
      if (response.success) {
        setOtpSent(true);
        setInfoMessage(response.message || `OTP sent to +91 ${validation.cleanValue}`);
        setOtpDigits(['', '', '', '']);
        setResendCooldown(30);
        setTimeout(() => {
          otpRef0.current?.focus();
        }, 200);
      } else {
        const errMsg =
          response.error ||
          response.message ||
          'Failed to send OTP. Please verify your number and try again.';
        setError(errMsg);

        // Smart Prompt Handlers
        if (
          errMsg.toLowerCase().includes('no delivery partner account found') ||
          errMsg.toLowerCase().includes('not found') ||
          errMsg.toLowerCase().includes('sign up')
        ) {
          setShowRegisterPrompt(true);
        } else if (
          errMsg.toLowerCase().includes('already exists') ||
          errMsg.toLowerCase().includes('already registered')
        ) {
          setShowLoginPrompt(true);
        }
      }
    } catch {
      setError(
        'Unable to connect to server. Please ensure the backend is running and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = async () => {
    const phoneVal = validatePhoneNumber(phone);
    if (!phoneVal.isValid) {
      setError(phoneVal.error || 'Invalid mobile number');
      return;
    }

    const fullOtp = otpDigits.join('');
    const otpVal = validateOtp(fullOtp);
    if (!otpVal.isValid) {
      setError(otpVal.error || 'Please enter the complete 4-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await loginWithPhone(
        phoneVal.cleanValue,
        otpVal.cleanValue,
        authMode,
        'EV_BIKE'
      );

      if (result.success) {
        if (result.isKycCompleted) {
          router.replace('/home');
        } else {
          router.replace('/onboarding');
        }
      } else {
        setError(
          result.message || 'Invalid OTP code. Please check the code and try again.'
        );
        setOtpDigits(['', '', '', '']);
        setTimeout(() => {
          otpRef0.current?.focus();
        }, 150);
      }
    } catch {
      setError('Authentication failed. Please check network connection and try again.');
      setOtpDigits(['', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setOtpSent(false);
    setError('');
    setInfoMessage('');
    setViewMode('PHONE_AUTH');
  };

  const handleBack = () => {
    if (otpSent) {
      setOtpSent(false);
      setError('');
      setInfoMessage('');
    } else {
      setViewMode('WELCOME');
    }
  };

  const handleEditPhone = () => {
    setOtpSent(false);
    setResendCooldown(0);
    setError('');
    setInfoMessage('');
  };

  const handleSwitchToRegister = () => {
    setAuthMode('REGISTER');
    setShowRegisterPrompt(false);
    setError('');
    setInfoMessage('Switched to Sign Up. Tap "Verify Number" to register!');
  };

  const handleSwitchToLogin = () => {
    setAuthMode('LOGIN');
    setShowLoginPrompt(false);
    setError('');
    setInfoMessage('Switched to Sign In. Tap "Verify Number" to log in!');
  };

  // ================= 1. BRAND WELCOME LANDING SCREEN =================
  if (viewMode === 'WELCOME') {
    return <WelcomeLanding insets={insets} onSelectMode={handleSelectMode} />;
  }

  // ================= 2. PHONE AUTH / OTP SCREEN =================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`flex-1`, { backgroundColor: Colors.surface }]}
    >
      <RNStatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <StatusBar style="dark" />

      {/* Top Header */}
      <AuthHeader
        title={authMode === 'LOGIN' ? 'Partner Login' : 'Partner Registration'}
        insets={insets}
        onBack={handleBack}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          tw`px-5 pt-6`,
          { paddingBottom: insets.bottom + 90 },
        ]}
      >
        {/* Title & Description */}
        <View style={tw`mb-6`}>
          <Text style={[tw`text-2xl font-black`, { color: Colors.text }]}>
            {authMode === 'LOGIN' ? 'Welcome Back Captain!' : 'Partner Mobile Registration'}
          </Text>
          <Text style={[tw`text-xs mt-1.5 leading-5`, { color: Colors.textSecondary }]}>
            {otpSent
              ? `We have sent a 4-digit code to +91 ${phone}`
              : authMode === 'LOGIN'
                ? 'Enter your registered phone number to sign in and continue earning.'
                : 'Enter your 10-digit phone number to register as a delivery partner.'}
          </Text>
        </View>

        {/* 1. Mobile Phone Input Section */}
        <PhoneInputSection
          phone={phone}
          setPhone={setPhone}
          otpSent={otpSent}
          loading={loading}
          error={error}
          setError={setError}
          onEditPhone={handleEditPhone}
          showRegisterPrompt={showRegisterPrompt}
          onSwitchToRegister={handleSwitchToRegister}
          showLoginPrompt={showLoginPrompt}
          onSwitchToLogin={handleSwitchToLogin}
        />

        {/* 2. OTP Input Section (only visible once OTP sent) */}
        {otpSent && (
          <OtpInputSection
            otpDigits={otpDigits}
            otpRefs={otpRefs}
            handleOtpChange={handleOtpChange}
            handleOtpKeyPress={handleOtpKeyPress}
            handleResendOtp={handleSendOtp}
            resendCooldown={resendCooldown}
            loading={loading}
            error={error}
            infoMessage={infoMessage}
          />
        )}
      </ScrollView>

      {/* 3. Pinned Bottom Action Button */}
      <AuthSubmitButton
        insets={insets}
        otpSent={otpSent}
        authMode={authMode}
        loading={loading}
        onSubmit={!otpSent ? handleSendOtp : handleContinue}
      />
    </KeyboardAvoidingView>
  );
}
