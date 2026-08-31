import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { useDutyContext } from '../../context/DutyContext';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { Typography } from '../../constants/typography';
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
  const { isOnline } = useDutyContext();
  const { earningsSummary } = useDeliveryContext();

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  return (
    <View
      style={[
        tw`px-4 pb-3 bg-[#047857] shadow-md z-30`,
        {
          paddingTop: safeTop + 4,
        },
      ]}
    >
      <View style={tw`flex-row items-center justify-between`}>
        {/* Left: Driver Avatar & Info */}
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <View style={tw`relative mr-2.5`}>
            <Image
              source={{
                uri:
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
              }}
              style={tw`w-9 h-9 rounded-full border-2 border-white`}
            />
            <View
              style={[
                tw`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white`,
                { backgroundColor: isOnline ? '#10B981' : '#CBD5E1' },
              ]}
            />
          </View>

          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center`}>
              <Text style={[Typography.cardTitle, { color: '#FFFFFF', marginRight: 4 }]} numberOfLines={1}>
                {user?.name || 'Captain Bipin'}
              </Text>
              <View style={tw`flex-row items-center px-1.5 py-0.2 rounded bg-emerald-800/80 border border-emerald-500/50`}>
                <Ionicons name="star" size={9} color="#FBBF24" style={tw`mr-0.5`} />
                <Text style={[Typography.badge, { color: '#FDE68A' }]}>
                  {user?.rating || '4.9'}
                </Text>
              </View>
            </View>
            <Text style={[Typography.caption, { color: '#D1FAE5' }]}>
              {isOnline ? 'Online • Ready for drops' : 'Offline • Duty paused'}
            </Text>
          </View>
        </View>

        {/* Right: Wallet pill & SOS */}
        <View style={tw`flex-row items-center gap-1.5`}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenWallet}
            style={tw`flex-row items-center px-2.5 py-1.5 rounded-xl bg-emerald-800/90 border border-emerald-600 shadow-sm`}
          >
            <Ionicons name="wallet-outline" size={12} color="#A7F3D0" style={tw`mr-1`} />
            <Text style={[Typography.buttonText, { color: '#FFFFFF' }]}>
              ₹{earningsSummary.todayTotal}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenSOS}
            style={tw`w-8 h-8 rounded-xl bg-rose-600/90 border border-rose-400 items-center justify-center`}
          >
            <Ionicons name="shield-outline" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
