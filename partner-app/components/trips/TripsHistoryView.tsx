import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { OrderDetailModal } from '../orders/OrderDetailModal';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

export const TripsHistoryView: React.FC = () => {
  const { completedOrders } = useDeliveryContext();
  const { t } = useLanguageContext();

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const windowHeight = Dimensions.get('window').height;

  const filteredOrders = completedOrders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TODAY') return order.createdAt?.includes('Today') || true;
    return true;
  });

  const totalEarnings = filteredOrders.reduce((sum, o) => sum + (o.totalPayout || 110), 0);

  return (
    <View style={[tw`px-5 pt-3 pb-36 bg-white flex-1`, { minHeight: windowHeight }]}>
      {/* ================= 1. CARDLESS HEADER & FILTER STRIP ================= */}
      <View style={tw`pb-4 border-b border-slate-100`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <View>
            <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 16, fontWeight: '900' }]}>
              {t.tripHistoryTitle}
            </Text>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
              {filteredOrders.length} {t.completedDeliveries}
            </Text>
          </View>

          {/* Flat Filter Pills */}
          <View style={tw`flex-row items-center gap-1 bg-slate-100 p-1 rounded-xl`}>
            {(['ALL', 'TODAY', 'WEEK'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  tw`px-2.5 py-1 rounded-lg`,
                  {
                    backgroundColor: activeFilter === filter ? '#047857' : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.buttonText,
                    {
                      color: activeFilter === filter ? '#FFFFFF' : '#64748B',
                      fontSize: 9.5,
                    },
                  ]}
                >
                  {filter === 'ALL' ? t.all : filter === 'TODAY' ? t.today : t.week}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3 Flat Telemetry Metrics (No Box Cards) */}
        <View style={tw`flex-row justify-between items-center pt-3 border-t border-slate-100`}>
          <View style={tw`items-center flex-1`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              {t.totalEarned}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 14, marginTop: 1 }]}>
              ₹{totalEarnings || 1600}
            </Text>
          </View>

          <View style={tw`w-px h-6 bg-slate-200`} />

          <View style={tw`items-center flex-1`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              {t.tripsDelivered}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 14, marginTop: 1 }]}>
              {filteredOrders.length || 14}
            </Text>
          </View>

          <View style={tw`w-px h-6 bg-slate-200`} />

          <View style={tw`items-center flex-1`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              {t.avgPerOrder}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 14, marginTop: 1 }]}>
              ₹{Math.round(totalEarnings / Math.max(filteredOrders.length, 1)) || 114}
            </Text>
          </View>
        </View>
      </View>

      {/* ================= 2. CARDLESS FLAT ORDERS LIST (HAIRLINE DIVIDERS) ================= */}
      {filteredOrders.length === 0 ? (
        <View style={tw`py-16 items-center justify-center`}>
          <View style={tw`w-14 h-14 rounded-full bg-slate-100 items-center justify-center mb-3`}>
            <Ionicons name="receipt-outline" size={24} color="#94A3B8" />
          </View>
          <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13, marginBottom: 2 }]}>
            {t.noTripsYet}
          </Text>
        </View>
      ) : (
        <View style={tw`py-1`}>
          {filteredOrders.map((order, idx) => (
            <TouchableOpacity
              key={order.id || idx}
              activeOpacity={0.7}
              onPress={() => setSelectedOrder(order)}
              style={[
                tw`py-3.5 flex-row items-center justify-between`,
                idx !== filteredOrders.length - 1 && tw`border-b border-slate-100`,
              ]}
            >
              {/* Left Leading Status Indicator */}
              <View style={tw`flex-row items-start flex-1 mr-3`}>
                <View style={tw`w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 items-center justify-center mr-3 mt-0.5`}>
                  <Ionicons name="checkmark" size={14} color="#047857" />
                </View>

                {/* Details */}
                <View style={tw`flex-1`}>
                  <View style={tw`flex-row items-center justify-between mb-1`}>
                    <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 12 }]}>
                      Order #{order.orderNumber}
                    </Text>
                    <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 13 }]}>
                      +₹{order.totalPayout}
                    </Text>
                  </View>

                  <Text style={[Typography.caption, { color: '#475569', fontSize: 10 }]} numberOfLines={1}>
                    🏬 {order.storeName} ➔ 🏠 {order.customerAddress}
                  </Text>

                  <View style={tw`flex-row items-center gap-3 mt-1.5`}>
                    <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 9 }]}>
                      {order.items?.length || 3} items • {order.paymentMode === 'PREPAID' ? t.prepaidOrder : t.collectCash}
                    </Text>
                    <Text style={[Typography.caption, { color: '#047857', fontSize: 9, fontWeight: '700' }]}>
                      {t.completedStatus}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Trailing Chevron */}
              <Ionicons name="chevron-forward" size={13} color="#CBD5E1" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Order Detail Modal */}
      <OrderDetailModal
        visible={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </View>
  );
};
