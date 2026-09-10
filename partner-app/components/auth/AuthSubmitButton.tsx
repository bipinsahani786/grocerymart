import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

interface AuthSubmitButtonProps {
  insets: EdgeInsets;
  otpSent: boolean;
  authMode: 'LOGIN' | 'REGISTER';
  loading: boolean;
  onSubmit: () => void;
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({
  insets,
  otpSent,
  authMode,
  loading,
  onSubmit,
}) => {
  const getButtonLabel = () => {
    if (!otpSent) return 'VERIFY NUMBER';
    return authMode === 'LOGIN' ? 'CONTINUE EARNING' : 'CONTINUE TO KYC SETUP';
  };

  return (
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
      <TouchableOpacity
        activeOpacity={0.85}
        disabled={loading}
        onPress={onSubmit}
        style={[
          tw`rounded-2xl py-4 flex-row justify-center items-center shadow-md`,
          { backgroundColor: loading ? Colors.primaryLight : Colors.primary },
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={Colors.white} style={tw`mr-2`} />
        ) : (
          <>
            <Text
              style={[
                tw`text-sm font-black mr-2 tracking-wide`,
                { color: Colors.white },
              ]}
            >
              {getButtonLabel()}
            </Text>
            <Ionicons name="arrow-forward" size={18} color={Colors.white} />
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};
