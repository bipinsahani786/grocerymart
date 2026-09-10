import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

interface OtpInputSectionProps {
  otpDigits: string[];
  otpRefs: React.RefObject<TextInput | null>[];
  handleOtpChange: (val: string, index: number) => void;
  handleOtpKeyPress: (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => void;
  handleResendOtp: () => void;
  resendCooldown: number;
  loading: boolean;
  error: string;
  infoMessage: string;
}

export const OtpInputSection: React.FC<OtpInputSectionProps> = ({
  otpDigits,
  otpRefs,
  handleOtpChange,
  handleOtpKeyPress,
  handleResendOtp,
  resendCooldown,
  loading,
  error,
  infoMessage,
}) => {
  return (
    <View style={tw`mb-6 mt-2`}>
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <Text
          style={[
            tw`text-[11px] font-bold uppercase tracking-wider`,
            { color: Colors.textSecondary },
          ]}
        >
          Enter 4-Digit OTP
        </Text>
        <TouchableOpacity
          onPress={handleResendOtp}
          disabled={loading || resendCooldown > 0}
          activeOpacity={0.7}
          style={tw`py-0.5 px-1 flex-row items-center`}
        >
          {resendCooldown > 0 && (
            <Ionicons
              name="time-outline"
              size={13}
              color={Colors.textMuted}
              style={tw`mr-1`}
            />
          )}
          <Text
            style={[
              tw`text-xs font-black tracking-wide`,
              {
                color:
                  loading || resendCooldown > 0
                    ? Colors.textMuted
                    : Colors.primaryDark,
              },
            ]}
          >
            {loading
              ? 'Sending OTP...'
              : resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>

      {infoMessage ? (
        <Text
          style={[
            tw`text-[11px] font-semibold mb-1`,
            { color: Colors.primaryDark },
          ]}
        >
          ✓ {infoMessage}
        </Text>
      ) : null}

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
                backgroundColor: error
                  ? '#FEF2F2'
                  : digit
                    ? Colors.primaryBg
                    : Colors.surfaceLight,
                borderColor: error
                  ? Colors.danger
                  : digit
                    ? Colors.primary
                    : Colors.border,
                color: Colors.text,
              },
            ]}
          />
        ))}
      </View>

      {/* Clean inline red error for OTP */}
      {error ? (
        <Text
          style={[
            tw`text-[11px] font-bold mt-1 text-center`,
            { color: Colors.danger },
          ]}
        >
          {error}
        </Text>
      ) : null}

      <Text
        style={[
          tw`text-[10px] text-center mt-2`,
          { color: Colors.textSecondary },
        ]}
      >
        Code valid for 15 minutes.
      </Text>
    </View>
  );
};
