import React from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import DateTimePicker from '@react-native-community/datetimepicker';
import tw from 'twrnc';

export default function Login() {
  const {
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
    handleSendOtp,
    handleVerifyOtp,
    handleRegisterProfile,
  } = useAuth();

  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [resendCountdown, setResendCountdown] = React.useState(0);

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setTimeout(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resendCountdown]);

  React.useEffect(() => {
    if (step === 'otp') {
      setResendCountdown(30);
    }
  }, [step]);

  const handleResendClick = async () => {
    if (resendCountdown > 0 || loading) return;
    await handleSendOtp();
    setResendCountdown(30);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    // Dismiss the picker on Android immediately
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      setDob(`${day}-${month}-${year}`);
      if (toast) setToast(null);
    }
  };

  return (
    <SafeAreaProvider>
      <View style={tw`flex-1`}>
        <LinearGradient
          colors={[theme.colors.loginGradientStart, theme.colors.loginGradientMiddle, theme.colors.loginGradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={tw`flex-1`}
        >
          <StatusBar style="dark" />

          {/* Fixed-size Background Decoration Layer (does not shift when keyboard resizes viewport) */}
          <View
            pointerEvents="none"
            style={[
              tw`absolute top-0 left-0`,
              {
                width: Dimensions.get('screen').width,
                height: Dimensions.get('screen').height
              }
            ]}
          >
            {/* Saturated Decorative Background Shapes with Emojis */}
            <View style={[tw`absolute w-80 h-80 rounded-full -top-20 -right-20 justify-center items-center`, { backgroundColor: theme.colors.emojiBg }]}>
              <Text style={tw`text-7xl opacity-20 mt-16 mr-16`}>🍎</Text>
            </View>
            <View style={[tw`absolute w-96 h-96 rounded-full -bottom-20 -left-20 justify-center items-center`, { backgroundColor: theme.colors.tealLight }]}>
              <Text style={tw`text-8xl opacity-15 mb-20 ml-20`}>🥛</Text>
            </View>
            <View style={[tw`absolute w-60 h-60 rounded-full top-[30%] -right-16 justify-center items-center`, { backgroundColor: theme.colors.amberLightBg }]}>
              <Text style={tw`text-6xl opacity-20 mr-12`}>🍞</Text>
            </View>
            <View style={[tw`absolute w-44 h-44 rounded-full top-[15%] -left-12 justify-center items-center`, { backgroundColor: theme.colors.emeraldLightBg }]}>
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
          </View>

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
                    <Text style={[tw`text-base font-extrabold`, { color: theme.colors.text }]}>Grocery Mart</Text>
                  </View>
                </View>

                {/* Bold Hero Header */}
                <View style={tw`my-auto py-6`}>
                  <Text style={[tw`text-5xl font-black tracking-tighter leading-[48px]`, { color: theme.colors.text }]}>
                    Freshness{"\n"}
                    <Text style={{ color: theme.colors.primary }}>On Demand.</Text>
                  </Text>
                  <Text style={[tw`text-sm font-semibold mt-3 max-w-[85%] mb-6`, { color: theme.colors.textLight }]}>
                    Delivering organic fruits, farm vegetables, and daily essentials directly to your home.
                  </Text>

                  {/* Form Wrapper */}
                  <View style={tw`mt-2`}>
                    {/* STEP 1: Enter Phone Number */}
                    {step === 'phone' && (
                      <View>
                        <Text style={[tw`text-[10px] font-black tracking-wider mb-2 uppercase`, { color: theme.colors.textMuted }]}>Sign in with number</Text>
                        <View style={tw`flex-row items-center mb-5`}>
                          <View style={[tw`h-14 w-18 border rounded-2xl justify-center items-center mr-3 shadow-sm`, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}>
                            <Text style={[tw`text-base font-bold`, { color: theme.colors.textLight }]}>+91</Text>
                          </View>
                          <View style={[tw`flex-1 flex-row items-center rounded-2xl h-14 px-4 border shadow-sm`, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}>
                            <Ionicons name="call-outline" size={18} color={theme.colors.textMuted} style={tw`mr-2`} />
                            <TextInput
                              placeholder="Mobile number"
                              placeholderTextColor={theme.colors.textMuted}
                              style={[tw`flex-1 h-full text-base font-semibold`, { color: theme.colors.text }]}
                              keyboardType="phone-pad"
                              maxLength={10}
                              value={phoneNumber}
                              onChangeText={(val) => {
                                setPhoneNumber(val.replace(/[^0-9]/g, ''));
                                if (toast) setToast(null);
                              }}
                            />
                          </View>
                        </View>

                        <TouchableOpacity
                          style={[tw`flex-row h-14 rounded-2xl justify-center items-center shadow-md`, { backgroundColor: theme.colors.primary }]}
                          activeOpacity={0.8}
                          onPress={handleSendOtp}
                          disabled={loading}
                        >
                          <Text style={[tw`font-extrabold text-base mr-2`, { color: theme.colors.white }]}>
                            {loading ? 'Sending code...' : 'Get Verification Code'}
                          </Text>
                          {!loading && <Ionicons name="arrow-forward" size={16} color={theme.colors.white} />}
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* STEP 2: Verify OTP */}
                    {step === 'otp' && (
                      <View>
                        <Text style={[tw`text-[10px] font-black tracking-wider mb-2 uppercase`, { color: theme.colors.textMuted }]}>Enter verification code</Text>
                        <View style={tw`flex-row items-center mb-5`}>
                          <View style={[tw`flex-1 flex-row items-center rounded-2xl h-14 px-4 border shadow-sm`, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}>
                            <Ionicons name="lock-closed-outline" size={18} color={theme.colors.textMuted} style={tw`mr-2`} />
                            <TextInput
                              placeholder="Enter 4-digit code"
                              placeholderTextColor={theme.colors.textMuted}
                              style={[tw`flex-1 h-full text-base font-semibold`, { color: theme.colors.text }]}
                              keyboardType="number-pad"
                              maxLength={4}
                              value={otpCode}
                              onChangeText={(val) => {
                                setOtpCode(val.replace(/[^0-9]/g, ''));
                                if (toast) setToast(null);
                              }}
                            />
                          </View>
                        </View>

                        <TouchableOpacity
                          style={[tw`flex-row h-14 rounded-2xl justify-center items-center shadow-md mb-3`, { backgroundColor: theme.colors.primary }]}
                          activeOpacity={0.8}
                          onPress={handleVerifyOtp}
                          disabled={loading}
                        >
                          <Text style={[tw`font-extrabold text-base mr-2`, { color: theme.colors.white }]}>
                            {loading ? 'Verifying...' : 'Verify OTP'}
                          </Text>
                          {!loading && <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.white} />}
                        </TouchableOpacity>

                        <View style={tw`flex-row justify-between items-center px-1 mt-2`}>
                          <TouchableOpacity
                            onPress={() => {
                              setStep('phone');
                              setOtpCode('');
                              if (toast) setToast(null);
                            }}
                            style={tw`py-2`}
                          >
                            <Text style={[tw`text-xs font-bold`, { color: theme.colors.primary }]}>Change Phone Number</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={handleResendClick}
                            disabled={resendCountdown > 0 || loading}
                            style={tw`py-2`}
                          >
                            <Text style={[
                              tw`text-xs font-bold`,
                              { color: resendCountdown > 0 ? theme.colors.textMuted : theme.colors.primary }
                            ]}>
                              {resendCountdown > 0 ? `Resend OTP (${resendCountdown}s)` : 'Resend OTP'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* STEP 3: Complete Profile Onboarding */}
                    {step === 'profile' && (
                      <View>
                        <Text style={[tw`text-[10px] font-black tracking-wider mb-2 uppercase`, { color: theme.colors.textMuted }]}>Personal Details</Text>

                        {/* Name Input */}
                        <View style={[tw`flex-row items-center rounded-2xl h-14 px-4 border shadow-sm mb-4`, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}>
                          <Ionicons name="person-outline" size={18} color={theme.colors.textMuted} style={tw`mr-2`} />
                          <TextInput
                            placeholder="Full name"
                            placeholderTextColor={theme.colors.textMuted}
                            style={[tw`flex-1 h-full text-base font-semibold`, { color: theme.colors.text }]}
                            value={name}
                            onChangeText={(val) => {
                              setName(val);
                              if (toast) setToast(null);
                            }}
                          />
                        </View>

                        {/* DOB Calendar Picker Trigger */}
                        <TouchableOpacity
                          onPress={() => setShowDatePicker(true)}
                          activeOpacity={0.7}
                          style={[tw`flex-row items-center rounded-2xl h-14 px-4 border shadow-sm mb-4`, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}
                        >
                          <Ionicons name="calendar-outline" size={18} color={theme.colors.textMuted} style={tw`mr-2`} />
                          <TextInput
                            placeholder="Date of Birth (DD-MM-YYYY)"
                            placeholderTextColor={theme.colors.textMuted}
                            style={[tw`flex-1 h-full text-base font-semibold`, { color: theme.colors.text }]}
                            value={dob}
                            editable={false}
                            pointerEvents="none"
                          />
                        </TouchableOpacity>

                        {/* Referral Code Input */}
                        <View style={[tw`flex-row items-center rounded-2xl h-14 px-4 border shadow-sm mb-5`, { backgroundColor: theme.colors.white, borderColor: theme.colors.border }]}>
                          <Ionicons name="gift-outline" size={18} color={theme.colors.textMuted} style={tw`mr-2`} />
                          <TextInput
                            placeholder="Referral code (Optional)"
                            placeholderTextColor={theme.colors.textMuted}
                            style={[tw`flex-1 h-full text-base font-semibold`, { color: theme.colors.text }]}
                            value={referralCode}
                            onChangeText={(val) => {
                              setReferralCode(val);
                              if (toast) setToast(null);
                            }}
                          />
                        </View>

                        <TouchableOpacity
                          style={[tw`flex-row h-14 rounded-2xl justify-center items-center shadow-md`, { backgroundColor: theme.colors.primary }]}
                          activeOpacity={0.8}
                          onPress={handleRegisterProfile}
                          disabled={loading}
                        >
                          <Text style={[tw`font-extrabold text-base mr-2`, { color: theme.colors.white }]}>
                            {loading ? 'Creating Account...' : 'Complete Registration'}
                          </Text>
                          {!loading && <Ionicons name="arrow-forward" size={16} color={theme.colors.white} />}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>

                {/* Sub-footer details */}
                <View style={tw`items-center`}>
                  <View style={tw`flex-row justify-center flex-wrap`}>
                    <Text style={[tw`text-[10px] font-semibold`, { color: theme.colors.textMuted }]}>By proceeding, you accept our </Text>
                    <TouchableOpacity>
                      <Text style={[tw`text-[10px] font-extrabold underline`, { color: theme.colors.textLight }]}>Terms of Service</Text>
                    </TouchableOpacity>
                  </View>
                </View>

              </ScrollView>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      {/* DateTimePicker Component */}
      {showDatePicker && (
        <DateTimePicker
          value={(() => {
            if (dob) {
              const parts = dob.split('-');
              if (parts.length === 3) {
                const d = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
                if (!isNaN(d.getTime())) return d;
              }
            }
            return new Date(2000, 0, 1);
          })()}
          mode="date"
          display="default"
          maximumDate={new Date()}
          onChange={onDateChange}
        />
      )}

      {/* Modern Glassmorphic Toast Notification (Sonner style) */}
      {toast && (
        <View style={[
          tw`absolute bottom-10 left-6 right-6 flex-row items-center p-4 rounded-xl border shadow-lg z-50`,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderColor: toast.type === 'error' ? theme.colors.danger + '20' : theme.colors.primary + '20',
          }
        ]}>
          <Ionicons
            name={toast.type === 'error' ? 'close-circle' : 'checkmark-circle'}
            size={22}
            color={toast.type === 'error' ? theme.colors.danger : theme.colors.success}
          />
          <Text style={[tw`text-sm font-semibold ml-2.5 flex-1`, { color: theme.colors.text }]}>
            {toast.message}
          </Text>
          <TouchableOpacity onPress={() => setToast(null)} style={tw`p-0.5`}>
            <Ionicons name="close" size={16} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaProvider>
  );
}
