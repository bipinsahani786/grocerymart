import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { Typography } from '../../constants/typography';
import { DeliveryOrder } from '../../constants/mockData';
import tw from 'twrnc';

export interface IncomingOrderModalProps {
  visible?: boolean;
  order?: DeliveryOrder | null;
  onAccept?: () => void;
  onReject?: () => void;
}

export const IncomingOrderModal: React.FC<IncomingOrderModalProps> = ({
  visible,
  order: propOrder,
  onAccept: propOnAccept,
  onReject: propOnReject,
}) => {
  const insets = useSafeAreaInsets();
  const context = useDeliveryContext();
  const incomingOrder = propOrder ?? context.incomingOrder;
  const acceptIncomingOrder = propOnAccept ?? context.acceptIncomingOrder;
  const rejectIncomingOrder = propOnReject ?? context.rejectIncomingOrder;

  if (!incomingOrder || visible === false) return null;

  const totalDistance = (
    (incomingOrder.storeDistanceKm || 0.8) + (incomingOrder.customerDistanceKm || 2.4)
  ).toFixed(1);

  return (
    <Modal visible={!!incomingOrder} transparent animationType="slide" statusBarTranslucent>
      <View style={[tw`flex-1 justify-end`, { backgroundColor: 'rgba(15, 23, 42, 0.68)' }]}>
        <View
          style={[
            tw`bg-white rounded-t-3xl border-t-2 border-emerald-500 shadow-2xl p-4`,
            { paddingBottom: Math.max(insets.bottom, 20) + 8 },
          ]}
        >
          {/* Top Grabber Handle */}
          <View style={tw`w-10 h-1 rounded-full bg-slate-200 self-center mb-3`} />

          {/* ================= 1. CLEAN COMPACT HEADER & PAYOUT ================= */}
          <View style={tw`flex-row justify-between items-center pb-3 border-b border-slate-100`}>
            {/* Left: Guaranteed Payout */}
            <View>
              <Text style={[Typography.caption, { color: '#047857', fontSize: 10, fontWeight: '800', letterSpacing: 0.3 }]}>
                NEW DELIVERY REQUEST
              </Text>
              <View style={tw`flex-row items-baseline mt-0.5`}>
                <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 22, fontWeight: '900' }]}>
                  ₹{incomingOrder.totalPayout}
                </Text>
                <View style={tw`ml-2 px-1.5 py-0.2 rounded bg-emerald-50 border border-emerald-200`}>
                  <Text style={[Typography.badge, { color: '#047857', fontSize: 9 }]}>
                    +₹{incomingOrder.surgeBonus || 35} Surge
                  </Text>
                </View>
              </View>
            </View>

            {/* Right: Distance & Item Meta */}
            <View style={tw`items-end`}>
              <View style={tw`flex-row items-center`}>
                <Ionicons name="navigate-circle" size={13} color="#047857" style={tw`mr-1`} />
                <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11 }]}>
                  {totalDistance} km total
                </Text>
              </View>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5, marginTop: 1 }]}>
                {incomingOrder.items?.length || 4} Pack Items • Express 10m
              </Text>
            </View>
          </View>

          {/* ================= 2. TRANSIT TIMELINE (PICKUP ➔ DROP) ================= */}
          <View style={tw`py-3 border-b border-slate-100 gap-2.5`}>
            {/* Pickup Dark Store */}
            <View style={tw`flex-row items-start`}>
              <View style={tw`items-center mr-2.5 mt-0.5`}>
                <View style={tw`w-5 h-5 rounded-full bg-blue-600 items-center justify-center shadow-sm`}>
                  <Ionicons name="storefront" size={10} color="#FFFFFF" />
                </View>
                <View style={tw`w-0.5 h-6 bg-slate-200 my-0.5`} />
              </View>
              <View style={tw`flex-1`}>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={[Typography.caption, { color: '#2563EB', fontSize: 9, fontWeight: '800' }]}>
                    PICKUP DARK STORE ({incomingOrder.storeDistanceKm || 0.8} km)
                  </Text>
                  <Text style={[Typography.caption, { color: '#2563EB', fontSize: 9, fontWeight: '700' }]}>
                    Rack #B-04 • Shelf 2
                  </Text>
                </View>
                <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11, marginTop: 1 }]} numberOfLines={1}>
                  {incomingOrder.storeName}
                </Text>
              </View>
            </View>

            {/* Drop Customer Address */}
            <View style={tw`flex-row items-start`}>
              <View style={tw`items-center mr-2.5 mt-0.5`}>
                <View style={tw`w-5 h-5 rounded-full bg-emerald-600 items-center justify-center shadow-sm`}>
                  <Ionicons name="location" size={11} color="#FFFFFF" />
                </View>
              </View>
              <View style={tw`flex-1`}>
                <View style={tw`flex-row justify-between items-center`}>
                  <Text style={[Typography.caption, { color: '#047857', fontSize: 9, fontWeight: '800' }]}>
                    DROP LOCATION ({incomingOrder.customerDistanceKm || 2.4} km)
                  </Text>
                  <Text
                    style={[
                      Typography.caption,
                      {
                        color: incomingOrder.paymentMode === 'PREPAID' ? '#047857' : '#D97706',
                        fontSize: 9,
                        fontWeight: '800',
                      },
                    ]}
                  >
                    {incomingOrder.paymentMode === 'PREPAID' ? '💳 Prepaid' : `💵 Collect ₹${incomingOrder.totalAmount}`}
                  </Text>
                </View>
                <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11, marginTop: 1 }]} numberOfLines={1}>
                  {incomingOrder.customerName} • {incomingOrder.customerAddress}
                </Text>
              </View>
            </View>
          </View>

          {/* ================= 3. DUAL ACTION BUTTON DOCK ================= */}
          <View style={tw`flex-row gap-2.5 pt-3`}>
            {/* Decline Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={rejectIncomingOrder}
              style={tw`flex-1 py-3 rounded-2xl bg-slate-100 border border-slate-200 items-center justify-center`}
            >
              <Text style={[Typography.buttonText, { color: '#64748B', fontSize: 11.5 }]}>
                Decline
              </Text>
            </TouchableOpacity>

            {/* Accept Order Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={acceptIncomingOrder}
              style={tw`flex-2 py-3 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-md`}
            >
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" style={tw`mr-1.5`} />
              <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 12, fontWeight: '900' }]}>
                ACCEPT (₹{incomingOrder.totalPayout})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
