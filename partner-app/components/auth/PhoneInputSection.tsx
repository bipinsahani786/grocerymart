import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

interface PhoneInputSectionProps {
  phone: string;
  setPhone: (phone: string) => void;
  otpSent: boolean;
  loading: boolean;
  error: string;
  setError: (err: string) => void;
  onEditPhone: () => void;
  showRegisterPrompt: boolean;
  onSwitchToRegister: () => void;
  showLoginPrompt: boolean;
  onSwitchToLogin: () => void;
}

export const PhoneInputSection: React.FC<PhoneInputSectionProps> = ({
  phone,
  setPhone,
  otpSent,
  loading,
  error,
  setError,
  onEditPhone,
  showRegisterPrompt,
  onSwitchToRegister,
  showLoginPrompt,
  onSwitchToLogin,
}) => {
  return (
    <View
      style={[
        tw`py-3 border-b mb-4`,
        { borderBottomColor: error && !otpSent ? Colors.danger : Colors.border },
      ]}
    >
      <View style={tw`flex-row justify-between items-center mb-1.5`}>
        <Text
          style={[
            tw`text-[11px] font-bold uppercase tracking-wider`,
            { color: Colors.textSecondary },
          ]}
        >
          Phone Number
        </Text>
        {otpSent && (
          <TouchableOpacity onPress={onEditPhone} activeOpacity={0.7}>
            <Text style={[tw`text-xs font-bold`, { color: Colors.primaryDark }]}>
              Edit Number
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={tw`flex-row items-center`}>
        <View
          style={[
            tw`px-3 py-1.5 rounded-xl mr-2.5 border`,
            {
              backgroundColor: Colors.surfaceLight,
              borderColor: Colors.border,
            },
          ]}
        >
          <Text style={[tw`text-sm font-black`, { color: Colors.text }]}>
            🇮🇳 +91
          </Text>
        </View>
        <TextInput
          value={phone}
          editable={!otpSent && !loading}
          onChangeText={(txt) => {
            const clean = txt.replace(/\D/g, '');
            setPhone(clean);
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

      {/* Clean inline red error for phone and smart prompts */}
      {!otpSent && (error || showRegisterPrompt || showLoginPrompt) ? (
        <View style={tw`mt-2`}>
          {error ? (
            <View style={tw`flex-row items-center mb-1`}>
              <Ionicons
                name="alert-circle"
                size={13}
                color={Colors.danger}
                style={tw`mr-1`}
              />
              <Text
                style={[
                  tw`text-[11px] font-bold flex-1`,
                  { color: Colors.danger },
                ]}
              >
                {error}
              </Text>
            </View>
          ) : null}

          {/* Smart switch to Register when user is not found */}
          {showRegisterPrompt && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onSwitchToRegister}
              style={tw`mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-300 flex-row items-center justify-between shadow-sm`}
            >
              <View style={tw`flex-row items-center flex-1 mr-2`}>
                <Ionicons name="person-add-outline" size={18} color="#047857" style={tw`mr-2`} />
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-[11.5px] font-black`, { color: '#047857' }]}>
                    New Delivery Partner?
                  </Text>
                  <Text
                    style={[
                      tw`text-[10px] font-semibold mt-0.5`,
                      { color: '#065F46' },
                    ]}
                  >
                    Tap here to switch to Sign Up & create an account
                  </Text>
                </View>
              </View>
              <View style={tw`bg-emerald-600 px-3 py-1.5 rounded-lg shadow-sm`}>
                <Text
                  style={tw`text-[10.5px] font-black text-white tracking-wide`}
                >
                  SIGN UP NOW
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Smart switch to Login when user already exists */}
          {showLoginPrompt && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onSwitchToLogin}
              style={tw`mt-2 p-3 rounded-xl bg-blue-50 border border-blue-300 flex-row items-center justify-between shadow-sm`}
            >
              <View style={tw`flex-row items-center flex-1 mr-2`}>
                <Ionicons name="log-in-outline" size={19} color="#1E40AF" style={tw`mr-2`} />
                <View style={tw`flex-1`}>
                  <Text style={[tw`text-[11.5px] font-black`, { color: '#1E40AF' }]}>
                    Account Already Exists
                  </Text>
                  <Text
                    style={[
                      tw`text-[10px] font-semibold mt-0.5`,
                      { color: '#1E3A8A' },
                    ]}
                  >
                    Tap here to switch to Sign In & receive OTP
                  </Text>
                </View>
              </View>
              <View style={tw`bg-blue-600 px-3 py-1.5 rounded-lg shadow-sm`}>
                <Text
                  style={tw`text-[10.5px] font-black text-white tracking-wide`}
                >
                  SIGN IN NOW
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
    </View>
  );
};
