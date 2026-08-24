import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../context/AuthContext';
import { Colors } from '../constants/theme';
import tw from 'twrnc';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { loginWithPhone } = useAuthContext();

  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [vehicleType, setVehicleType] = useState<'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE'>('EV_BIKE');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = () => {
    if (phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setOtpSent(true);
    setOtp('1234'); // Pre-fill mock OTP for smooth testing
  };

  const handleLogin = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      await loginWithPhone(phone, otp, vehicleType);
      router.replace('/home');
    } catch {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const vehicles: { id: 'EV_BIKE' | 'PETROL_BIKE' | 'SCOOTER' | 'CYCLE'; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { id: 'EV_BIKE', label: 'Electric Bike', icon: 'battery-charging' },
    { id: 'PETROL_BIKE', label: 'Motorcycle', icon: 'bicycle' },
    { id: 'SCOOTER', label: 'Scooter', icon: 'speedometer' },
    { id: 'CYCLE', label: 'Bicycle', icon: 'fitness' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[tw`flex-1`, { backgroundColor: Colors.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          tw`px-5`,
          {
            paddingTop: Math.max(insets.top, 20) + 20,
            paddingBottom: Math.max(insets.bottom, 20) + 20,
          },
        ]}
      >
        {/* Header */}
        <View style={tw`items-center mb-7`}>
          <View
            style={[
              tw`w-16 h-16 rounded-full border justify-center items-center mb-3 shadow-sm`,
              { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
            ]}
          >
            <Ionicons name="bicycle" size={32} color={Colors.primary} />
          </View>
          <Text style={[tw`text-2xl font-black`, { color: Colors.text }]}>Partner Login</Text>
          <Text style={[tw`text-xs text-center mt-1 max-w-[280px]`, { color: Colors.textSecondary }]}>
            Enter your registered phone number to sign in or register
          </Text>
        </View>

        {/* Form Card */}
        <View
          style={[
            tw`rounded-2xl p-5 border shadow-md`,
            { backgroundColor: Colors.surface, borderColor: Colors.border },
          ]}
        >
          {/* Phone Input */}
          <Text style={[tw`text-xs font-bold mb-2`, { color: Colors.textSecondary }]}>
            Mobile Number
          </Text>
          <View
            style={[
              tw`flex-row items-center rounded-xl border overflow-hidden`,
              { backgroundColor: Colors.background, borderColor: Colors.border },
            ]}
          >
            <View
              style={[
                tw`px-3 py-3.5 border-r`,
                { backgroundColor: Colors.surfaceLight, borderRightColor: Colors.border },
              ]}
            >
              <Text style={[tw`text-sm font-bold`, { color: Colors.text }]}>🇮🇳 +91</Text>
            </View>
            <TextInput
              value={phone}
              onChangeText={(txt) => {
                setPhone(txt);
                setError('');
              }}
              placeholder="10-digit number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={10}
              style={[tw`flex-1 px-3 py-3.5 text-base font-bold`, { color: Colors.text }]}
            />
          </View>

          {/* Vehicle Selector */}
          <Text style={[tw`text-xs font-bold mb-2 mt-4`, { color: Colors.textSecondary }]}>
            Select Your Delivery Vehicle
          </Text>
          <View style={tw`flex-row flex-wrap gap-2`}>
            {vehicles.map((v) => {
              const isSelected = vehicleType === v.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => setVehicleType(v.id)}
                  style={[
                    tw`flex-row items-center gap-2 p-2.5 rounded-lg border w-[48%]`,
                    {
                      backgroundColor: isSelected ? Colors.primaryBg : Colors.surfaceLight,
                      borderColor: isSelected ? Colors.primary : Colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name={v.icon}
                    size={18}
                    color={isSelected ? Colors.primary : Colors.textMuted}
                  />
                  <Text
                    style={[
                      tw`text-xs font-semibold`,
                      {
                        color: isSelected ? Colors.primaryDark : Colors.textSecondary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {v.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* OTP Section */}
          {otpSent ? (
            <View style={tw`mt-4`}>
              <View style={tw`flex-row justify-between items-center`}>
                <Text style={[tw`text-xs font-bold`, { color: Colors.textSecondary }]}>
                  Enter 4-Digit OTP
                </Text>
                <TouchableOpacity onPress={handleSendOtp}>
                  <Text style={[tw`text-xs font-bold`, { color: Colors.primary }]}>
                    Resend OTP
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                value={otp}
                onChangeText={(txt) => {
                  setOtp(txt);
                  setError('');
                }}
                placeholder="4-digit code (e.g. 1234)"
                placeholderTextColor={Colors.textMuted}
                keyboardType="number-pad"
                maxLength={4}
                style={[
                  tw`border-2 rounded-xl py-3 text-center text-xl font-black tracking-widest mt-2`,
                  {
                    backgroundColor: Colors.surfaceLight,
                    borderColor: Colors.primary,
                    color: Colors.text,
                  },
                ]}
              />
            </View>
          ) : null}

          {error ? (
            <Text style={[tw`text-xs mt-2.5 text-center`, { color: Colors.danger }]}>
              {error}
            </Text>
          ) : null}

          {/* Submit Button */}
          {!otpSent ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSendOtp}
              style={[
                tw`rounded-xl py-3.5 flex-row justify-center items-center gap-2 mt-5 shadow-md`,
                { backgroundColor: Colors.primary },
              ]}
            >
              <Text style={[tw`text-sm font-black tracking-wide`, { color: Colors.white }]}>
                GET OTP
              </Text>
              <Ionicons name="arrow-forward" size={18} color={Colors.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleLogin}
              style={[
                tw`rounded-xl py-3.5 flex-row justify-center items-center gap-2 mt-5 shadow-md`,
                { backgroundColor: Colors.primary },
              ]}
            >
              <Text style={[tw`text-sm font-black tracking-wide`, { color: Colors.white }]}>
                {loading ? 'VERIFYING...' : 'VERIFY & CONTINUE'}
              </Text>
              <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
            </TouchableOpacity>
          )}

          {/* Quick Onboarding / KYC Link */}
          <TouchableOpacity
            onPress={() => router.push('/onboarding')}
            style={[tw`flex-row items-center justify-center mt-4 pt-3 border-t`, { borderTopColor: Colors.border }]}
          >
            <Ionicons name="document-text-outline" size={16} color={Colors.primary} style={tw`mr-1.5`} />
            <Text style={[tw`text-xs font-semibold`, { color: Colors.primary }]}>
              New Partner? Check KYC & Onboarding Guide
            </Text>
          </TouchableOpacity>
        </View>

        {/* Benefits Footer */}
        <View style={tw`flex-row justify-around mt-7`}>
          <View style={tw`flex-row items-center gap-1.5`}>
            <Ionicons name="flash" size={16} color={Colors.amber} />
            <Text style={[tw`text-xs font-semibold`, { color: Colors.textSecondary }]}>
              Instant Payouts
            </Text>
          </View>
          <View style={tw`flex-row items-center gap-1.5`}>
            <Ionicons name="shield-checkmark" size={16} color={Colors.primary} />
            <Text style={[tw`text-xs font-semibold`, { color: Colors.textSecondary }]}>
              ₹5L Medical Cover
            </Text>
          </View>
          <View style={tw`flex-row items-center gap-1.5`}>
            <Ionicons name="flame" size={16} color={Colors.blue} />
            <Text style={[tw`text-xs font-semibold`, { color: Colors.textSecondary }]}>
              Surge Bonuses
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
