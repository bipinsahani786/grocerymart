import React from 'react';
import { View, Text, TouchableOpacity, Image, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { useDutyContext } from '../../context/DutyContext';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useSettingsContext } from '../../context/SettingsContext';
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
  const { isOnline, liveAddress, isFetchingLocation, refreshLocation } = useDutyContext();
  const { earningsSummary } = useDeliveryContext();
  const { settings } = useSettingsContext();

  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  return (
    <View
      style={[
        tw`px-4 pb-2.5 bg-[#047857] shadow-md z-30`,
        {
          paddingTop: safeTop + 4,
        },
      ]}
    >
      {/* Centered Brand Header (Clean Professional Design) */}
      <View style={tw`flex-row items-center justify-center mb-2.5`}>
        <Image
          source={require('../../assets/images/zytrixon.png')}
          style={[tw`w-6 h-6 mr-2`, { tintColor: '#FFFFFF' }]}
          resizeMode="contain"
        />

        <Text style={[Typography.cardTitle, { color: '#FFFFFF', fontSize: 15, fontWeight: '900', letterSpacing: 0.5 }]}>
          GroceryMart <Text style={{ color: '#FDE68A', fontWeight: '800' }}>Delivery</Text>
        </Text>
      </View>



      {/* Row 1: Profile & Action Pills */}
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
            <View style={tw`flex-row items-center flex-wrap gap-1`}>
              <Text style={[Typography.cardTitle, { color: '#FFFFFF', marginRight: 2 }]} numberOfLines={1}>
                {user?.name || 'Captain Bipin'}
              </Text>
              <View style={tw`flex-row items-center px-1.5 py-0.2 rounded bg-emerald-800/80 border border-emerald-500/50`}>
                <Ionicons name="star" size={9} color="#FBBF24" style={tw`mr-0.5`} />
                <Text style={[Typography.badge, { color: '#FDE68A' }]}>
                  {user?.rating || '4.9'}
                </Text>
              </View>
              {settings.batterySaver && (
                <View style={tw`flex-row items-center px-1.5 py-0.2 rounded bg-amber-500/90 border border-amber-300`}>
                  <Ionicons name="battery-charging" size={9} color="#FFFFFF" style={tw`mr-0.5`} />
                  <Text style={tw`text-[9px] font-extrabold text-white`}>SAVER ⚡</Text>
                </View>
              )}
            </View>
            <Text style={[Typography.caption, { color: '#D1FAE5' }]}>
              {isOnline
                ? settings.batterySaver
                  ? 'Online • GPS 15s Battery Saver'
                  : 'Online • Ready for drops'
                : 'Offline • Duty paused'}
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

      {/* Row 2: Live Location Address Bar */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={refreshLocation}
        style={tw`mt-2 px-2.5 py-2 rounded-xl bg-emerald-800/90 border border-emerald-600 flex-row items-center justify-between shadow-sm`}
      >
        <View style={tw`flex-row items-start flex-1 mr-2`}>
          <View style={tw`w-5 h-5 rounded-full bg-emerald-700 items-center justify-center mr-2 mt-0.5 border border-emerald-400/40`}>
            <Ionicons name="location" size={12} color="#34D399" />
          </View>
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center mb-0.5`}>
              <Text style={[Typography.caption, { color: '#6EE7B7', fontSize: 8, fontWeight: '900', letterSpacing: 0.4 }]}>
                CURRENT LIVE LOCATION
              </Text>
              <View style={tw`w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1`} />
            </View>
            <Text style={[Typography.caption, { color: '#FFFFFF', fontSize: 11, fontWeight: '700', lineHeight: 15 }]}>
              {liveAddress}
            </Text>
          </View>
        </View>

        <View style={tw`flex-row items-center bg-emerald-900/80 px-2 py-1 rounded border border-emerald-500/40 self-start mt-0.5`}>
          <Ionicons
            name={isFetchingLocation ? 'sync' : 'navigate'}
            size={10}
            color="#A7F3D0"
            style={tw`mr-1`}
          />
          <Text style={tw`text-[8.5px] font-bold text-emerald-200`}>
            {isFetchingLocation ? 'GPS...' : 'GPS Live'}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};
