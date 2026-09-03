import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
  Animated,
  PanResponder,
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
  const {
    isOnline,
    toggleDuty,
    currentHub,
    formattedShiftTime,
    liveAddress,
    isFetchingLocation,
    refreshLocation,
    updateLocationFromCoords,
  } = useDutyContext();

  const { t } = useLanguageContext();

  const [showHelmetCheckin, setShowHelmetCheckin] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);

  // Bottom Sheet Slider Collapse / Expand State & Gesture Animation (DEFAULT OPEN)
  const [isExpanded, setIsExpanded] = useState(true);
  const slideAnim = useRef(new Animated.Value(1)).current; // 1 = Expanded (sheet open by default)


  const screenHeight = Dimensions.get('window').height;
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  const toggleExpand = () => {
    const nextState = !isExpanded;
    setIsExpanded(nextState);
    Animated.spring(slideAnim, {
      toValue: nextState ? 1 : 0,
      useNativeDriver: false,
      bounciness: 5,
      speed: 14,
    }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -25) {
          // Swiped UP -> Expand sheet
          setIsExpanded(true);
          Animated.spring(slideAnim, { toValue: 1, useNativeDriver: false, bounciness: 5 }).start();
        } else if (gestureState.dy > 25) {
          // Swiped DOWN -> Collapse sheet
          setIsExpanded(false);
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: false, bounciness: 5 }).start();
        }
      },
    })
  ).current;

  // Interpolated Map & Sheet heights
  const animatedMapHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.round(screenHeight * 0.67), Math.round(screenHeight * 0.50)],
  });





  const handleDutyToggle = () => {
    toggleDuty();
  };


  const handleCheckinSuccess = () => {
    setHasCheckedInToday(true);
    setShowHelmetCheckin(false);
    if (!isOnline) {
      toggleDuty();
    }
  };


  return (
    <View style={tw`flex-1 bg-slate-100`}>
      {/* ================= 1. EMERALD TOP APP BAR WITH LIVE LOCATION ================= */}
      <View
        style={[
          tw`px-4 pb-2.5 bg-[#047857] z-30 shadow-md`,
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




        {/* Row 1: Driver Avatar, Info & Duty Switch */}
        <View style={tw`flex-row items-center justify-between`}>

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
                <Text style={[Typography.cardTitle, { color: '#FFFFFF', fontSize: 13, marginRight: 2 }]} numberOfLines={1}>
                  {user?.name || 'Captain Bipin'}
                </Text>
                <View style={tw`px-1.5 py-0.2 rounded bg-emerald-800 border border-emerald-600`}>
                  <Text style={[Typography.badge, { color: '#FDE68A', fontSize: 8.5 }]}>
                    ★ {user?.rating || '4.9'}
                  </Text>
                </View>
              </View>
              <Text style={[Typography.captionItalic, { color: '#D1FAE5', fontSize: 9.5, marginTop: 1 }]}>
                {isOnline ? 'Online • Ready for drops' : 'Offline • Duty paused'}
              </Text>
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
                  fontWeight: '700',
                },
              ]}
            >
              {isOnline ? t.onDuty : t.goOnline}
            </Text>
          </TouchableOpacity>
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
                <Text style={[Typography.caption, { color: '#6EE7B7', fontSize: 8.5, fontWeight: '700', letterSpacing: 0.4 }]}>
                  CURRENT LIVE LOCATION
                </Text>
                <View style={tw`w-1.5 h-1.5 rounded-full bg-emerald-400 ml-1`} />
              </View>
              <Text style={[Typography.bodyMedium, { color: '#FFFFFF', fontSize: 11, fontWeight: '500', lineHeight: 15 }]}>
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

      {/* ================= 2. LEAFLET GPS MAP (DYNAMIC HEIGHT) ================= */}
      <Animated.View style={{ height: animatedMapHeight, width: '100%', position: 'relative' }}>
        <FreeOpenStreetMap
          isOnline={isOnline}
          activeOrder={activeOrder}
          currentHub={currentHub}
          onSimulateOrder={triggerIncomingOrderSimulation}
          onMapMoveEnd={(coords) => updateLocationFromCoords(coords.lat, coords.lng)}
        />

      </Animated.View>

      {/* ================= 3. INTERACTIVE SLIDING BOTTOM SHEET DASHBOARD ================= */}
      <Animated.View
        style={[
          tw`bg-white rounded-t-3xl border-t border-slate-200 -mt-4 shadow-2xl px-3.5 pt-1.5 z-20 justify-start gap-2 flex-1`,
          {
            paddingBottom: 72 + Math.max(insets.bottom, 8),
          },
        ]}
      >


        {/* Minimalist Top Drag Handle Pill Bar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleExpand}
          {...panResponder.panHandlers}
          style={tw`py-1 items-center justify-center self-center w-full`}
        >
          <View style={tw`w-12 h-1.5 rounded-full bg-slate-300`} />
        </TouchableOpacity>

        {/* ACTIVE ORDER BANNER / ONLINE PULSE */}
        {activeOrder ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onOpenActiveTask}
            style={tw`p-2 rounded-xl bg-emerald-50 border border-emerald-300 shadow-sm flex-row justify-between items-center`}
          >
            <View style={tw`flex-row items-center flex-1 mr-2`}>
              <View style={tw`w-6.5 h-6.5 rounded-lg bg-emerald-600 items-center justify-center mr-2 shadow-sm`}>
                <Ionicons name="bicycle" size={14} color="#FFFFFF" />
              </View>
              <View style={tw`flex-1`}>
                <Text style={[Typography.cardTitle, { color: '#064E3B', fontSize: 10.5 }]}>
                  {t.activeOrderHeading} • #{activeOrder.orderNumber}
                </Text>
                <Text style={[Typography.caption, { color: '#047857', fontSize: 9 }]}>
                  {activeOrder.status === 'EN_ROUTE' ? t.enRouteCustomer : t.atDarkStore}
                </Text>
              </View>
            </View>

            <View style={tw`flex-row items-center`}>
              <Text style={[Typography.buttonText, { color: '#047857', fontSize: 9.5, marginRight: 2 }]}>
                {t.trackOrder}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={toggleExpand}
            style={tw`p-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-200 flex-row justify-between items-center`}
          >
            <View style={tw`flex-row items-center`}>
              <View style={[tw`w-2 h-2 rounded-full mr-1.5`, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 9.5, fontWeight: '700' }]}>
                {isOnline ? t.waitingOrders : 'Offline'}
              </Text>
            </View>
            <Text style={[Typography.caption, { color: '#047857', fontSize: 9, fontWeight: '800' }]}>
              {isOnline ? t.priorityRadarActive : t.goOnline}
            </Text>
          </TouchableOpacity>
        )}

        {/* EXPANDED CONTENT: 3 STAT PILLARS, DAILY QUEST & QUICK UTILITIES */}
        {isExpanded && (
          <>
            {/* 3 CLEAN STAT PILLARS */}
            <View style={tw`flex-row gap-1.5`}>
              {/* Trips Completed */}
              <View style={tw`flex-1 p-1.5 rounded-xl bg-slate-50 border border-slate-200 items-center`}>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 8, fontWeight: '700' }]}>
                  {t.tripsDone}
                </Text>
                <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 12, marginTop: 0.5 }]}>
                  {earningsSummary.tripsCount || 14}
                </Text>
              </View>

              {/* Shift Time */}
              <View style={tw`flex-1 p-1.5 rounded-xl bg-slate-50 border border-slate-200 items-center`}>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 8, fontWeight: '700' }]}>
                  {t.shiftTime}
                </Text>
                <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 12, marginTop: 0.5 }]}>
                  {formattedShiftTime || '5h 30m'}
                </Text>
              </View>

              {/* COD Cash */}
              <View style={tw`flex-1 p-1.5 rounded-xl bg-amber-50 border border-amber-200 items-center`}>
                <Text style={[Typography.caption, { color: '#92400E', fontSize: 8, fontWeight: '700' }]}>
                  {t.codCash}
                </Text>
                <Text style={[Typography.amountLarge, { color: '#B45309', fontSize: 12, marginTop: 0.5 }]}>
                  ₹{earningsSummary.cashCollected}
                </Text>
              </View>
            </View>

            {/* DAILY TARGET QUEST */}
            <View style={tw`p-2 rounded-xl bg-slate-50 border border-slate-200`}>
              <View style={tw`flex-row justify-between items-center mb-1`}>
                <View style={tw`flex-row items-center`}>
                  <Ionicons name="trophy-outline" size={11} color="#047857" style={tw`mr-1`} />
                  <Text style={[Typography.caption, { color: '#0F172A', fontSize: 9, fontWeight: '700' }]}>
                    {t.dailyQuest}
                  </Text>
                </View>
                <Text style={[Typography.badge, { color: '#047857', fontSize: 8 }]}>
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
                style={tw`flex-1 py-1.5 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center`}
              >
                <Ionicons name="cash-outline" size={12} color="#047857" />
                <Text style={[Typography.caption, { color: '#334155', fontSize: 8, fontWeight: '700', marginTop: 0.5 }]}>
                  {t.deposit}
                </Text>
              </TouchableOpacity>

              {/* Safety SOS */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onOpenSupport}
                style={tw`flex-1 py-1.5 rounded-xl bg-rose-50 border border-rose-200 items-center justify-center`}
              >
                <Ionicons name="shield-outline" size={12} color="#E11D48" />
                <Text style={[Typography.caption, { color: '#9F1239', fontSize: 8, fontWeight: '700', marginTop: 0.5 }]}>
                  {t.sos}
                </Text>
              </TouchableOpacity>

              {/* Earnings Wallet */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={onViewWallet}
                style={tw`flex-1 py-1.5 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center`}
              >
                <Ionicons name="wallet-outline" size={12} color="#047857" />
                <Text style={[Typography.caption, { color: '#334155', fontSize: 8, fontWeight: '700', marginTop: 0.5 }]}>
                  {t.wallet}
                </Text>
              </TouchableOpacity>

              {/* Test Order */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={triggerIncomingOrderSimulation}
                style={tw`flex-1 py-1.5 rounded-xl bg-emerald-600 border border-emerald-500 items-center justify-center shadow-sm`}
              >
                <Ionicons name="flash" size={12} color="#FFFFFF" />
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 8, fontWeight: '800', marginTop: 0.5 }]}>
                  {t.testOrder}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </Animated.View>

      {/* Daily Safety & Helmet Check-In Modal */}
      <HelmetCheckinModal
        visible={showHelmetCheckin}
        onClose={() => setShowHelmetCheckin(false)}
        onCheckinSuccess={handleCheckinSuccess}
      />
    </View>
  );
};

