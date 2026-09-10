import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../../constants/typography';
import tw from 'twrnc';

interface ProfileHeroHeaderProps {
  currentAvatar: string;
  realName: string;
  realRating: string;
  partnerId: string;
  realPhone: string;
  realHub: string;
  realDeliveries: number;
  onTimeRate: number;
  partnerTier: string;
  t: Record<string, string>;
  onOpenSettings: () => void;
  onOpenAvatarPicker: () => void;
  onOpenEditProfile: () => void;
}

export const ProfileHeroHeader: React.FC<ProfileHeroHeaderProps> = ({
  currentAvatar,
  realName,
  realRating,
  partnerId,
  realPhone,
  realHub,
  realDeliveries,
  onTimeRate,
  partnerTier,
  t,
  onOpenSettings,
  onOpenAvatarPicker,
  onOpenEditProfile,
}) => {
  return (
    <View style={tw`items-center pb-5 border-b border-slate-100 relative`}>
      {/* Top Right Floating Settings Shortcut Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onOpenSettings}
        style={tw`absolute top-0 right-0 w-8 h-8 rounded-full bg-slate-100 items-center justify-center`}
      >
        <Ionicons name="settings-outline" size={16} color="#334155" />
      </TouchableOpacity>

      {/* Avatar with Camera Overlay */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpenAvatarPicker}
        style={tw`relative mb-3`}
      >
        <Image
          source={{ uri: currentAvatar }}
          style={tw`w-22 h-22 rounded-full border-2 border-emerald-500 shadow-sm`}
        />

        {/* Camera Change Action Pill */}
        <View
          style={tw`absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 border-2 border-white items-center justify-center shadow-md`}
        >
          <Ionicons name="camera" size={13} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Name & Hub (Real DB Data) */}
      <View style={tw`items-center`}>
        <View style={tw`flex-row items-center gap-1.5`}>
          <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 17, fontWeight: '900' }]}>
            {realName}
          </Text>
          <View style={tw`px-1.5 py-0.2 rounded bg-amber-50 border border-amber-200`}>
            <Text style={[Typography.badge, { color: '#B45309', fontSize: 9.5, fontWeight: '800' }]}>
              ★ {realRating}
            </Text>
          </View>
        </View>

        <Text style={[Typography.caption, { color: '#64748B', fontSize: 11, marginTop: 2 }]}>
          Partner ID: {partnerId} • +91 {realPhone}
        </Text>
        <Text style={[Typography.caption, { color: '#047857', fontSize: 11, fontWeight: '700', marginTop: 2 }]}>
          📍 {realHub}
        </Text>
      </View>

      {/* 3 Inline Telemetry Metrics (Real DB Data) */}
      <View style={tw`flex-row justify-center items-center gap-6 mt-4 pt-4 border-t border-slate-100 w-full`}>
        <View style={tw`items-center`}>
          <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 15, fontWeight: '900' }]}>
            {realDeliveries}
          </Text>
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
            {t.lifetimeTrips || 'Lifetime Trips'}
          </Text>
        </View>

        <View style={tw`w-px h-6 bg-slate-200`} />

        <View style={tw`items-center`}>
          <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 15, fontWeight: '900' }]}>
            {onTimeRate}%
          </Text>
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
            {t.onTimeRate || 'On-Time Rate'}
          </Text>
        </View>

        <View style={tw`w-px h-6 bg-slate-200`} />

        <View style={tw`items-center`}>
          <Text style={[Typography.amountLarge, { color: '#D97706', fontSize: 15, fontWeight: '900' }]}>
            {partnerTier}
          </Text>
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
            {t.partnerTier || 'Tier Status'}
          </Text>
        </View>
      </View>

      {/* Edit Profile Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpenEditProfile}
        style={tw`mt-3.5 w-full py-2.5 rounded-xl bg-slate-50 border border-slate-200 flex-row items-center justify-center`}
      >
        <Ionicons name="create-outline" size={15} color="#0F172A" style={tw`mr-1.5`} />
        <Text style={tw`text-xs font-black text-slate-800 tracking-wide`}>
          EDIT PROFILE & KYC DETAILS
        </Text>
      </TouchableOpacity>
    </View>
  );
};
