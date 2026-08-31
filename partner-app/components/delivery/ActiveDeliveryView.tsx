import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { FreeOpenStreetMap } from '../home/FreeOpenStreetMap';
import { DeliveryVerifyModal } from './DeliveryVerifyModal';
import { OrderSuccessModal } from './OrderSuccessModal';
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
  const {
    activeOrder,
    updateActiveOrderStatus,
    toggleItemScanned,
    completeActiveDelivery,
  } = useDeliveryContext();

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const windowHeight = Dimensions.get('window').height;

  if (!activeOrder) {
    return (
      <View style={[tw`flex-1 p-6 items-center justify-center bg-white`, { minHeight: windowHeight - 140 }]}>
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
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    completeActiveDelivery();
    onFindNewOrders();
  };

  return (
    <View style={[tw`flex-1 bg-white`, { minHeight: windowHeight }]}>
      {/* ================= 1. LIVE NAVIGATION MAP ================= */}
      <View style={{ height: 220, width: '100%', position: 'relative' }}>
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
          style={tw`absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 shadow-md flex-row items-center z-30`}
        >
          <Ionicons name="navigate-circle" size={14} color="#34D399" style={tw`mr-1`} />
          <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 10 }]}>
            Google Maps
          </Text>
        </TouchableOpacity>
      </View>

      {/* ================= 2. UNIFIED DRIVER COCKPIT SHEET ================= */}
      <View
        style={[
          tw`p-4 gap-3 bg-white border-t border-slate-200 rounded-t-[28px] -mt-4 shadow-lg flex-1`,
          { paddingBottom: 140 },
        ]}
      >
        {/* Top Grabber */}
        <View style={tw`w-10 h-1 rounded-full bg-slate-200 self-center mb-1`} />

        {/* ================= STAGE PROGRESS BAR ================= */}
        <View style={tw`flex-row justify-between items-center pb-2.5 border-b border-slate-100`}>
          <View>
            <View style={tw`flex-row items-center`}>
              <View
                style={[
                  tw`w-2 h-2 rounded-full mr-1.5`,
                  { backgroundColor: isEnRoute ? '#10B981' : '#2563EB' },
                ]}
              />
              <Text style={[Typography.caption, { color: isEnRoute ? '#047857' : '#1E40AF', fontSize: 10, fontWeight: '800' }]}>
                {isEnRoute ? 'STEP 2: EN ROUTE TO CUSTOMER' : !isAtStore ? 'STEP 1: GO TO DARK STORE' : 'STEP 1: AT DARK STORE'}
              </Text>
            </View>
            <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13, marginTop: 1 }]}>
              Order #{activeOrder.orderNumber} • {activeOrder.items.length} Items
            </Text>
          </View>

          {/* Payout Tag */}
          <View style={tw`items-end`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              TRIP EARNING
            </Text>
            <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 18 }]}>
              ₹{activeOrder.totalPayout}
            </Text>
          </View>
        </View>

        {/* ================= MAIN TASK CARD ================= */}
        {!isEnRoute ? (
          /* Store Pickup Task */
          <View style={tw`p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm gap-2.5`}>
            {/* Header & Quick Call */}
            <View style={tw`flex-row justify-between items-center`}>
              <View style={tw`flex-row items-center flex-1 mr-2`}>
                <View style={tw`w-8 h-8 rounded-xl bg-blue-600 items-center justify-center mr-2.5 shadow-sm`}>
                  <Ionicons name="storefront" size={15} color="#FFFFFF" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13 }]} numberOfLines={1}>
                    {activeOrder.storeName}
                  </Text>
                  <Text style={[Typography.caption, { color: '#2563EB', fontSize: 10, fontWeight: '700' }]}>
                    Pickup Rack #B-04 • Shelf 2
                  </Text>
                </View>
              </View>

              {/* Call Manager */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleCall('+918012345678')}
                style={tw`w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center shadow-sm`}
              >
                <Ionicons name="call" size={14} color="#047857" />
              </TouchableOpacity>
            </View>

            {/* Address Row */}
            <View style={tw`p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex-row items-start`}>
              <Ionicons name="location" size={13} color="#64748B" style={tw`mr-1.5 mt-0.5`} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 10.5, flex: 1, lineHeight: 15 }]}>
                {activeOrder.storeAddress || 'Plot 14, 80 Feet Road, Near Sony World Signal, Koramangala 4th Block, Bengaluru'}
              </Text>
            </View>

            {/* Checklist at Store */}
            {isAtStore && (
              <View style={tw`pt-2 border-t border-slate-100`}>
                <View style={tw`flex-row justify-between items-center mb-2`}>
                  <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 11.5 }]}>
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
                            fontSize: 10.5,
                            textDecorationLine: item.scanned ? 'line-through' : 'none',
                          },
                        ]}
                      >
                        {item.quantity}x {item.name}
                      </Text>
                      <Ionicons
                        name={item.scanned ? 'checkbox' : 'square-outline'}
                        size={15}
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
          <View style={tw`p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm gap-2.5`}>
            {/* Customer Details & Actions */}
            <View style={tw`flex-row justify-between items-center`}>
              <View style={tw`flex-row items-center flex-1 mr-2`}>
                <View style={tw`w-8 h-8 rounded-xl bg-emerald-600 items-center justify-center mr-2.5 shadow-sm`}>
                  <Ionicons name="person" size={15} color="#FFFFFF" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13 }]}>
                    {activeOrder.customerName}
                  </Text>
                  <Text style={[Typography.caption, { color: '#047857', fontSize: 10, fontWeight: '700' }]}>
                    OTP Required at Doorstep
                  </Text>
                </View>
              </View>

              {/* Call & Chat Buttons */}
              <View style={tw`flex-row items-center gap-1.5`}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => handleCall('+919876543210')}
                  style={tw`w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center shadow-sm`}
                >
                  <Ionicons name="call" size={14} color="#047857" />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={onContactSupport}
                  style={tw`w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 items-center justify-center shadow-sm`}
                >
                  <Ionicons name="chatbubble-ellipses" size={14} color="#2563EB" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Destination Address */}
            <View style={tw`p-2.5 rounded-xl bg-slate-50 border border-slate-100`}>
              <Text style={[Typography.caption, { color: '#047857', fontSize: 9, fontWeight: '800', marginBottom: 1 }]}>
                DELIVERY DESTINATION
              </Text>
              <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11, lineHeight: 16 }]}>
                {activeOrder.customerAddress}
              </Text>
            </View>

            {/* Payment Collection Tag */}
            <View style={tw`flex-row justify-between items-center pt-2 border-t border-slate-100`}>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                {activeOrder.paymentMode === 'PREPAID' ? '💳 Prepaid Order' : '💵 Cash on Delivery'}
              </Text>
              <Text
                style={[
                  Typography.caption,
                  {
                    color: activeOrder.paymentMode === 'PREPAID' ? '#047857' : '#D97706',
                    fontSize: 11,
                    fontWeight: '800',
                  },
                ]}
              >
                {activeOrder.paymentMode === 'PREPAID' ? '₹0.00 Collect' : `Collect ₹${activeOrder.totalAmount}`}
              </Text>
            </View>
          </View>
        )}

        {/* ================= PRIMARY ACTION BUTTON DOCK ================= */}
        <View style={tw`pt-1`}>
          {!isEnRoute ? (
            !isAtStore ? (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => updateActiveOrderStatus('AT_STORE')}
                style={tw`w-full py-3.5 rounded-2xl bg-slate-900 border border-slate-800 items-center justify-center flex-row shadow-md`}
              >
                <Ionicons name="location" size={16} color="#FFFFFF" style={tw`mr-1.5`} />
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 13, fontWeight: '900' }]}>
                  ARRIVED AT DARK STORE
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => updateActiveOrderStatus('EN_ROUTE')}
                disabled={!allScanned}
                style={[
                  tw`w-full py-3.5 rounded-2xl items-center justify-center flex-row shadow-md`,
                  {
                    backgroundColor: allScanned ? '#047857' : '#CBD5E1',
                  },
                ]}
              >
                <Ionicons name="bag-check" size={16} color="#FFFFFF" style={tw`mr-1.5`} />
                <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 13, fontWeight: '900' }]}>
                  {allScanned ? 'CONFIRM PICKUP & START TRIP' : 'VERIFY ALL ITEMS TO START'}
                </Text>
              </TouchableOpacity>
            )
          ) : (
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => setShowVerifyModal(true)}
              style={tw`w-full py-3.5 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-md`}
            >
              <Ionicons name="checkmark-done-circle" size={17} color="#FFFFFF" style={tw`mr-1.5`} />
              <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 13, fontWeight: '900' }]}>
                ARRIVED AT DOORSTEP & VERIFY OTP
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ================= MODALS ================= */}
      <DeliveryVerifyModal
        visible={showVerifyModal}
        order={activeOrder}
        onClose={() => setShowVerifyModal(false)}
        onSuccess={handleVerifySuccess}
      />

      <OrderSuccessModal
        visible={showSuccessModal}
        order={activeOrder}
        onClose={handleSuccessClose}
      />
    </View>
  );
};
