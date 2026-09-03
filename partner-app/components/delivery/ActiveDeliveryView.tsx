import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Dimensions,
  Animated,
  PanResponder,
  Image,
  StatusBar as RNStatusBar,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { FreeOpenStreetMap } from '../home/FreeOpenStreetMap';
import { DeliveryVerifyModal } from './DeliveryVerifyModal';
import { OrderSuccessModal } from './OrderSuccessModal';
import { QuickChatModal } from './QuickChatModal';
import { ProofOfDeliveryModal } from './ProofOfDeliveryModal';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface ActiveDeliveryViewProps {
  onContactSupport: () => void;
  onFindNewOrders: () => void;
}

export const ActiveDeliveryView: React.FC<ActiveDeliveryViewProps> = ({
  onContactSupport,
  onFindNewOrders,
}) => {
  const insets = useSafeAreaInsets();
  const {
    activeOrder,
    updateActiveOrderStatus,
    toggleItemScanned,
    completeActiveDelivery,
  } = useDeliveryContext();

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const statusBarHeight = Platform.OS === 'android' ? (RNStatusBar.currentHeight || 0) : insets.top;
  const safeTop = Math.max(statusBarHeight, insets.top, 14);

  // Slider Drawer Animation State (DEFAULT OPEN)
  const [isExpanded, setIsExpanded] = useState(true);
  const slideAnim = useRef(new Animated.Value(1)).current;


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
          setIsExpanded(true);
          Animated.spring(slideAnim, { toValue: 1, useNativeDriver: false, bounciness: 5 }).start();
        } else if (gestureState.dy > 25) {
          setIsExpanded(false);
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: false, bounciness: 5 }).start();
        }
      },
    })
  ).current;

  // Dynamic Map height: Collapsed ~48%, Expanded ~22% (plenty room for card)
  const animatedMapHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Math.round(screenHeight * 0.48), Math.round(screenHeight * 0.22)],
  });

  if (!activeOrder) {
    return (
      <View style={tw`flex-1 bg-slate-100`}>
        {/* Emerald Green Thin Top Header Bar for Status Bar Alignment */}
        <View
          style={[
            tw`px-4 pb-2.5 bg-[#047857] z-30 shadow-md flex-row items-center justify-between`,
            {
              paddingTop: safeTop + 4,
            },
          ]}
        >
          <View style={tw`flex-row items-center`}>
            <Ionicons name="bicycle" size={16} color="#34D399" style={tw`mr-2`} />
            <Text style={[Typography.cardTitle, { color: '#FFFFFF', fontSize: 13, fontWeight: '800' }]}>
              DELIVERY COCKPIT
            </Text>
          </View>
          <View style={tw`px-2 py-0.5 rounded-full bg-emerald-800 border border-emerald-600`}>
            <Text style={[Typography.badge, { color: '#A7F3D0', fontSize: 8.5, fontWeight: '800' }]}>
              STANDBY
            </Text>
          </View>
        </View>

        {/* Center Empty State View */}
        <View style={tw`flex-1 p-6 items-center justify-center bg-white`}>
          <View style={tw`w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 items-center justify-center mb-3 shadow-sm`}>
            <Ionicons name="bicycle-outline" size={28} color="#047857" />
          </View>
          <Text style={[Typography.sectionTitle, { color: '#0F172A', marginBottom: 4 }]}>
            No Active Delivery Right Now
          </Text>
          <Text style={[Typography.caption, { color: '#64748B', textAlign: 'center', marginBottom: 16 }]}>
            You are online and ready to receive fresh grocery delivery requests.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onFindNewOrders}
            style={tw`px-4 py-2.5 rounded-xl bg-emerald-600 shadow-sm flex-row items-center`}
          >
            <Ionicons name="map-outline" size={14} color="#FFFFFF" style={tw`mr-1.5`} />
            <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 11 }]}>
              Go to Live Map
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  const isAtStore = activeOrder.status === 'AT_STORE';
  const isEnRoute = activeOrder.status === 'EN_ROUTE';
  const allScanned = activeOrder.items.every((it) => it.scanned);

  const handleCall = (phoneNumber: string = '+919876543210') => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => {});
  };

  const handleOpenNavigation = () => {
    const query = encodeURIComponent(
      isEnRoute ? activeOrder.customerAddress : activeOrder.storeAddress
    );
    const url = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
    });
    if (url) Linking.openURL(url).catch(() => {});
  };

  const handleScanAll = () => {
    activeOrder.items.forEach((item) => {
      if (!item.scanned) {
        toggleItemScanned(item.id);
      }
    });
  };

  const handleVerifySuccess = () => {
    setShowVerifyModal(false);
    setShowProofModal(false);
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    completeActiveDelivery();
    onFindNewOrders();
  };

  return (
    <View style={tw`flex-1 bg-slate-100`}>
      {/* ================= 1. EMERALD TOP HEADER BAR ================= */}
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



        <View style={tw`flex-row items-center justify-between`}>

          <View style={tw`flex-row items-center flex-1 mr-2`}>
            <View style={tw`w-8 h-8 rounded-full bg-emerald-800 border border-emerald-500 items-center justify-center mr-2.5 shadow-sm`}>
              <Ionicons name="bicycle" size={16} color="#34D399" />
            </View>

            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center flex-wrap gap-1`}>
                <Text style={[Typography.cardTitle, { color: '#FFFFFF', fontSize: 13, marginRight: 2 }]} numberOfLines={1}>
                  ACTIVE TRIP RADAR
                </Text>
                <View style={tw`px-1.5 py-0.2 rounded bg-emerald-800 border border-emerald-600`}>
                  <Text style={[Typography.badge, { color: '#FDE68A', fontSize: 8.5 }]}>
                    LIVE
                  </Text>
                </View>
              </View>
              <Text style={[Typography.caption, { color: '#D1FAE5', fontSize: 9.5, marginTop: 1 }]}>
                {isEnRoute ? 'En Route to Customer' : 'Navigating to Dark Store'}
              </Text>
            </View>
          </View>

          {/* Quick Support Trigger */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onContactSupport}
            style={tw`px-3 py-1.5 rounded-full bg-emerald-900 border border-emerald-600 flex-row items-center shadow-sm`}
          >
            <Ionicons name="help-buoy-outline" size={13} color="#A7F3D0" style={tw`mr-1`} />
            <Text style={[Typography.buttonText, { color: '#A7F3D0', fontSize: 10.5, fontWeight: '800' }]}>
              Support
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 2. LIVE NAVIGATION GPS MAP ================= */}
      <Animated.View style={{ height: animatedMapHeight, width: '100%', position: 'relative' }}>
        <FreeOpenStreetMap
          isOnline={true}
          activeOrder={activeOrder}
          currentHub={activeOrder.storeName}
          onSimulateOrder={() => {}}
        />

        {/* Floating Google Maps Trigger */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleOpenNavigation}
          style={tw`absolute bottom-7 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 shadow-md flex-row items-center z-30`}
        >

          <Ionicons name="navigate-circle" size={14} color="#34D399" style={tw`mr-1`} />
          <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 10 }]}>
            Google Maps
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ================= 3. UNIFIED SLIDING BOTTOM SHEET DASHBOARD ================= */}
      <Animated.View
        style={[
          tw`bg-white border-t border-slate-200 rounded-t-[28px] -mt-4 shadow-xl z-20 px-3.5 pt-1.5 flex-1 justify-between gap-1.5`,
          {
            paddingBottom: 84 + Math.max(insets.bottom, 12),
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

        {/* SCROLLABLE INNER TASK CONTENT */}
        <ScrollView
          style={tw`flex-1`}
          contentContainerStyle={tw`gap-2 pb-1`}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* STAGE PROGRESS BAR & TRIP EARNING */}
          <View style={tw`flex-row justify-between items-center pb-2 border-b border-slate-100`}>
            <View style={tw`flex-1 mr-2`}>
              <View style={tw`flex-row items-center mb-0.5`}>
                <View
                  style={[
                    tw`w-2 h-2 rounded-full mr-1.5`,
                    { backgroundColor: isEnRoute ? '#10B981' : '#2563EB' },
                  ]}
                />
                <Text style={[Typography.caption, { color: isEnRoute ? '#047857' : '#1E40AF', fontSize: 9.5, fontWeight: '800' }]}>
                  {isEnRoute ? 'STEP 2: EN ROUTE TO CUSTOMER' : !isAtStore ? 'STEP 1: GO TO DARK STORE' : 'STEP 1: AT DARK STORE'}
                </Text>
              </View>
              <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 12 }]} numberOfLines={1}>
                Order #{activeOrder.orderNumber} • {activeOrder.items.length} Items
              </Text>
            </View>

            {/* Payout Tag */}
            <View style={tw`items-end`}>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 8, fontWeight: '700' }]}>
                TRIP EARNING
              </Text>
              <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 16 }]}>
                ₹{activeOrder.totalPayout}
              </Text>
            </View>
          </View>

          {/* MAIN TASK CARD DETAILS */}
          {!isEnRoute ? (
            /* Store Pickup Task */
            <View style={tw`p-3 rounded-2xl bg-white border border-slate-200 shadow-sm gap-2`}>
              {/* Header & Quick Call */}
              <View style={tw`flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <View style={tw`w-8 h-8 rounded-xl bg-blue-600 items-center justify-center mr-2.5 shadow-sm`}>
                    <Ionicons name="storefront" size={15} color="#FFFFFF" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 12.5 }]} numberOfLines={1}>
                      {activeOrder.storeName}
                    </Text>
                    <Text style={[Typography.caption, { color: '#2563EB', fontSize: 9.5, fontWeight: '700' }]}>
                      Pickup Rack #B-04 • Shelf 2
                    </Text>
                  </View>
                </View>

                {/* Call Manager */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleCall('+918012345678')}
                  style={tw`w-7 h-7 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center shadow-sm`}
                >
                  <Ionicons name="call" size={13} color="#047857" />
                </TouchableOpacity>
              </View>

              {/* Address Row */}
              <View style={tw`p-2 rounded-xl bg-slate-50 border border-slate-100 flex-row items-start`}>
                <Ionicons name="location" size={12} color="#64748B" style={tw`mr-1.5 mt-0.5`} />
                <Text style={[Typography.caption, { color: '#334155', fontSize: 10, flex: 1, lineHeight: 14 }]}>
                  {activeOrder.storeAddress || 'Plot 14, 80 Feet Road, Near Sony World Signal, Koramangala 4th Block, Bengaluru'}
                </Text>
              </View>

              {/* Checklist at Store (Only visible after arriving at store) */}
              {isAtStore && (

                <View style={tw`pt-2 border-t border-slate-100`}>
                  <View style={tw`flex-row justify-between items-center mb-1.5`}>
                    <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 11 }]}>
                      Items Checklist ({activeOrder.items.filter((i) => i.scanned).length}/{activeOrder.items.length})
                    </Text>
                    <TouchableOpacity
                      onPress={handleScanAll}
                      style={tw`px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300`}
                    >
                      <Text style={[Typography.badge, { color: '#047857', fontSize: 8.5 }]}>
                        Verify All
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={tw`gap-1.5`}>
                    {activeOrder.items.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.7}
                        onPress={() => toggleItemScanned(item.id)}
                        style={[
                          tw`flex-row items-center justify-between p-2 rounded-xl border`,
                          {
                            backgroundColor: item.scanned ? '#ECFDF5' : '#FFFFFF',
                            borderColor: item.scanned ? '#A7F3D0' : '#E2E8F0',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            Typography.caption,
                            {
                              color: item.scanned ? '#064E3B' : '#334155',
                              fontSize: 10,
                              textDecorationLine: item.scanned ? 'line-through' : 'none',
                            },
                          ]}
                        >
                          {item.quantity}x {item.name}
                        </Text>
                        <Ionicons
                          name={item.scanned ? 'checkbox' : 'square-outline'}
                          size={14}
                          color={item.scanned ? '#047857' : '#94A3B8'}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ) : (
            /* Customer Delivery Task */
            <View style={tw`p-3 rounded-2xl bg-white border border-slate-200 shadow-sm gap-2`}>
              {/* Customer Details & Actions */}
              <View style={tw`flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center flex-1 mr-2`}>
                  <View style={tw`w-8 h-8 rounded-xl bg-emerald-600 items-center justify-center mr-2.5 shadow-sm`}>
                    <Ionicons name="person" size={15} color="#FFFFFF" />
                  </View>
                  <View style={tw`flex-1`}>
                    <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 12.5 }]}>
                      {activeOrder.customerName}
                    </Text>
                    <Text style={[Typography.caption, { color: '#047857', fontSize: 9.5, fontWeight: '700' }]}>
                      OTP / Photo Proof Required
                    </Text>
                  </View>
                </View>

                {/* Call & 1-Tap Quick Chat Buttons */}
                <View style={tw`flex-row items-center gap-1.5`}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleCall('+919876543210')}
                    style={tw`w-7 h-7 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center shadow-sm`}
                  >
                    <Ionicons name="call" size={13} color="#047857" />
                  </TouchableOpacity>

                  {/* In-App Quick Chat Trigger */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowChatModal(true)}
                    style={tw`w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 items-center justify-center shadow-sm`}
                  >
                    <Ionicons name="chatbubble-ellipses" size={13} color="#047857" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Destination Address */}
              <View style={tw`p-2 rounded-xl bg-slate-50 border border-slate-100`}>
                <View style={tw`flex-row justify-between items-center mb-1`}>
                  <Text style={[Typography.caption, { color: '#047857', fontSize: 8.5, fontWeight: '800' }]}>
                    DELIVERY DESTINATION
                  </Text>
                  {/* Contactless Photo Trigger */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setShowProofModal(true)}
                    style={tw`flex-row items-center px-1.5 py-0.5 rounded bg-purple-50 border border-purple-200`}
                  >
                    <Ionicons name="camera" size={9} color="#7C3AED" style={tw`mr-1`} />
                    <Text style={[Typography.badge, { color: '#7C3AED', fontSize: 8 }]}>
                      Photo Proof
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 10.5, lineHeight: 15 }]}>
                  {activeOrder.customerAddress}
                </Text>
              </View>

              {/* Payment Collection Tag */}
              <View style={tw`flex-row justify-between items-center pt-1.5 border-t border-slate-100`}>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                  {activeOrder.paymentMode === 'PREPAID' ? '💳 Prepaid Order' : '💵 Cash on Delivery'}
                </Text>
                <Text
                  style={[
                    Typography.caption,
                    {
                      color: activeOrder.paymentMode === 'PREPAID' ? '#047857' : '#D97706',
                      fontSize: 10.5,
                      fontWeight: '800',
                    },
                  ]}
                >
                  {activeOrder.paymentMode === 'PREPAID' ? '₹0.00 Collect' : `Collect ₹${activeOrder.totalAmount}`}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ================= PRIMARY ACTION BUTTON DOCK (PINNED AT BOTTOM ABOVE NAVBAR) ================= */}
        <View style={tw`pt-1 border-t border-slate-100`}>
          {!isEnRoute ? (
            !isAtStore ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => updateActiveOrderStatus('AT_STORE')}
                style={tw`w-full py-3 rounded-2xl bg-slate-900 border border-slate-800 items-center justify-center flex-row shadow-md`}
              >
                <Ionicons name="location" size={15} color="#FFFFFF" style={tw`mr-1.5`} />
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 12, fontWeight: '900' }]}>
                  ARRIVED AT DARK STORE
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => updateActiveOrderStatus('EN_ROUTE')}
                disabled={!allScanned}
                style={[
                  tw`w-full py-3 rounded-2xl items-center justify-center flex-row shadow-md`,
                  {
                    backgroundColor: allScanned ? '#047857' : '#CBD5E1',
                  },
                ]}
              >
                <Ionicons name="bag-check" size={15} color="#FFFFFF" style={tw`mr-1.5`} />
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 12, fontWeight: '900' }]}>
                  {allScanned ? 'CONFIRM PICKUP & START TRIP' : 'VERIFY ALL ITEMS TO START'}
                </Text>
              </TouchableOpacity>
            )
          ) : (
            <View style={tw`gap-2`}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => setShowVerifyModal(true)}
                style={tw`w-full py-3 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-md`}
              >
                <Ionicons name="checkmark-done-circle" size={16} color="#FFFFFF" style={tw`mr-1.5`} />
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 12, fontWeight: '900' }]}>
                  ARRIVED AT DOORSTEP & VERIFY OTP
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Animated.View>


      {/* ================= MODALS ================= */}
      {/* 1. OTP Verification Modal */}
      <DeliveryVerifyModal
        visible={showVerifyModal}
        order={activeOrder}
        onClose={() => setShowVerifyModal(false)}
        onSuccess={handleVerifySuccess}
      />

      {/* 2. In-App Quick Chat Modal */}
      <QuickChatModal
        visible={showChatModal}
        customerName={activeOrder.customerName}
        orderNumber={activeOrder.orderNumber}
        onClose={() => setShowChatModal(false)}
      />

      {/* 3. Contactless Proof of Delivery Photo Modal */}
      <ProofOfDeliveryModal
        visible={showProofModal}
        orderNumber={activeOrder.orderNumber}
        customerAddress={activeOrder.customerAddress}
        onClose={() => setShowProofModal(false)}
        onPhotoConfirmed={handleVerifySuccess}
      />

      {/* 4. Order Success Payout Modal */}
      <OrderSuccessModal
        visible={showSuccessModal}
        order={activeOrder}
        onClose={handleSuccessClose}
      />
    </View>
  );
};

