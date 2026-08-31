import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useDutyContext } from '../../context/DutyContext';
import { FreeOpenStreetMap } from './FreeOpenStreetMap';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface HomeCockpitViewProps {
  onViewWallet: () => void;
  onOpenActiveTask: () => void;
  onDepositCash: () => void;
  onOpenSupport: () => void;
}

export const HomeCockpitView: React.FC<HomeCockpitViewProps> = ({
  onViewWallet,
  onOpenActiveTask,
  onDepositCash,
  onOpenSupport,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
  const { earningsSummary, activeOrder, triggerIncomingOrderSimulation } = useDeliveryContext();
  const { isOnline, toggleDuty, currentHub, formattedShiftTime } = useDutyContext();

  const screenHeight = Dimensions.get('window').height;
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  // 48% Map / 52% Dashboard split
  const mapHeight = Math.round(screenHeight * 0.48);

  return (
    <View style={tw`flex-1 bg-[#047857]`}>
      {/* ================= 1. EMERALD TOP APP BAR (MATCHED WITH NAVBAR) ================= */}
      <View
        style={[
          tw`px-4 pb-3 bg-[#047857] flex-row items-center justify-between z-30 shadow-md`,
          {
            paddingTop: safeTop + 4,
          },
        ]}
      >
        {/* Driver Avatar & Name */}
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
            <Text style={[Typography.caption, { color: '#D1FAE5' }]} numberOfLines={1}>
              {isOnline ? `Zone: ${currentHub}` : 'Duty Paused'}
            </Text>
          </View>
        </View>

        {/* 1-Tap Online/Offline Switch */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggleDuty}
          style={[
            tw`px-3 py-1.5 rounded-xl flex-row items-center mr-1.5 shadow-sm border`,
            {
              backgroundColor: isOnline ? '#DC2626' : '#10B981',
              borderColor: isOnline ? '#EF4444' : '#34D399',
            },
          ]}
        >
          <Ionicons
            name={isOnline ? 'power' : 'radio-button-on'}
            size={11}
            color="#FFFFFF"
            style={tw`mr-1`}
          />
          <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 11 }]}>
            {isOnline ? 'Offline' : 'Online'}
          </Text>
        </TouchableOpacity>

        {/* Today's Earnings Pill */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onViewWallet}
          style={tw`flex-row items-center px-2.5 py-1.5 rounded-xl bg-emerald-800/90 border border-emerald-600 shadow-sm mr-1`}
        >
          <Ionicons name="wallet-outline" size={11} color="#A7F3D0" style={tw`mr-1`} />
          <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 11 }]}>
            ₹{earningsSummary.todayTotal}
          </Text>
        </TouchableOpacity>

        {/* SOS Action */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenSupport}
          style={tw`w-8 h-8 rounded-xl bg-rose-600/90 border border-rose-400 items-center justify-center`}
        >
          <Ionicons name="shield-outline" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* ================= 2. TOP HALF: REAL LEAFLET OPENSTREETMAP ================= */}
      <View style={{ height: mapHeight, width: '100%' }}>
        <FreeOpenStreetMap
          isOnline={isOnline}
          activeOrder={activeOrder}
          currentHub={currentHub}
          onSimulateOrder={triggerIncomingOrderSimulation}
        />
      </View>

      {/* ================= 3. BOTTOM HALF: CLEAN & AIRY DASHBOARD ================= */}
      <View
        style={[
          tw`flex-1 p-4 justify-between bg-white border-t border-slate-100 shadow-lg rounded-t-3xl -mt-3`,
          {
            paddingBottom: 78 + Math.max(insets.bottom, 12),
          },
        ]}
      >
        {/* Grabber Indicator */}
        <View style={tw`w-10 h-1 rounded-full bg-slate-200 self-center`} />

        {/* ACTIVE ORDER BANNER OR STATUS PILL */}
        {activeOrder ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onOpenActiveTask}
            style={tw`p-3 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm`}
          >
            <View style={tw`flex-row justify-between items-center mb-1`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-2 h-2 rounded-full bg-emerald-600 mr-1.5`} />
                <Text style={[Typography.caption, { color: '#064E3B', fontWeight: '800' }]}>
                  Order #{activeOrder.orderNumber}
                </Text>
              </View>
              <Text style={[Typography.caption, { color: '#047857', fontWeight: '800' }]}>
                ₹{activeOrder.totalPayout} Payout
              </Text>
            </View>

            <Text style={[Typography.bodyBold, { color: '#0F172A' }]} numberOfLines={1}>
              🏬 {activeOrder.storeName} ➔ 🏠 {activeOrder.customerAddress}
            </Text>

            <View style={tw`flex-row justify-between items-center mt-1.5 pt-1.5 border-t border-emerald-200`}>
              <Text style={[Typography.caption, { color: '#047857' }]}>
                {activeOrder.items?.length || 4} items to deliver
              </Text>
              <View style={tw`flex-row items-center px-2 py-0.5 rounded-lg bg-emerald-700`}>
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 10, marginRight: 2 }]}>
                  Resume Route
                </Text>
                <Ionicons name="arrow-forward" size={10} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={tw`p-3 rounded-2xl bg-slate-50 border border-slate-200 flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <View style={[tw`w-2.5 h-2.5 rounded-full mr-2`, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
              <Text style={[Typography.cardTitle, { color: '#0F172A' }]}>
                {isOnline ? 'Online • Ready for orders' : 'Duty Off • Tap Online to start'}
              </Text>
            </View>

            {isOnline && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={triggerIncomingOrderSimulation}
                style={tw`px-2.5 py-1 rounded-xl bg-emerald-600 shadow-sm flex-row items-center`}
              >
                <Ionicons name="flash" size={10} color="#FFFFFF" style={tw`mr-1`} />
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 10 }]}>
                  + Test
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 3 CLEAN STAT PILLARS */}
        <View style={tw`flex-row justify-between items-center gap-2`}>
          <View style={tw`flex-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 items-center`}>
            <Text style={[Typography.caption, { color: '#94A3B8', marginBottom: 1 }]}>Trips</Text>
            <Text style={[Typography.statNumber, { color: '#0F172A' }]}>{earningsSummary.tripsCount} Done</Text>
          </View>

          <View style={tw`flex-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 items-center`}>
            <Text style={[Typography.caption, { color: '#94A3B8', marginBottom: 1 }]}>Shift</Text>
            <Text style={[Typography.statNumber, { color: '#0F172A' }]}>{formattedShiftTime}</Text>
          </View>

          <View style={tw`flex-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-200 items-center`}>
            <Text style={[Typography.caption, { color: '#D97706', marginBottom: 1 }]}>COD Cash</Text>
            <Text style={[Typography.statNumber, { color: '#D97706' }]}>₹{earningsSummary.cashCollected}</Text>
          </View>
        </View>

        {/* DAILY QUEST PROGRESS */}
        <View style={tw`p-2.5 rounded-2xl bg-slate-50 border border-slate-200`}>
          <View style={tw`flex-row justify-between items-center mb-1`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="flame" size={13} color="#D97706" style={tw`mr-1`} />
              <Text style={[Typography.caption, { color: '#0F172A', fontWeight: '800' }]}>
                Daily Quest: 14/20 Orders
              </Text>
            </View>
            <Text style={[Typography.badge, { color: '#B45309' }]}>
              +₹250 Bonus
            </Text>
          </View>
          <View style={tw`h-1.5 bg-slate-200 rounded-full overflow-hidden`}>
            <View style={[tw`h-full bg-amber-500 rounded-full`, { width: '70%' }]} />
          </View>
        </View>

        {/* 4 QUICK UTILITY ICONS */}
        <View style={tw`flex-row justify-between items-center gap-2`}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDepositCash}
            style={tw`flex-1 p-2 rounded-2xl bg-slate-50 border border-slate-200 items-center`}
          >
            <Ionicons name="cash-outline" size={16} color="#047857" style={tw`mb-0.5`} />
            <Text style={[Typography.caption, { color: '#334155', fontSize: 10, fontWeight: '700' }]}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenSupport}
            style={tw`flex-1 p-2 rounded-2xl bg-slate-50 border border-slate-200 items-center`}
          >
            <Ionicons name="storefront-outline" size={16} color="#2563EB" style={tw`mb-0.5`} />
            <Text style={[Typography.caption, { color: '#334155', fontSize: 10, fontWeight: '700' }]}>Hubs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onViewWallet}
            style={tw`flex-1 p-2 rounded-2xl bg-slate-50 border border-slate-200 items-center`}
          >
            <Ionicons name="wallet-outline" size={16} color="#D97706" style={tw`mb-0.5`} />
            <Text style={[Typography.caption, { color: '#334155', fontSize: 10, fontWeight: '700' }]}>Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenSupport}
            style={tw`flex-1 p-2 rounded-2xl bg-slate-50 border border-slate-200 items-center`}
          >
            <Ionicons name="shield-outline" size={16} color="#E11D48" style={tw`mb-0.5`} />
            <Text style={[Typography.caption, { color: '#334155', fontSize: 10, fontWeight: '700' }]}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
