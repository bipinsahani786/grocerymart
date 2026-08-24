import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { useDutyContext } from '../../context/DutyContext';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { Colors } from '../../constants/theme';
import { DutySwitch } from './DutySwitch';
import tw from 'twrnc';

interface PartnerHeaderProps {
  onOpenSOS?: () => void;
  onOpenNotifications?: () => void;
  onOpenWallet?: () => void;
}

export const PartnerHeader: React.FC<PartnerHeaderProps> = ({
  onOpenSOS,
  onOpenNotifications,
  onOpenWallet,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { isOnline, currentHub, batteryLevel } = useDutyContext();
  const { earningsSummary } = useDeliveryContext();

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTopPadding = Math.max(statusBarHeight, insets.top, 20);

  return (
    <LinearGradient
      colors={['#10B981', '#047857']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        tw`px-4 pb-3 shadow-lg`,
        {
          paddingTop: safeTopPadding + 8,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        },
      ]}
    >
      {/* 1. Top Bar: Rider Profile snippet + Wallet Snippet + SOS + Notifications */}
      <View style={tw`flex-row items-center justify-between`}>
        {/* Left: Avatar with Online Indicator & Rider info */}
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <View style={tw`relative mr-2.5`}>
            <Image
              source={{
                uri:
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
              }}
              style={[
                tw`w-11 h-11 rounded-full border-2`,
                { borderColor: '#FFFFFF' },
              ]}
            />
            {/* Live Online Badge Dot */}
            <View
              style={[
                tw`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2`,
                {
                  backgroundColor: isOnline ? '#34D399' : Colors.offline,
                  borderColor: '#047857',
                },
              ]}
            />
          </View>

          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center`}>
              <Text
                style={[tw`text-sm font-black mr-1.5 text-white`]}
                numberOfLines={1}
              >
                {user?.name || 'Partner Captain'}
              </Text>
              <View
                style={[
                  tw`flex-row items-center px-1.5 py-0.5 rounded-md`,
                  { backgroundColor: 'rgba(254, 243, 199, 0.95)' },
                ]}
              >
                <Ionicons name="star" size={10} color={Colors.amberDark} style={tw`mr-0.5`} />
                <Text style={[tw`text-[10px] font-black`, { color: Colors.amberDark }]}>
                  {user?.rating || '4.9'}
                </Text>
              </View>
            </View>

            {/* Rider Tier Tagline */}
            <View style={tw`flex-row items-center mt-0.5`}>
              <Ionicons name="shield-checkmark" size={11} color="#A7F3D0" style={tw`mr-1`} />
              <Text style={[tw`text-[11px] font-bold text-emerald-100`]}>
                {user?.tier || 'Gold'} Partner • ID: {user?.id?.slice(-4) || '4821'}
              </Text>
            </View>
          </View>
        </View>

        {/* Right: Wallet Quick Balance & Action Icons */}
        <View style={tw`flex-row items-center gap-2`}>
          {/* Quick Wallet Pill */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenWallet}
            style={[
              tw`flex-row items-center px-2.5 py-1.5 rounded-xl border`,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
            ]}
          >
            <Ionicons name="wallet-outline" size={13} color="#D1FAE5" style={tw`mr-1`} />
            <Text style={tw`text-xs font-black text-white`}>
              ₹{earningsSummary.walletBalance}
            </Text>
          </TouchableOpacity>

          {/* SOS Emergency Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenSOS}
            style={[
              tw`w-8 h-8 rounded-full justify-center items-center shadow-sm`,
              { backgroundColor: '#FEE2E2' },
            ]}
          >
            <Ionicons name="warning" size={15} color={Colors.danger} />
          </TouchableOpacity>

          {/* Notification Bell */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenNotifications}
            style={[
              tw`w-8 h-8 rounded-full justify-center items-center border`,
              {
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
            ]}
          >
            <Ionicons name="notifications-outline" size={15} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Middle Row: Real Partner App Duty Status Master Bar */}
      <View
        style={[
          tw`flex-row items-center justify-between p-2.5 rounded-2xl border mt-3`,
          {
            backgroundColor: isOnline ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.22)',
            borderColor: isOnline ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.15)',
          },
        ]}
      >
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <View
            style={[
              tw`w-2.5 h-2.5 rounded-full mr-2`,
              { backgroundColor: isOnline ? '#34D399' : '#9CA3AF' },
            ]}
          />
          <View style={tw`flex-1`}>
            <Text style={tw`text-xs font-black tracking-wide text-white`}>
              {isOnline ? 'DUTY ACTIVE • RECEIVING ORDERS' : 'OFF DUTY • PAUSED'}
            </Text>
            <Text
              style={tw`text-[10px] font-semibold mt-0.2 text-emerald-100`}
              numberOfLines={1}
            >
              {isOnline ? 'Allocated queue: Koramangala Hub #04' : 'Go online to receive instant delivery requests'}
            </Text>
          </View>
        </View>

        {/* Master Interactive Switch */}
        <DutySwitch />
      </View>

      {/* 3. Bottom Telemetry Strip: Dark Store Hub, EV Battery & GPS Status */}
      <View
        style={[
          tw`flex-row items-center justify-between mt-2.5 pt-2 border-t`,
          { borderTopColor: 'rgba(255, 255, 255, 0.2)' },
        ]}
      >
        {/* Hub Location */}
        <View style={tw`flex-row items-center`}>
          <Ionicons name="storefront" size={12} color="#93C5FD" style={tw`mr-1`} />
          <Text style={tw`text-[11px] font-bold text-emerald-100`} numberOfLines={1}>
            {currentHub}
          </Text>
        </View>

        {/* Network & Live Dispatch Status */}
        <View style={tw`flex-row items-center`}>
          <Ionicons name="radio" size={12} color="#6EE7B7" style={tw`mr-1`} />
          <Text style={tw`text-[11px] font-bold text-emerald-100`}>
            Network: High Speed
          </Text>
        </View>

        {/* GPS Lock */}
        <View
          style={[
            tw`flex-row items-center px-1.5 py-0.5 rounded border`,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
          ]}
        >
          <Ionicons name="locate" size={10} color="#A7F3D0" style={tw`mr-1`} />
          <Text style={tw`text-[9px] font-black text-white`}>
            GPS 100%
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

