import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../constants/typography';
import tw from 'twrnc';

interface BankPayoutSectionProps {
  bankHolder: string;
  bankAccount: string;
  bankIfsc: string;
  hasBankAccount: boolean;
  onOpenEditProfile: () => void;
}

export const BankPayoutSection: React.FC<BankPayoutSectionProps> = ({
  bankHolder,
  bankAccount,
  bankIfsc,
  hasBankAccount,
  onOpenEditProfile,
}) => {
  return (
    <View style={tw`py-4 border-b border-slate-100`}>
      <Text
        style={[
          Typography.caption,
          { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 },
        ]}
      >
        BANK ACCOUNT & PAYOUTS
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenEditProfile}
        style={tw`flex-row justify-between items-center py-2.5`}
      >
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <Ionicons name="business-outline" size={17} color="#0D9488" style={tw`mr-3`} />
          <View style={tw`flex-1`}>
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
              {bankHolder}
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
              A/C: {bankAccount} • IFSC: {bankIfsc}
            </Text>
          </View>
        </View>
        <View style={tw`flex-row items-center`}>
          <Text
            style={[
              Typography.badge,
              {
                color: hasBankAccount ? '#047857' : '#D97706',
                fontSize: 9.5,
                marginRight: 2,
              },
            ]}
          >
            {hasBankAccount ? 'Verified' : 'Not Added'}
          </Text>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" style={tw`ml-1`} />
        </View>
      </TouchableOpacity>
    </View>
  );
};
