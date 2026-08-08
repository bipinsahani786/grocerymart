import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

// Base API URL config
// If testing on a physical phone, replace with your local IP address (e.g., http://192.168.1.10:5000)
const API_URL = 'http://localhost:5000';

type LoginStep = 'phone' | 'otp' | 'profile';

export default function Login() {
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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  // Send OTP (Step 1 -> Step 2)
  const handleSendOtp = async () => {
    if (phoneNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStep('otp');
        setInfoMessage('A 4-digit verification code has been simulated/sent.');
      } else {
        setError(data.message || 'Failed to send verification code.');
      }
    } catch (err) {
      // Fallback simulated flow if backend server is unreachable
      console.warn('Backend server unreachable, running offline simulation:', err);
      setStep('otp');
      setInfoMessage('Server offline. Running demo simulation. Enter code "1234".');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP (Step 2 -> Step 3 or Home)
  const handleVerifyOtp = async () => {
    if (otpCode.length !== 4) {
      setError('Please enter the 4-digit verification code.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp: otpCode }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        if (data.isNewUser) {
          setStep('profile');
          setInfoMessage('Code verified. Tell us a bit about yourself!');
        } else {
          // Logged in existing user
          router.replace('/home');
        }
      } else {
        setError(data.message || 'Invalid verification code.');
      }
    } catch (err) {
      // Fallback simulated flow if backend is offline
      if (otpCode === '1234') {
        // Assume phone ending in "00" is existing user, others are new
        if (phoneNumber.endsWith('00')) {
          router.replace('/home');
        } else {
          setStep('profile');
          setInfoMessage('Demo Verified. Please complete your profile.');
        }
      } else {
        setError('Incorrect verification code. (Try "1234" for offline simulation)');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create Profile and Register (Step 3 -> Home)
  const handleRegisterProfile = async () => {
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    // Validation for DOB in format DD-MM-YYYY or DD/MM/YYYY
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])[-/](0[1-9]|1[012])[-/](19|20)\d\d$/;
    if (!dobRegex.test(dob)) {
      setError('Please enter a valid Date of Birth (DD-MM-YYYY).');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/otp/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phoneNumber,
          name: name.trim(),
          dob: dob.trim(),
          referralCode: referralCode.trim() || undefined,
        }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        router.replace('/home');
      } else {
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      // Fallback offline simulation
      console.warn('Backend server unreachable, completing offline signup:', err);
      router.replace('/home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={tw`flex-1`}>
        <LinearGradient
          colors={['#F0FDF4', '#EFF6FF', '#F9FAFB']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={tw`flex-1`}
        >
          <StatusBar style="dark" />

          {/* Saturated Decorative Background Shapes with Emojis */}
          <View style={tw`absolute w-80 h-80 rounded-full bg-emerald-200/40 -top-20 -right-20 justify-center items-center`}>
            <Text style={tw`text-7xl opacity-20 mt-16 mr-16`}>🍎</Text>
          </View>
          <View style={tw`absolute w-96 h-96 rounded-full bg-teal-200/30 -bottom-20 -left-20 justify-center items-center`}>
            <Text style={tw`text-8xl opacity-15 mb-20 ml-20`}>🥛</Text>
          </View>
          <View style={tw`absolute w-60 h-60 rounded-full bg-amber-100/40 top-[30%] -right-16 justify-center items-center`}>
            <Text style={tw`text-6xl opacity-20 mr-12`}>🍞</Text>
          </View>
          <View style={tw`absolute w-44 h-44 rounded-full bg-emerald-100/50 top-[15%] -left-12 justify-center items-center`}>
            <Text style={tw`text-5xl opacity-25 ml-10`}>🥦</Text>
          </View>

          {/* Floating Small Grocery Icons Pattern */}
          <Text style={[tw`absolute text-2xl opacity-15`, { top: '8%', left: '10%' }]}>🍓</Text>
          <Text style={[tw`absolute text-3xl opacity-10`, { top: '22%', right: '15%' }]}>🍌</Text>
          <Text style={[tw`absolute text-xl opacity-15`, { top: '35%', left: '8%' }]}>🍊</Text>
          <Text style={[tw`absolute text-2xl opacity-10`, { top: '50%', right: '8%' }]}>🥬</Text>
          <Text style={[tw`absolute text-3xl opacity-15`, { top: '65%', left: '12%' }]}>🥕</Text>
          <Text style={[tw`absolute text-xl opacity-10`, { top: '78%', right: '20%' }]}>🧀</Text>
          <Text style={[tw`absolute text-2xl opacity-15`, { top: '85%', left: '30%' }]}>🧅</Text>
          <Text style={[tw`absolute text-3xl opacity-10`, { top: '92%', right: '40%' }]}>🍿</Text>

          {/* Additional Floating Emojis */}
          <Text style={[tw`absolute text-xl opacity-10`, { top: '15%', right: '40%' }]}>🍉</Text>
          <Text style={[tw`absolute text-2xl opacity-15`, { top: '28%', left: '25%' }]}>🍒</Text>
          <Text style={[tw`absolute text-3xl opacity-10`, { top: '42%', left: '42%' }]}>🥑</Text>
          <Text style={[tw`absolute text-xl opacity-15`, { top: '48%', right: '35%' }]}>🍍</Text>
          <Text style={[tw`absolute text-2xl opacity-10`, { top: '58%', left: '32%' }]}>🍇</Text>
          <Text style={[tw`absolute text-3xl opacity-15`, { top: '70%', right: '28%' }]}>🌽</Text>
          <Text style={[tw`absolute text-xl opacity-10`, { top: '76%', left: '22%' }]}>🌶️</Text>
          <Text style={[tw`absolute text-2xl opacity-15`, { top: '82%', right: '15%' }]}>🍄</Text>
          <Text style={[tw`absolute text-3xl opacity-10`, { top: '88%', left: '15%' }]}>🥐</Text>
          <Text style={[tw`absolute text-xl opacity-15`, { top: '95%', left: '60%' }]}>🥞</Text>

          <SafeAreaView style={tw`flex-1`} edges={['top', 'bottom']}>
            <View style={tw`flex-1`}>
              <ScrollView
                contentContainerStyle={tw`flex-grow px-6 justify-between pt-2 pb-8`}
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Header Branding */}
                <View style={tw`flex-row justify-between items-center mt-0`}>
                  <View style={tw`flex-row items-center`}>
                    <Image
                      source={require('../assets/images/zytrixon.png')}
                      style={tw`w-9 h-9 rounded-xl mr-2`}
                      resizeMode="contain"
                    />
                    <Text style={tw`text-base font-extrabold text-gray-900`}>Grocery Mart</Text>
                  </View>
                </View>

                {/* Bold Hero Header */}
                <View style={tw`my-auto py-6`}>
                  <Text style={tw`text-5xl font-black text-gray-900 tracking-tighter leading-[48px]`}>
                    Freshness{"\n"}
                    <Text style={tw`text-emerald-500`}>On Demand.</Text>
                  </Text>
                  <Text style={tw`text-sm text-gray-500 font-semibold mt-3 max-w-[85%] mb-6`}>
                    Delivering organic fruits, farm vegetables, and daily essentials directly to your home.
                  </Text>

                  {/* Form Wrapper */}
                  <View style={tw`mt-2`}>
                    {/* Error Box */}
                    {error.length > 0 && (
                      <View style={tw`flex-row items-center bg-red-50 p-3.5 rounded-2xl mb-4 border border-red-200`}>
                        <Ionicons name="alert-circle" size={18} color="#EF4444" />
                        <Text style={tw`text-red-500 text-xs font-bold ml-2 flex-1`}>{error}</Text>
                      </View>
                    )}

                    {/* Info Toast Box */}
                    {infoMessage.length > 0 && (
                      <View style={tw`flex-row items-center bg-emerald-50 p-3.5 rounded-2xl mb-4 border border-emerald-200`}>
                        <Ionicons name="information-circle" size={18} color="#059669" />
                        <Text style={tw`text-emerald-600 text-xs font-bold ml-2 flex-1`}>{infoMessage}</Text>
                      </View>
                    )}

                    {/* STEP 1: Enter Phone Number */}
                    {step === 'phone' && (
                      <View>
                        <Text style={tw`text-[10px] font-black text-gray-400 tracking-wider mb-2 uppercase`}>Sign in with number</Text>
                        <View style={tw`flex-row items-center mb-5`}>
                          <View style={tw`h-14 w-18 bg-white border border-gray-200 rounded-2xl justify-center items-center mr-3 shadow-sm`}>
                            <Text style={tw`text-base font-bold text-gray-700`}>+91</Text>
                          </View>
                          <View style={tw`flex-1 flex-row items-center bg-white rounded-2xl h-14 px-4 border border-gray-200 shadow-sm`}>
                            <Ionicons name="call-outline" size={18} color="#9CA3AF" style={tw`mr-2`} />
                            <TextInput
                              placeholder="Mobile number"
                              placeholderTextColor="#9CA3AF"
                              style={tw`flex-1 h-full text-base font-semibold text-gray-900`}
                              keyboardType="phone-pad"
                              maxLength={10}
                              value={phoneNumber}
                              onChangeText={(val) => {
                                setPhoneNumber(val.replace(/[^0-9]/g, ''));
                                setError('');
                              }}
                            />
                          </View>
                        </View>

                        <TouchableOpacity
                          style={tw`flex-row h-14 rounded-2xl justify-center items-center bg-emerald-500 shadow-md shadow-emerald-500/10`}
                          activeOpacity={0.8}
                          onPress={handleSendOtp}
                          disabled={loading}
                        >
                          <Text style={tw`text-white font-extrabold text-base mr-2`}>
                            {loading ? 'Sending code...' : 'Get Verification Code'}
                          </Text>
                          {!loading && <Ionicons name="arrow-forward" size={16} color="white" />}
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* STEP 2: Verify OTP */}
                    {step === 'otp' && (
                      <View>
                        <Text style={tw`text-[10px] font-black text-gray-400 tracking-wider mb-2 uppercase`}>Enter verification code</Text>
                        <View style={tw`flex-row items-center mb-5`}>
                          <View style={tw`flex-1 flex-row items-center bg-white rounded-2xl h-14 px-4 border border-gray-200 shadow-sm`}>
                            <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" style={tw`mr-2`} />
                            <TextInput
                              placeholder="Enter 4-digit code"
                              placeholderTextColor="#9CA3AF"
                              style={tw`flex-1 h-full text-base font-semibold text-gray-900`}
                              keyboardType="number-pad"
                              maxLength={4}
                              value={otpCode}
                              onChangeText={(val) => {
                                setOtpCode(val.replace(/[^0-9]/g, ''));
                                setError('');
                              }}
                            />
                          </View>
                        </View>

                        <TouchableOpacity
                          style={tw`flex-row h-14 rounded-2xl justify-center items-center bg-emerald-500 shadow-md shadow-emerald-500/10 mb-3`}
                          activeOpacity={0.8}
                          onPress={handleVerifyOtp}
                          disabled={loading}
                        >
                          <Text style={tw`text-white font-extrabold text-base mr-2`}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                          </Text>
                          {!loading && <Ionicons name="checkmark-circle-outline" size={18} color="white" />}
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={() => {
                            setStep('phone');
                            setError('');
                            setInfoMessage('');
                            setOtpCode('');
                          }}
                          style={tw`align-self-center py-2`}
                        >
                          <Text style={tw`text-emerald-500 text-xs font-bold text-center`}>Change Phone Number</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* STEP 3: Complete Profile Onboarding */}
                    {step === 'profile' && (
                      <View>
                        <Text style={tw`text-[10px] font-black text-gray-400 tracking-wider mb-2 uppercase`}>Personal Details</Text>
                        
                        {/* Name Input */}
                        <View style={tw`flex-row items-center bg-white rounded-2xl h-14 px-4 border border-gray-200 shadow-sm mb-4`}>
                          <Ionicons name="person-outline" size={18} color="#9CA3AF" style={tw`mr-2`} />
                          <TextInput
                            placeholder="Full name"
                            placeholderTextColor="#9CA3AF"
                            style={tw`flex-1 h-full text-base font-semibold text-gray-900`}
                            value={name}
                            onChangeText={(val) => {
                              setName(val);
                              setError('');
                            }}
                          />
                        </View>

                        {/* DOB Input */}
                        <View style={tw`flex-row items-center bg-white rounded-2xl h-14 px-4 border border-gray-200 shadow-sm mb-4`}>
                          <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={tw`mr-2`} />
                          <TextInput
                            placeholder="Date of Birth (DD-MM-YYYY)"
                            placeholderTextColor="#9CA3AF"
                            style={tw`flex-1 h-full text-base font-semibold text-gray-900`}
                            value={dob}
                            maxLength={10}
                            onChangeText={(val) => {
                              // Simple auto-formatting helper for DD-MM-YYYY
                              let formatted = val.replace(/[^0-9]/g, '');
                              if (formatted.length > 2 && formatted.length <= 4) {
                                formatted = `${formatted.slice(0, 2)}-${formatted.slice(2)}`;
                              } else if (formatted.length > 4) {
                                formatted = `${formatted.slice(0, 2)}-${formatted.slice(2, 4)}-${formatted.slice(4, 8)}`;
                              }
                              setDob(formatted);
                              setError('');
                            }}
                          />
                        </View>

                        {/* Referral Code Input */}
                        <View style={tw`flex-row items-center bg-white rounded-2xl h-14 px-4 border border-gray-200 shadow-sm mb-5`}>
                          <Ionicons name="gift-outline" size={18} color="#9CA3AF" style={tw`mr-2`} />
                          <TextInput
                            placeholder="Referral code (Optional)"
                            placeholderTextColor="#9CA3AF"
                            style={tw`flex-1 h-full text-base font-semibold text-gray-900`}
                            value={referralCode}
                            onChangeText={(val) => {
                              setReferralCode(val);
                              setError('');
                            }}
                          />
                        </View>

                        <TouchableOpacity
                          style={tw`flex-row h-14 rounded-2xl justify-center items-center bg-emerald-500 shadow-md shadow-emerald-500/10`}
                          activeOpacity={0.8}
                          onPress={handleRegisterProfile}
                          disabled={loading}
                        >
                          <Text style={tw`text-white font-extrabold text-base mr-2`}>
                            {loading ? 'Creating Account...' : 'Complete Registration'}
                          </Text>
                          {!loading && <Ionicons name="arrow-forward" size={16} color="white" />}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                {/* Sub-footer details */}
                <View style={tw`items-center`}>
                  <View style={tw`flex-row justify-center flex-wrap`}>
                    <Text style={tw`text-[10px] text-gray-400 font-semibold`}>By proceeding, you accept our </Text>
                    <TouchableOpacity>
                      <Text style={tw`text-[10px] text-gray-500 font-extrabold underline`}>Terms of Service</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </ScrollView>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </SafeAreaProvider>
  );
}
