import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useDutyContext } from '../../context/DutyContext';

export const DutySwitch: React.FC = () => {
  const { isOnline, toggleDuty } = useDutyContext();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={toggleDuty}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.2)',
        borderColor: isOnline ? Colors.primary : Colors.border,
        borderWidth: 1.5,
        borderRadius: 24,
        paddingVertical: 6,
        paddingHorizontal: 12,
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: isOnline ? Colors.primary : Colors.danger,
          marginRight: 8,
          shadowColor: isOnline ? Colors.primary : Colors.danger,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
        }}
      />
      <Text
        style={{
          fontSize: 13,
          fontWeight: '700',
          color: isOnline ? Colors.primaryLight : Colors.textSecondary,
          letterSpacing: 0.5,
        }}
      >
        {isOnline ? 'ON DUTY' : 'OFF DUTY'}
      </Text>
      <Ionicons
        name={isOnline ? 'radio-button-on' : 'power'}
        size={14}
        color={isOnline ? Colors.primary : Colors.textMuted}
        style={{ marginLeft: 6 }}
      />
    </TouchableOpacity>
  );
};
