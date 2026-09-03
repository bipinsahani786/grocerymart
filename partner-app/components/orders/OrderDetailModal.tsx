import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DeliveryOrder } from '../../constants/mockData';
import { useSettingsContext } from '../../context/SettingsContext';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

export interface OrderDetailModalProps {
  visible?: boolean;
  order: DeliveryOrder | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ visible, order, onClose }) => {
  const insets = useSafeAreaInsets();
  const { settings, getNavAppName, showToast } = useSettingsContext();

  if (!order || visible === false) return null;

  const isDelivered = order.status === 'DELIVERED';
  const isCOD = order.paymentMode === 'CASH_ON_DELIVERY';
  const distanceText = order.customerDistanceKm ? `${order.customerDistanceKm + (order.storeDistanceKm || 0.8)} km` : '3.2 km';

  const handleLaunchNavigation = () => {
    const navApp = getNavAppName();
    showToast(`🗺️ Launching ${navApp} navigation...`);
    
    // Simulate opening map URL based on setting
    const address = encodeURIComponent(order.customerAddress || 'Koramangala, Bengaluru');
    if (settings.defaultNavApp === 'waze') {
      Linking.openURL(`https://waze.com/ul?q=${address}`).catch(() => {});
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`).catch(() => {});
    }
  };

  const handleSpeakVoiceNote = () => {
    showToast(`🗣️ Voice Guidance: "Deliver to ${order.customerName}, ${order.customerAddress}"`);
  };

  return (
    <Modal visible={!!order} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(15, 23, 42, 0.65)' }]}>
        <View
          style={[
            tw`bg-white rounded-t-3xl border-t border-emerald-500 shadow-2xl p-4 max-h-[85%]`,
            { paddingBottom: Math.max(insets.bottom, 20) + 12 },
          ]}
        >
          {/* Drag Grabber */}
          <View style={tw`w-10 h-1 bg-slate-200 rounded-full self-center mb-3`} />

          {/* Header */}
          <View style={tw`flex-row justify-between items-start pb-3 border-b border-slate-100 mb-3`}>
            <View>
              <View style={tw`flex-row items-center`}>
                <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 15, fontWeight: '900', marginRight: 6 }]}>
                  Order #{order.orderNumber}
                </Text>
                <View style={tw`px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200`}>
                  <Text style={[Typography.badge, { color: '#047857', fontSize: 8.5 }]}>
                    {isDelivered ? 'DELIVERED ✓' : order.status}
                  </Text>
                </View>
              </View>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, marginTop: 2 }]}>
                {order.createdAt} {order.deliveredAt ? `• Delivered at ${order.deliveredAt}` : ''}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={tw`w-7 h-7 rounded-full bg-slate-100 items-center justify-center`}>
              <Ionicons name="close" size={14} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-4`}>
            {/* ================= ACTIVE SETTINGS QUICK ACTIONS BAR ================= */}
            <View style={tw`flex-row gap-2 mb-3`}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleLaunchNavigation}
                style={tw`flex-1 py-2 px-3 bg-blue-50 border border-blue-200 rounded-xl flex-row items-center justify-center`}
              >
                <Ionicons name="navigate" size={13} color="#2563EB" style={tw`mr-1.5`} />
                <Text style={tw`text-[10px] font-extrabold text-blue-800`}>
                  Nav: {settings.defaultNavApp === 'google_maps' ? 'Google Maps' : settings.defaultNavApp === 'waze' ? 'Waze' : 'In-App'}
                </Text>
              </TouchableOpacity>

              {settings.voiceGuidance && (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleSpeakVoiceNote}
                  style={tw`flex-1 py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl flex-row items-center justify-center`}
                >
                  <Ionicons name="volume-high" size={13} color="#047857" style={tw`mr-1.5`} />
                  <Text style={tw`text-[10px] font-extrabold text-emerald-800`}>Read Voice Note 🗣️</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ================= 1. CARDLESS HERO PAYOUT ================= */}
            <View style={tw`items-center pb-4 border-b border-slate-100`}>
              <Text style={[Typography.caption, { color: '#047857', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }]}>
                TOTAL TRIP EARNING
              </Text>
              <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 28, fontWeight: '900', marginVertical: 2 }]}>
                ₹{order.totalPayout}.00
              </Text>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
                {order.paymentMode === 'PREPAID' ? '💳 Prepaid Order • Credited to Wallet' : `💵 Collected ₹${order.totalAmount} in Cash`}
              </Text>
            </View>

            {/* ================= 2. TRANSIT ROUTE FLOW (CARDLESS) ================= */}
            <View style={tw`py-4 border-b border-slate-100`}>
              <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
                DELIVERY ROUTE
              </Text>

              {/* Pickup */}
              <View style={tw`flex-row items-start mb-3`}>
                <View style={tw`items-center mr-3 mt-0.5`}>
                  <View style={tw`w-5 h-5 rounded-full bg-blue-600 items-center justify-center shadow-sm`}>
                    <Ionicons name="storefront" size={10} color="#FFFFFF" />
                  </View>
                  <View style={tw`w-0.5 h-7 bg-slate-200 my-0.5`} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[Typography.caption, { color: '#2563EB', fontSize: 9.5, fontWeight: '800' }]}>
                    PICKUP DARK STORE
                  </Text>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11.5, marginTop: 1 }]}>
                    {order.storeName}
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, marginTop: 1 }]}>
                    {order.storeAddress}
                  </Text>
                </View>
              </View>

              {/* Drop */}
              <View style={tw`flex-row items-start`}>
                <View style={tw`items-center mr-3 mt-0.5`}>
                  <View style={tw`w-5 h-5 rounded-full bg-emerald-600 items-center justify-center shadow-sm`}>
                    <Ionicons name="location" size={11} color="#FFFFFF" />
                  </View>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[Typography.caption, { color: '#047857', fontSize: 9.5, fontWeight: '800' }]}>
                    CUSTOMER DELIVERY
                  </Text>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11.5, marginTop: 1 }]}>
                    {order.customerName}
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, marginTop: 1 }]}>
                    {order.customerAddress}
                  </Text>
                </View>
              </View>
            </View>

            {/* ================= 3. ITEMIZED PAYOUT BREAKDOWN ================= */}
            <View style={tw`py-4 border-b border-slate-100`}>
              <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
                PAYOUT BREAKDOWN
              </Text>

              <View style={tw`gap-2`}>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={[Typography.caption, { color: '#334155', fontSize: 10.5 }]}>
                    Base Distance Pay ({distanceText})
                  </Text>
                  <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '700' }]}>
                    ₹{order.payoutEarnings || 45}
                  </Text>
                </View>

                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={[Typography.caption, { color: '#334155', fontSize: 10.5 }]}>
                    Peak Demand Surge Bonus
                  </Text>
                  <Text style={[Typography.caption, { color: '#B45309', fontSize: 11, fontWeight: '700' }]}>
                    +₹{order.surgeBonus || 35}
                  </Text>
                </View>

                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={[Typography.caption, { color: '#334155', fontSize: 10.5 }]}>
                    Customer Tip (100% credited)
                  </Text>
                  <Text style={[Typography.caption, { color: '#047857', fontSize: 11, fontWeight: '700' }]}>
                    +₹{order.tipAmount || 10}
                  </Text>
                </View>

                <View style={tw`flex-row justify-between items-center pt-2 border-t border-slate-100 mt-1`}>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                    Net Rider Payout
                  </Text>
                  <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 14 }]}>
                    ₹{order.totalPayout}.00
                  </Text>
                </View>
              </View>
            </View>

            {/* ================= 4. ITEMS VERIFICATION BADGE ================= */}
            <View style={tw`flex-row justify-between items-center py-3.5`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="shield-checkmark" size={15} color="#047857" style={tw`mr-2`} />
                <View>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11 }]}>
                    Verified Doorstep Delivery
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                    OTP {order.otp || '4821'} Confirmed • {order.items?.length || 4} Items Checked
                  </Text>
                </View>
              </View>

              <Text style={[Typography.badge, { color: '#047857', fontSize: 9 }]}>
                100% On-Time
              </Text>
            </View>
          </ScrollView>

          {/* Close Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onClose}
            style={tw`w-full py-3.5 rounded-2xl bg-slate-900 border border-slate-800 items-center justify-center shadow-md`}
          >
            <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 12, fontWeight: '800' }]}>
              Dismiss Summary
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
