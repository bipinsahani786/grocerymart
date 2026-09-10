import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../constants/typography';
import tw from 'twrnc';

interface PersonalResidenceSectionProps {
  cityPincode: string;
  emergencyContact: string;
  bloodGroup: string;
  realEmail: string;
  onOpenEditProfile: () => void;
}

export const PersonalResidenceSection: React.FC<PersonalResidenceSectionProps> = ({
  cityPincode,
  emergencyContact,
  bloodGroup,
  realEmail,
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
        RESIDENCE & EMERGENCY CONTACT
      </Text>

      {/* Operating Area */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenEditProfile}
        style={tw`flex-row justify-between items-center py-2.5`}
      >
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <Ionicons name="home-outline" size={17} color="#475569" style={tw`mr-3`} />
          <View style={tw`flex-1`}>
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
              Operating Area
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
              {cityPincode}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
      </TouchableOpacity>

      {/* Emergency Contact & Blood Group */}
      <View style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}>
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <Ionicons name="call-outline" size={17} color="#DC2626" style={tw`mr-3`} />
          <View style={tw`flex-1`}>
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
              Emergency Contact & Blood Group
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
              Contact: {emergencyContact} • Group: {bloodGroup}
            </Text>
          </View>
        </View>
      </View>

      {/* Email Address (Blank by default, edited by rider) */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onOpenEditProfile}
        style={tw`flex-row justify-between items-center py-2.5 border-t border-slate-50`}
      >
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <Ionicons name="mail-outline" size={17} color="#2563EB" style={tw`mr-3`} />
          <View style={tw`flex-1`}>
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
              Email Address
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
              {realEmail ? realEmail : 'Not added (Optional) • Tap to add'}
            </Text>
          </View>
        </View>
        <View style={tw`flex-row items-center`}>
          <Text
            style={[
              Typography.badge,
              {
                color: realEmail ? '#047857' : '#94A3B8',
                fontSize: 9.5,
                marginRight: 2,
              },
            ]}
          >
            {realEmail ? 'Linked' : 'Not Added'}
          </Text>
          <Ionicons name="chevron-forward" size={13} color="#CBD5E1" style={tw`ml-1`} />
        </View>
      </TouchableOpacity>
    </View>
  );
};
