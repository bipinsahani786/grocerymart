import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useDutyContext } from '../../context/DutyContext';
import tw from 'twrnc';

export const DutySwitch: React.FC = () => {
  const { isOnline, toggleDuty } = useDutyContext();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={toggleDuty}
      style={[
        tw`flex-row items-center px-3 py-1.5 rounded-full border shadow-sm`,
        {
          backgroundColor: isOnline ? '#FFFFFF' : 'rgba(255, 255, 255, 0.2)',
          borderColor: isOnline ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)',
        },
      ]}
    >
      {/* Status Dot */}
      <View
        style={[
          tw`w-2.5 h-2.5 rounded-full mr-1.5`,
          {
            backgroundColor: isOnline ? '#10B981' : '#E5E7EB',
          },
        ]}
      />

      {/* Label */}
      <Text
        style={[
          tw`text-xs font-black tracking-wider mr-1.5`,
          { color: isOnline ? '#047857' : '#FFFFFF' },
        ]}
      >
        {isOnline ? 'ONLINE' : 'GO ONLINE'}
      </Text>

      {/* Action Icon */}
      <Ionicons
        name={isOnline ? 'checkmark-circle' : 'power'}
        size={14}
        color={isOnline ? '#047857' : '#FFFFFF'}
      />
    </TouchableOpacity>
  );
};

