import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useDutyContext } from '../../context/DutyContext';
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
  const safeTop = Math.max(statusBarHeight, insets.top, 16);

  return (
    <View
      style={[
        tw`px-4 pb-2 z-50`,
        {
          paddingTop: safeTop + 6,
          backgroundColor: '#0B1320',
        },
      ]}
    >
      <View style={tw`flex-row items-center justify-between`}>
        {/* Left: Driver Profile */}
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <View style={tw`relative mr-2.5`}>
            <Image
              source={{
                uri:
                  user?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
              }}
              style={[tw`w-10 h-10 rounded-full border-2`, { borderColor: '#10B981' }]}
            />
            <View
              style={[
                tw`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900`,
                { backgroundColor: isOnline ? '#10B981' : '#64748B' },
              ]}
            />
          </View>

          <View style={tw`flex-1`}>
            <Text style={tw`text-sm font-black text-white`} numberOfLines={1}>
              {user?.name || 'Partner Captain'}
            </Text>
            <Text style={tw`text-xs font-semibold text-emerald-400`}>
              {isOnline ? 'Online • On Radar' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Center/Right: Live Earnings Capsule */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenWallet}
          style={tw`flex-row items-center px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 mr-2`}
        >
          <Ionicons name="wallet" size={14} color="#34D399" style={tw`mr-1.5`} />
          <Text style={tw`text-xs font-black text-white`}>
            ₹{earningsSummary.todayTotal}
          </Text>
        </TouchableOpacity>

        {/* SOS Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenSOS}
          style={tw`w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/40 items-center justify-center`}
        >
          <Ionicons name="shield-checkmark" size={16} color="#FB7185" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
