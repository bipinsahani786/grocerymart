import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../context/AuthContext';
import { Colors } from '../constants/theme';
import tw from 'twrnc';

type ViewMode = 'WELCOME' | 'PHONE_AUTH';
type AuthMode = 'LOGIN' | 'REGISTER';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loginWithPhone } = useAuthContext();

  const [viewMode, setViewMode] = useState<ViewMode>('WELCOME');
  const [authMode, setAuthMode] = useState<AuthMode>('LOGIN');

  // Input states
  const [phone, setPhone] = useState('9876543210');
  const [otpDigits, setOtpDigits] = useState(['1', '2', '3', '4']);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs for 4 OTP inputs
  const otpRef0 = useRef<TextInput>(null);
  const otpRef1 = useRef<TextInput>(null);
  const otpRef2 = useRef<TextInput>(null);
  const otpRef3 = useRef<TextInput>(null);
  const otpRefs = [otpRef0, otpRef1, otpRef2, otpRef3];

  const handleOtpChange = (value: string, index: number) => {
    const newDigits = [...otpDigits];
    newDigits[index] = value;
    setOtpDigits(newDigits);
    setError('');

    // Auto-focus next box
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtpDigits(['1', '2', '3', '4']); // Pre-filled for demo ease
  };

  const handleContinue = async () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 4) {
      setError('Please enter the complete 4-digit OTP');
      return;
    }

    setLoading(true);
    try {
      await loginWithPhone(phone, fullOtp, 'EV_BIKE', 'Sahil');
      if (authMode === 'LOGIN') {
        // Direct to Dashboard for Login
        router.replace('/home');
      } else {
        // Direct to KYC onboarding for Registration
        router.push('/onboarding');
      }
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ================= 1. FIRST SCREEN: BRAND WELCOME LANDING =================
  if (viewMode === 'WELCOME') {
    return (
      <View style={tw`flex-1`}>
        <StatusBar style="light" />

        {/* Brand Gradient Background (Same theme as splash) */}
        <LinearGradient
          colors={[Colors.splashGradientStart, Colors.splashGradientEnd]}
          style={[
            tw`flex-1 justify-between relative overflow-hidden`,
            {
              paddingTop: insets.top + 24,
            },
          ]}
        >
          {/* Background Decorative Diagonal Stripes */}
          <View
            style={[
              tw`absolute rounded-3xl opacity-10`,
              {
                top: -100,
                left: -50,
                width: 120,
                height: 500,
                transform: [{ rotate: '-35deg' }],
                backgroundColor: Colors.stripeColor,
              },
            ]}
          />
          <View
            style={[
              tw`absolute rounded-3xl opacity-10`,
              {
                top: -150,
                left: 140,
                width: 80,
                height: 600,
                transform: [{ rotate: '-35deg' }],
                backgroundColor: Colors.stripeColor,
              },
            ]}
          />

          {/* Top & Center Brand Section */}
          <View style={tw`items-center px-6 pt-6`}>
            {/* Circular Logo Container */}
            <View
              style={[
                tw`w-28 h-28 rounded-full justify-center items-center mb-4 p-4 shadow-2xl elevation-8`,
                { backgroundColor: Colors.white },
              ]}
            >
              <Image
                source={require('../assets/images/zytrixon.png')}
                style={tw`w-full h-full -ml-1`}
                resizeMode="contain"
              />
            </View>

            {/* App Title */}
            <Text
              style={[
                tw`text-3xl font-black tracking-widest text-center`,
                {
                  color: Colors.white,
                  textShadowColor: Colors.splashTextShadow,
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 4,
                },
              ]}
            >
              Grocery Mart
            </Text>

            {/* Delivery Partner Badge */}
            <View
              style={[
                tw`flex-row items-center px-3 py-1 rounded-full mt-2.5 mb-2.5 border`,
                {
                  backgroundColor: Colors.primaryBg,
                  borderColor: Colors.primary,
                },
              ]}
            >
              <Ionicons name="bicycle" size={13} color={Colors.primaryDark} style={tw`mr-1.5`} />
              <Text style={[tw`text-[11px] font-black tracking-wider`, { color: Colors.primaryDark }]}>
                DELIVERY PARTNER
              </Text>
            </View>

            <Text
              style={[
                tw`text-xs text-center font-semibold opacity-90 tracking-wide`,
                { color: Colors.primaryBg },
              ]}
            >
              Deliver Groceries
            </Text>
          </View>

          {/* Bottom White Container Sheet with Auth Buttons */}
          <View
            style={[
              tw`rounded-t-3xl p-6 shadow-2xl`,
              {
                backgroundColor: Colors.surface,
                paddingBottom: Math.max(insets.bottom, 16) + 12,
              },
            ]}
          >
            {/* Welcome Text */}
            <View style={tw`mb-5`}>
              <Text style={[tw`text-xl font-black`, { color: Colors.text }]}>
                Partner Portal
              </Text>
              <Text style={[tw`text-xs mt-1 leading-4`, { color: Colors.textSecondary }]}>
                Sign in with your registered phone number or register as a new delivery captain.
              </Text>
            </View>

            {/* Action 1: Sign In with Phone Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setAuthMode('LOGIN');
                setOtpSent(false);
                setError('');
                setViewMode('PHONE_AUTH');
              }}
              style={[
                tw`rounded-2xl py-4 flex-row justify-center items-center shadow-md mb-3`,
                { backgroundColor: Colors.primary },
              ]}
            >
              <Ionicons name="call" size={18} color={Colors.white} style={tw`mr-2`} />
              <Text style={[tw`text-sm font-black tracking-wide`, { color: Colors.white }]}>
                SIGN IN WITH PHONE NUMBER
              </Text>
            </TouchableOpacity>

            {/* Action 2: Sign Up / Register Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                setAuthMode('REGISTER');
                setOtpSent(false);
                setError('');
                setViewMode('PHONE_AUTH');
              }}
              style={[
                tw`rounded-2xl py-3.5 flex-row justify-center items-center border`,
                { backgroundColor: Colors.surfaceLight, borderColor: Colors.border },
              ]}
            >
              <Ionicons name="person-add-outline" size={18} color={Colors.primaryDark} style={tw`mr-2`} />
              <Text style={[tw`text-sm font-black`, { color: Colors.primaryDark }]}>
                SIGN UP / REGISTER AS PARTNER
              </Text>
            </TouchableOpacity>

            {/* Terms info */}
            <Text style={[tw`text-[10px] text-center mt-4`, { color: Colors.textMuted }]}>
              By continuing, you agree to Partner Terms & Conditions
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ================= 2. SIGN IN WITH NUMBER PAGE =================
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`flex-1`, { backgroundColor: Colors.surface }]}
    >
      <StatusBar style="dark" />

      {/* Top Header with Back Arrow */}
      <View
        style={[
          tw`px-4 pb-3 border-b flex-row items-center justify-between`,
          {
            backgroundColor: Colors.surface,
            borderBottomColor: Colors.border,
            paddingTop: insets.top + 8,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => {
            if (otpSent) {
              setOtpSent(false);
            } else {
              setViewMode('WELCOME');
            }
          }}
          style={tw`p-1 -ml-1`}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        <Text style={[tw`text-base font-black`, { color: Colors.text }]}>
          {authMode === 'LOGIN' ? 'Partner Login' : 'Partner Registration'}
        </Text>

        <View style={tw`w-6`} />
      </View>

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

        {/* 1. MOBILE NUMBER INPUT */}
        <View style={[tw`py-3 border-b mb-4`, { borderBottomColor: Colors.border }]}>
          <View style={tw`flex-row justify-between items-center mb-1.5`}>
            <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
              Phone Number
            </Text>
            {otpSent && (
              <TouchableOpacity onPress={() => setOtpSent(false)}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.primaryDark }]}>
                  Edit Number
                </Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={tw`flex-row items-center`}>
            <View style={[tw`px-3 py-1.5 rounded-xl mr-2.5 border`, { backgroundColor: Colors.surfaceLight, borderColor: Colors.border }]}>
              <Text style={[tw`text-sm font-black`, { color: Colors.text }]}>🇮🇳 +91</Text>
            </View>
            <TextInput
              value={phone}
              editable={!otpSent}
              onChangeText={(txt) => {
                setPhone(txt);
                setError('');
              }}
              placeholder="10-digit mobile number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              style={[
                tw`flex-1 text-lg font-bold p-0 tracking-wider`,
                { color: Colors.text, opacity: otpSent ? 0.7 : 1 },
              ]}
            />
            {otpSent && (
              <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
            )}
          </View>
        </View>

        {/* 2. OTP SECTION (Appears ONLY when otpSent is TRUE) */}
        {otpSent && (
          <View style={tw`mb-6 mt-2`}>
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
                Enter 4-Digit OTP
              </Text>
              <TouchableOpacity onPress={() => setOtpDigits(['1', '2', '3', '4'])}>
                <Text style={[tw`text-xs font-black`, { color: Colors.primaryDark }]}>
                  Resend Code
                </Text>
              </TouchableOpacity>
            </View>

            {/* 4 Square PIN Boxes */}
            <View style={tw`flex-row justify-between my-2`}>
              {otpDigits.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={otpRefs[idx]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, idx)}
                  onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  style={[
                    tw`w-16 h-15 rounded-2xl border-2 text-center text-2xl font-black shadow-sm`,
                    {
                      backgroundColor: digit ? Colors.primaryBg : Colors.surfaceLight,
                      borderColor: digit ? Colors.primary : Colors.border,
                      color: Colors.text,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[tw`text-[10px]`, { color: Colors.textSecondary }]}>
              Demo code: 1234 auto-filled. Code valid for 5 minutes.
            </Text>
          </View>
        )}

        {/* Error message */}
        {error ? (
          <Text style={[tw`text-xs text-center mb-4`, { color: Colors.danger }]}>
            {error}
          </Text>
        ) : null}
      </ScrollView>

      {/* 3. PINNED BOTTOM BUTTON */}
      <View
        style={[
          tw`absolute bottom-0 left-0 right-0 px-5 pt-3 border-t`,
          {
            backgroundColor: Colors.surface,
            borderTopColor: Colors.border,
            paddingBottom: Math.max(insets.bottom, 12) + 6,
          },
        ]}
      >
        {!otpSent ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleSendOtp}
            style={[
              tw`rounded-2xl py-4 flex-row justify-center items-center shadow-md`,
              { backgroundColor: Colors.primary },
            ]}
          >
            <Text style={[tw`text-sm font-black mr-2 tracking-wide`, { color: Colors.white }]}>
              VERIFY NUMBER
            </Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleContinue}
            style={[
              tw`rounded-2xl py-4 flex-row justify-center items-center shadow-md`,
              { backgroundColor: Colors.primary },
            ]}
          >
            <Text style={[tw`text-sm font-black mr-2 tracking-wide`, { color: Colors.white }]}>
              {loading
                ? 'VERIFYING...'
                : authMode === 'LOGIN'
                ? 'CONTINUE EARNING'
                : 'CONTINUE TO KYC SETUP'}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
