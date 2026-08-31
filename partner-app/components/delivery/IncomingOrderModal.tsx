import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
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
        <View style={tw`bg-white rounded-t-3xl border-t-2 border-emerald-500 shadow-2xl p-4 pb-6`}>
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

            {/* Right: Trip Specs Pill */}
            <View style={tw`items-end`}>
              <View style={tw`flex-row items-center px-2 py-1 rounded-xl bg-slate-100 border border-slate-200`}>
                <Ionicons name="time-outline" size={11} color="#0F172A" style={tw`mr-1`} />
                <Text style={[Typography.caption, { color: '#0F172A', fontSize: 10, fontWeight: '800' }]}>
                  ~14 mins
                </Text>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, marginLeft: 3 }]}>
                  ({totalDistance} km)
                </Text>
              </View>
              <Text style={[Typography.caption, { color: '#64748B', fontSize: 9, marginTop: 2 }]}>
                #{incomingOrder.orderNumber || 'GM-4920'}
              </Text>
            </View>
          </View>

          {/* ================= 2. DETAILED & CLEAR ROUTE TIMELINE ================= */}
          <View style={tw`py-3`}>
            {/* Step 1: Dark Store Pickup */}
            <View style={tw`flex-row items-start mb-3.5`}>
              <View style={tw`items-center mr-2.5 mt-0.5`}>
                <View style={tw`w-5 h-5 rounded-full bg-blue-600 items-center justify-center shadow-sm`}>
                  <Ionicons name="storefront" size={10} color="#FFFFFF" />
                </View>
                <View style={tw`w-0.5 h-8 bg-slate-200 my-0.5`} />
              </View>

              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center justify-between`}>
                  <Text style={[Typography.caption, { color: '#2563EB', fontSize: 9, fontWeight: '800' }]}>
                    PICKUP DARK STORE
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 9 }]}>
                    {incomingOrder.storeDistanceKm || 0.8} km • ~3 mins
                  </Text>
                </View>
                <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11, marginTop: 1 }]} numberOfLines={1}>
                  {incomingOrder.storeName || 'Koramangala Dark Store #04'}
                </Text>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, marginTop: 1 }]}>
                  80 Feet Road (Rack #B-04 • Shelf 2 • Counter 1)
                </Text>
              </View>
            </View>

            {/* Step 2: Customer Delivery Drop */}
            <View style={tw`flex-row items-start`}>
              <View style={tw`items-center mr-2.5 mt-0.5`}>
                <View style={tw`w-5 h-5 rounded-full bg-emerald-600 items-center justify-center shadow-sm`}>
                  <Ionicons name="location" size={11} color="#FFFFFF" />
                </View>
              </View>

              <View style={tw`flex-1`}>
                <View style={tw`flex-row items-center justify-between`}>
                  <Text style={[Typography.caption, { color: '#047857', fontSize: 9, fontWeight: '800' }]}>
                    CUSTOMER DELIVERY
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 9 }]}>
                    {incomingOrder.customerDistanceKm || 2.4} km • ~11 mins
                  </Text>
                </View>
                <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11, marginTop: 1 }]} numberOfLines={1}>
                  Flat 402, Green Glen Layout, 100ft Road
                </Text>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, marginTop: 1 }]}>
                  Customer: {incomingOrder.customerName || 'Rahul Sharma'} (★ 4.95 Rating)
                </Text>
              </View>
            </View>
          </View>

          {/* ================= 3. COMPACT 3-PILLAR SPEC STRIP ================= */}
          <View style={tw`flex-row justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-200 mb-3.5`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="cube-outline" size={12} color="#475569" style={tw`mr-1`} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 10, fontWeight: '700' }]}>
                {incomingOrder.itemsCount || 4} Items
              </Text>
            </View>

            <View style={tw`w-px h-3.5 bg-slate-200`} />

            <View style={tw`flex-row items-center`}>
              <Ionicons
                name={incomingOrder.paymentMode === 'PREPAID' ? 'card-outline' : 'cash-outline'}
                size={12}
                color={incomingOrder.paymentMode === 'PREPAID' ? '#047857' : '#D97706'}
                style={tw`mr-1`}
              />
              <Text
                style={[
                  Typography.caption,
                  {
                    color: incomingOrder.paymentMode === 'PREPAID' ? '#047857' : '#D97706',
                    fontSize: 10,
                    fontWeight: '800',
                  },
                ]}
              >
                {incomingOrder.paymentMode === 'PREPAID' ? 'Prepaid (₹0)' : 'Collect ₹450 COD'}
              </Text>
            </View>

            <View style={tw`w-px h-3.5 bg-slate-200`} />

            <View style={tw`flex-row items-center`}>
              <Ionicons name="bicycle-outline" size={12} color="#0F172A" style={tw`mr-1`} />
              <Text style={[Typography.caption, { color: '#0F172A', fontSize: 10, fontWeight: '800' }]}>
                {totalDistance} km Total
              </Text>
            </View>
          </View>

          {/* ================= 4. DEDICATED PROPER CANCEL & ACCEPT ACTION BUTTONS ================= */}
          <View style={tw`flex-row items-center gap-2.5`}>
            {/* Proper Cancel / Decline Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={rejectIncomingOrder}
              style={tw`flex-1 py-3 rounded-2xl bg-rose-50 border border-rose-200 items-center justify-center flex-row shadow-sm`}
            >
              <Ionicons name="close-circle-outline" size={15} color="#E11D48" style={tw`mr-1`} />
              <Text style={[Typography.buttonText, { color: '#E11D48', fontSize: 11, fontWeight: '800' }]}>
                Decline / Cancel
              </Text>
            </TouchableOpacity>

            {/* Accept Delivery Button */}
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
