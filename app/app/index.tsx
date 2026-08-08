import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [referral, setReferral] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOTP = () => {
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      setTimer(30);
    }, 1200);
  };

  const handleVerifyOTP = () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length < 4) {
      setError('Please enter the 4-digit OTP.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(3);
    }, 1200);
  };

  const handleCompleteSetup = () => {
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!dob.trim()) {
      setError('Please enter your Date of Birth.');
      return;
    }
    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.replace('/home');
    }, 1000);
  };

  const handleOtpChange = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanText;
    setOtp(newOtp);
    setError('');
  };

  const renderPhoneStep = () => (
    <View style={tw`w-full`}>
      <Text style={tw`text-2xl font-black text-gray-900 tracking-tighter`}>Get Started</Text>
      <Text style={tw`text-xs text-gray-500 font-semibold mt-1 mb-6`}>Enter your phone number to sign in or register</Text>

      <Text style={tw`text-xs font-extrabold text-gray-700 mb-1`}>Phone Number</Text>
      <View style={tw`flex-row items-center mb-6`}>
        <View style={tw`h-13 w-16 bg-gray-100 border border-gray-200 rounded-xl justify-center items-center mr-3`}>
          <Text style={tw`text-sm font-bold text-gray-800`}>+91</Text>
        </View>
        <View style={tw`flex-1 flex-row items-center bg-gray-100 rounded-xl h-13 px-4 border border-gray-200`}>
          <TextInput
            placeholder="00000 00000"
            placeholderTextColor="#9CA3AF"
            style={tw`flex-1 h-full text-sm font-semibold`}
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
        style={tw`flex-row h-13 rounded-xl justify-center items-center ${loading ? 'bg-gray-400' : 'bg-emerald-500'}`}
        activeOpacity={0.9}
        onPress={handleSendOTP}
        disabled={loading}
      >
        <Text style={tw`color-white font-extrabold text-sm mr-2`}>{loading ? 'Sending OTP...' : 'Send OTP'}</Text>
        {!loading && <Ionicons name="arrow-forward" size={16} color="white" />}
      </TouchableOpacity>
    </View>
  );

  const renderOtpStep = () => (
    <View style={tw`w-full`}>
      <TouchableOpacity style={tw`flex-row items-center mb-4`} onPress={() => setStep(1)}>
        <Ionicons name="arrow-back" size={16} color="black" />
        <Text style={tw`text-xs font-bold text-gray-900 ml-1`}>Back</Text>
      </TouchableOpacity>

      <Text style={tw`text-2xl font-black text-gray-900 tracking-tighter`}>Verify Code</Text>
      <Text style={tw`text-xs text-gray-500 font-semibold mt-1 mb-6`}>Enter the 4-digit code sent to +91 {phoneNumber}</Text>

      <View style={tw`flex-row justify-between mb-5`}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            style={tw`w-13 h-13 rounded-xl border-2 border-gray-200 bg-gray-100 text-center text-lg font-extrabold text-emerald-600`}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(val) => handleOtpChange(val, idx)}
          />
        ))}
      </View>

      <View style={tw`items-center mb-6`}>
        {timer > 0 ? (
          <Text style={tw`text-xs font-semibold text-gray-400`}>Resend code in {timer}s</Text>
        ) : (
          <TouchableOpacity onPress={() => setTimer(30)}>
            <Text style={tw`text-xs font-extrabold text-emerald-600`}>Resend OTP</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={tw`flex-row h-13 rounded-xl justify-center items-center ${loading ? 'bg-gray-400' : 'bg-emerald-500'}`}
        activeOpacity={0.9}
        onPress={handleVerifyOTP}
        disabled={loading}
      >
        <Text style={tw`color-white font-extrabold text-sm mr-2`}>{loading ? 'Verifying...' : 'Verify & Continue'}</Text>
        {!loading && <Ionicons name="checkmark-circle-outline" size={16} color="white" />}
      </TouchableOpacity>
    </View>
  );

  const renderProfileStep = () => (
    <View style={tw`w-full`}>
      <Text style={tw`text-2xl font-black text-gray-900 tracking-tighter`}>Complete Profile</Text>
      <Text style={tw`text-xs text-gray-500 font-semibold mt-1 mb-6`}>Just a few details to get you started</Text>

      <Text style={tw`text-xs font-extrabold text-gray-700 mb-1`}>Full Name</Text>
      <View style={tw`flex-row items-center bg-gray-100 rounded-xl h-13 px-4 border border-gray-200 mb-4`}>
        <Ionicons name="person-outline" size={18} color="#9CA3AF" style={tw`mr-2`} />
        <TextInput
          placeholder="John Doe"
          placeholderTextColor="#9CA3AF"
          style={tw`flex-1 h-full text-sm font-semibold`}
          autoCapitalize="words"
          value={name}
          onChangeText={(val) => {
            setName(val);
            setError('');
          }}
        />
      </View>

      <Text style={tw`text-xs font-extrabold text-gray-700 mb-1`}>Date of Birth</Text>
      <View style={tw`flex-row items-center bg-gray-100 rounded-xl h-13 px-4 border border-gray-200 mb-4`}>
        <Ionicons name="calendar-outline" size={18} color="#9CA3AF" style={tw`mr-2`} />
        <TextInput
          placeholder="DD / MM / YYYY"
          placeholderTextColor="#9CA3AF"
          style={tw`flex-1 h-full text-sm font-semibold`}
          value={dob}
          onChangeText={(val) => {
            setDob(val);
            setError('');
          }}
        />
      </View>

      <Text style={tw`text-xs font-extrabold text-gray-700 mb-1`}>Referral Code (Optional)</Text>
      <View style={tw`flex-row items-center bg-gray-100 rounded-xl h-13 px-4 border border-gray-200 mb-5`}>
        <Ionicons name="gift-outline" size={18} color="#9CA3AF" style={tw`mr-2`} />
        <TextInput
          placeholder="Enter referral code"
          placeholderTextColor="#9CA3AF"
          style={tw`flex-1 h-full text-sm font-semibold`}
          autoCapitalize="characters"
          value={referral}
          onChangeText={(val) => {
            setReferral(val);
            setError('');
          }}
        />
      </View>

      <TouchableOpacity
        style={tw`flex-row h-13 rounded-xl justify-center items-center ${loading ? 'bg-gray-400' : 'bg-emerald-500'}`}
        activeOpacity={0.9}
        onPress={handleCompleteSetup}
        disabled={loading}
      >
        <Text style={tw`color-white font-extrabold text-sm mr-2`}>{loading ? 'Setting up...' : 'Get Started'}</Text>
        {!loading && <Ionicons name="rocket-outline" size={16} color="white" />}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaProvider>
      <View style={tw`flex-1`}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#10B981', '#047857']}
          style={tw`flex-1`}
        >
          <SafeAreaView style={tw`flex-1`} edges={['top']}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={tw`flex-1`}
            >
              <ScrollView 
                contentContainerStyle={tw`flex-grow justify-between`} 
                showsVerticalScrollIndicator={false}
                bounces={false}
              >
                {/* Top Branding Section */}
                <View style={tw`flex-1 justify-center items-center py-8`}>
                  <View style={tw`w-20 h-20 bg-white/20 rounded-2xl justify-center items-center mb-4 border border-white/30`}>
                    <Text style={tw`text-4xl`}>🛒</Text>
                  </View>
                  <Text style={tw`text-3xl font-black text-white`}>Grocery Mart</Text>
                  <Text style={tw`text-xs text-white/80 font-bold mt-1 text-center px-8`}>
                    Fresh products, delivered directly to your doorstep
                  </Text>
                </View>

                {/* Bottom Card Form container */}
                <View style={tw`bg-white rounded-t-[32px] px-6 pt-8 pb-6`}>
                  {error.length > 0 && (
                    <View style={tw`flex-row items-center bg-red-100 p-4 rounded-xl mb-4`}>
                      <Ionicons name="alert-circle" size={18} color="#EF4444" />
                      <Text style={tw`text-red-500 text-xs font-bold ml-1`}>{error}</Text>
                    </View>
                  )}

                  {step === 1 && renderPhoneStep()}
                  {step === 2 && renderOtpStep()}
                  {step === 3 && renderProfileStep()}

                  <View style={tw`flex-row justify-center mt-6 flex-wrap`}>
                    <Text style={tw`text-xs text-gray-400 font-semibold`}>By continuing, you agree to our </Text>
                    <TouchableOpacity>
                      <Text style={tw`text-xs text-gray-600 font-bold`}>Terms & Conditions</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </View>
    </SafeAreaProvider>
  );
}
