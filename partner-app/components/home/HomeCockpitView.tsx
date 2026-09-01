import React, { useState } from 'react';
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
import { useLanguageContext } from '../../context/LanguageContext';
import { FreeOpenStreetMap } from './FreeOpenStreetMap';
import { HelmetCheckinModal } from './HelmetCheckinModal';
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
  const { t } = useLanguageContext();

  const [showHelmetCheckin, setShowHelmetCheckin] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  // 48% Map / 52% Dashboard split
  const mapHeight = Math.round(screenHeight * 0.48);

  const handleDutyToggle = () => {
    if (!isOnline && !hasCheckedInToday) {
      setShowHelmetCheckin(true);
    } else {
      toggleDuty();
    }
  };

  const handleCheckinSuccess = () => {
    setHasCheckedInToday(true);
    setShowHelmetCheckin(false);
    if (!isOnline) {
      toggleDuty();
    }
  };

  return (
    <View style={tw`flex-1 bg-[#047857]`}>
      {/* ================= 1. EMERALD TOP APP BAR ================= */}
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
            <Text style={[Typography.cardTitle, { color: '#FFFFFF', fontSize: 13 }]} numberOfLines={1}>
              {user?.name || 'Captain Bipin'}
            </Text>
            <View style={tw`flex-row items-center mt-0.5`}>
              <View style={tw`w-1.5 h-1.5 rounded-full bg-emerald-300 mr-1`} />
              <Text style={[Typography.caption, { color: '#D1FAE5', fontSize: 10 }]} numberOfLines={1}>
                {currentHub || t.koramangalaHub}
              </Text>
            </View>
          </View>
        </View>

        {/* Online / Offline Duty Switch */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleDutyToggle}
          style={[
            tw`px-3 py-1.5 rounded-full flex-row items-center border shadow-sm`,
            {
              backgroundColor: isOnline ? '#064E3B' : '#FFFFFF',
              borderColor: isOnline ? '#34D399' : '#CBD5E1',
            },
          ]}
        >
          <View
            style={[
              tw`w-2 h-2 rounded-full mr-1.5`,
              { backgroundColor: isOnline ? '#10B981' : '#94A3B8' },
            ]}
          />
          <Text
            style={[
              Typography.buttonText,
              {
                color: isOnline ? '#34D399' : '#475569',
                fontSize: 10.5,
                fontWeight: '800',
              },
            ]}
          >
            {isOnline ? t.onDuty : t.goOnline}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= 2. LEAFLET GPS MAP (TOP 48%) ================= */}
      <View style={{ height: mapHeight, width: '100%', position: 'relative' }}>
        <FreeOpenStreetMap
          isOnline={isOnline}
          activeOrder={activeOrder}
          currentHub={currentHub}
          onSimulateOrder={triggerIncomingOrderSimulation}
        />
      </View>

      {/* ================= 3. DRIVER DASHBOARD (BOTTOM 52%) ================= */}
      <View
        style={[
          tw`flex-1 bg-white rounded-t-3xl border-t border-slate-200 -mt-4 shadow-2xl p-3.5 z-20 justify-between`,
          {
            paddingBottom: 78 + Math.max(insets.bottom, 12),
          },
        ]}
      >
        {/* Top Grabber */}
        <View style={tw`w-10 h-1 rounded-full bg-slate-200 self-center mb-1`} />

        {/* ACTIVE ORDER BANNER / ONLINE PULSE */}
        {activeOrder ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onOpenActiveTask}
            style={tw`p-2.5 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm flex-row justify-between items-center`}
          >
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <View style={tw`w-7 h-7 rounded-xl bg-emerald-600 items-center justify-center mr-2 shadow-sm`}>
                <Ionicons name="bicycle" size={15} color="#FFFFFF" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[Typography.cardTitle, { color: '#064E3B', fontSize: 11 }]}>
                  {t.activeOrderHeading} • #{activeOrder.orderNumber}
                </Text>
                <Text style={[Typography.caption, { color: '#047857', fontSize: 9.5 }]}>
                  {activeOrder.status === 'EN_ROUTE' ? t.enRouteCustomer : t.atDarkStore}
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-center`}>
              <Text style={[Typography.buttonText, { color: '#047857', fontSize: 10, marginRight: 2 }]}>
                {t.trackOrder}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={tw`p-2 rounded-xl bg-slate-50 border border-slate-200 flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center`}>
              <View style={[tw`w-2 h-2 rounded-full mr-1.5`, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 10, fontWeight: '700' }]}>
                {isOnline ? t.waitingOrders : 'Offline'}
              </Text>
            </View>
            <Text style={[Typography.caption, { color: '#047857', fontSize: 9.5, fontWeight: '800' }]}>
              {isOnline ? t.priorityRadarActive : t.goOnline}
            </Text>
          </View>
        )}

        {/* 3 CLEAN STAT PILLARS */}
        <View style={tw`flex-row gap-2`}>
          {/* Trips Completed */}
          <View style={tw`flex-1 p-2 rounded-xl bg-slate-50 border border-slate-200 items-center`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              {t.tripsDone}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 13, marginTop: 1 }]}>
              {earningsSummary.tripsCount || 14}
            </Text>
          </View>

          {/* Shift Time */}
          <View style={tw`flex-1 p-2 rounded-xl bg-slate-50 border border-slate-200 items-center`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              {t.shiftTime}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 13, marginTop: 1 }]}>
              {formattedShiftTime || '5h 30m'}
            </Text>
          </View>

          {/* COD Cash */}
          <View style={tw`flex-1 p-2 rounded-xl bg-amber-50 border border-amber-200 items-center`}>
            <Text style={[Typography.caption, { color: '#92400E', fontSize: 8.5, fontWeight: '700' }]}>
              {t.codCash}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#B45309', fontSize: 13, marginTop: 1 }]}>
              ₹{earningsSummary.cashCollected}
            </Text>
          </View>
        </View>

        {/* DAILY TARGET QUEST */}
        <View style={tw`p-2.5 rounded-xl bg-slate-50 border border-slate-200`}>
          <View style={tw`flex-row justify-between items-center mb-1`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="trophy-outline" size={12} color="#047857" style={tw`mr-1`} />
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 9.5, fontWeight: '700' }]}>
                {t.dailyQuest}
              </Text>
            </View>
            <Text style={[Typography.badge, { color: '#047857', fontSize: 8.5 }]}>
              {t.questBonus}
            </Text>
          </View>
          <View style={tw`h-1.5 bg-slate-200 rounded-full overflow-hidden`}>
            <View style={[tw`h-full bg-emerald-600 rounded-full`, { width: '70%' }]} />
          </View>
        </View>

        {/* 4 QUICK UTILITY BUTTONS */}
        <View style={tw`flex-row justify-between items-center gap-1.5`}>
          {/* Deposit */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDepositCash}
            style={tw`flex-1 py-2 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center`}
          >
            <Ionicons name="cash-outline" size={13} color="#047857" />
            <Text style={[Typography.caption, { color: '#334155', fontSize: 8.5, fontWeight: '700', marginTop: 1 }]}>
              {t.deposit}
            </Text>
          </TouchableOpacity>

          {/* Safety SOS */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenSupport}
            style={tw`flex-1 py-2 rounded-xl bg-rose-50 border border-rose-200 items-center justify-center`}
          >
            <Ionicons name="shield-outline" size={13} color="#E11D48" />
            <Text style={[Typography.caption, { color: '#9F1239', fontSize: 8.5, fontWeight: '700', marginTop: 1 }]}>
              {t.sos}
            </Text>
          </TouchableOpacity>

          {/* Earnings Wallet */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onViewWallet}
            style={tw`flex-1 py-2 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center`}
          >
            <Ionicons name="wallet-outline" size={13} color="#047857" />
            <Text style={[Typography.caption, { color: '#334155', fontSize: 8.5, fontWeight: '700', marginTop: 1 }]}>
              {t.wallet}
            </Text>
          </TouchableOpacity>

          {/* Test Order */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={triggerIncomingOrderSimulation}
            style={tw`flex-1 py-2 rounded-xl bg-emerald-600 border border-emerald-500 items-center justify-center shadow-sm`}
          >
            <Ionicons name="flash" size={13} color="#FFFFFF" />
            <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 8.5, fontWeight: '800', marginTop: 1 }]}>
              {t.testOrder}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Safety & Helmet Check-In Modal */}
      <HelmetCheckinModal
        visible={showHelmetCheckin}
        onClose={() => setShowHelmetCheckin(false)}
        onCheckinSuccess={handleCheckinSuccess}
      />
    </View>
  );
};
