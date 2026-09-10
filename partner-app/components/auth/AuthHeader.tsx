import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

interface AuthHeaderProps {
  title: string;
  insets: EdgeInsets;
  onBack: () => void;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({
  title,
  insets,
  onBack,
}) => {
  return (
    <View
      style={[
        tw`px-4 pb-3 border-b flex-row items-center justify-between`,
        {
          backgroundColor: Colors.surface,
          borderBottomColor: Colors.border,
          paddingTop: Platform.OS === 'ios' ? Math.max(insets.top - 12, 8) : 8,
        },
      ]}
    >
      <TouchableOpacity
        onPress={onBack}
        style={tw`p-1 -ml-1`}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={[tw`text-base font-black`, { color: Colors.text }]}>
        {title}
      </Text>

      <View style={tw`w-6`} />
    </View>
  );
};
