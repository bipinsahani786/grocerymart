import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { DeliveryOrder } from '../../constants/mockData';
import tw from 'twrnc';

export interface OrderDetailModalProps {
  visible?: boolean;
  order: DeliveryOrder | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ visible, order, onClose }) => {
  if (!order || visible === false) return null;

  const isDelivered = order.status === 'DELIVERED';
  const isCOD = order.paymentMode === 'CASH_ON_DELIVERY';
  const distanceText = order.customerDistanceKm ? `${order.customerDistanceKm} km` : '3.2 km';

  return (
    <Modal visible={!!order} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(15, 23, 42, 0.6)' }]}>
        <View
          style={[
            tw`rounded-t-[32px] p-5 pb-8 max-h-[85%]`,
            { backgroundColor: '#FFFFFF' },
          ]}
        >
          {/* Drag Pill Handle */}
          <View style={tw`w-12 h-1 bg-slate-300 rounded-full self-center mb-3`} />

          {/* Header Row */}
          <View style={tw`flex-row justify-between items-start mb-4`}>
            <View>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-lg font-black text-slate-900 mr-2`}>
                  Trip #{order.orderNumber}
                </Text>
                <View
                  style={[
                    tw`px-2 py-0.5 rounded-full`,
                    isDelivered ? tw`bg-emerald-50 border border-emerald-200` : tw`bg-amber-50 border border-amber-200`,
                  ]}
                >
                  <Text
                    style={[
                      tw`text-[10px] font-black`,
                      isDelivered ? tw`text-emerald-700` : tw`text-amber-700`,
                    ]}
                  >
                    {isDelivered ? 'DELIVERED ✓' : order.status}
                  </Text>
                </View>
              </View>
              <Text style={tw`text-xs text-slate-400 mt-0.5 font-medium`}>
                {order.createdAt} {order.deliveredAt ? `• Delivered at ${order.deliveredAt}` : ''}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onClose}
              style={tw`w-8 h-8 rounded-full bg-slate-100 items-center justify-center`}
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-6`}>
            {/* Total Earning Hero Strip */}
            <View style={tw`p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex-row justify-between items-center mb-4`}>
              <View>
                <Text style={tw`text-[10px] font-bold text-emerald-800 uppercase tracking-wider`}>
                  Your Total Trip Payout
                </Text>
                <Text style={tw`text-2xl font-black text-emerald-700 mt-0.5`}>
                  ₹{order.totalPayout}.00
                </Text>
              </View>
              <View style={tw`items-end`}>
                <View style={tw`px-2.5 py-1 rounded-xl bg-white border border-emerald-200`}>
                  <Text style={tw`text-xs font-black text-emerald-700`}>
                    {order.paymentMode === 'PREPAID' ? 'Prepaid Order' : 'Cash Collected (COD)'}
                  </Text>
                </View>
                <Text style={tw`text-[10px] text-emerald-600 mt-1 font-semibold`}>
                  ✓ Settled to Wallet
                </Text>
              </View>
            </View>

            {/* Route Timeline */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4`}>
              <Text style={tw`text-xs font-black text-slate-900 uppercase tracking-wider mb-3`}>
                Trip Route
              </Text>

              {/* Pickup Store */}
              <View style={tw`flex-row items-start`}>
                <View style={tw`items-center mr-3`}>
                  <View style={tw`w-6 h-6 rounded-full bg-blue-100 items-center justify-center`}>
                    <Ionicons name="storefront" size={13} color="#2563EB" />
                  </View>
                  <View style={tw`w-[1.5px] h-8 bg-slate-300 my-1`} />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-[10px] font-bold text-blue-600 uppercase`}>Pickup Hub</Text>
                  <Text style={tw`text-xs font-black text-slate-800`}>{order.storeName}</Text>
                  <Text style={tw`text-[11px] text-slate-500 mt-0.5`}>{order.storeAddress}</Text>
                </View>
              </View>

              {/* Drop Customer */}
              <View style={tw`flex-row items-start mt-1`}>
                <View style={tw`items-center mr-3`}>
                  <View style={tw`w-6 h-6 rounded-full bg-emerald-100 items-center justify-center`}>
                    <Ionicons name="location" size={14} color="#059669" />
                  </View>
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-[10px] font-bold text-emerald-600 uppercase`}>Customer Drop</Text>
                  <Text style={tw`text-xs font-black text-slate-800`}>{order.customerName}</Text>
                  <Text style={tw`text-[11px] text-slate-500 mt-0.5`}>{order.customerAddress}</Text>
                </View>
              </View>
            </View>

            {/* Itemized Payout Breakdown */}
            <View style={tw`p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-4`}>
              <Text style={tw`text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5`}>
                Payout Breakdown
              </Text>

              <View style={tw`gap-2`}>
                <View style={tw`flex-row justify-between items-center py-1 border-b border-slate-200`}>
                  <Text style={tw`text-xs text-slate-600`}>Base Distance Fare ({distanceText})</Text>
                  <Text style={tw`text-xs font-black text-slate-800`}>₹{order.payoutEarnings}</Text>
                </View>
                <View style={tw`flex-row justify-between items-center py-1 border-b border-slate-200`}>
                  <Text style={tw`text-xs text-slate-600`}>Surge / Peak Multiplier</Text>
                  <Text style={tw`text-xs font-black text-amber-600`}>+₹{order.surgeBonus}</Text>
                </View>
                <View style={tw`flex-row justify-between items-center py-1 border-b border-slate-200`}>
                  <Text style={tw`text-xs text-slate-600`}>Customer Tip (100% credited)</Text>
                  <Text style={tw`text-xs font-black text-pink-600`}>+₹{order.tipAmount}</Text>
                </View>
                <View style={tw`flex-row justify-between items-center pt-1.5`}>
                  <Text style={tw`text-xs font-black text-slate-900`}>Net Rider Payout</Text>
                  <Text style={tw`text-sm font-black text-emerald-600`}>₹{order.totalPayout}</Text>
                </View>
              </View>
            </View>

            {/* Verification Security Chip */}
            <View style={tw`p-3.5 rounded-2xl bg-slate-100 flex-row justify-between items-center`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="shield-checkmark" size={16} color="#047857" style={tw`mr-2`} />
                <View>
                  <Text style={tw`text-xs font-bold text-slate-800`}>Delivery Verification</Text>
                  <Text style={tw`text-[10px] text-slate-500`}>OTP: {order.otp} • Handed over safely</Text>
                </View>
              </View>
              <View style={tw`px-2 py-0.5 rounded-md bg-emerald-100`}>
                <Text style={tw`text-[10px] font-black text-emerald-800`}>VERIFIED</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

