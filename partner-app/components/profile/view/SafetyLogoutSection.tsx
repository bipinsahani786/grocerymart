import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../constants/typography';
import tw from 'twrnc';

interface SafetyLogoutSectionProps {
  t: Record<string, string>;
  onOpenSOS: () => void;
  onOpenLogoutConfirm: () => void;
}

export const SafetyLogoutSection: React.FC<SafetyLogoutSectionProps> = ({
  t,
  onOpenSOS,
  onOpenLogoutConfirm,
}) => {
  return (
    <View style={tw`py-4`}>
      <Text
        style={[
          Typography.caption,
          { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
        ]}
      >
        {t.safetyAccount || 'SAFETY & ACCOUNT'}
      </Text>

      {/* 24/7 SOS */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenSOS}
        style={tw`flex-row items-center justify-between py-2.5`}
      >
        <View style={tw`flex-row items-center`}>
          <Ionicons name="shield-outline" size={17} color="#E11D48" style={tw`mr-3`} />
          <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
            {t.safetySOS || 'Emergency Support & SOS (24/7)'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenLogoutConfirm}
        style={tw`flex-row items-center justify-between py-2.5 border-t border-slate-50`}
      >
        <View style={tw`flex-row items-center`}>
          <Ionicons name="log-out-outline" size={17} color="#DC2626" style={tw`mr-3`} />
          <Text style={[Typography.bodyBold, { color: '#DC2626', fontSize: 12 }]}>
            {t.logout || 'Log Out'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
      </TouchableOpacity>
    </View>
  );
};
