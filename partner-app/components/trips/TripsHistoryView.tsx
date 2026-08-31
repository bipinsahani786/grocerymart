import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { OrderFilterTabs } from '../orders/OrderFilterTabs';
import { OrderHistoryItem } from '../orders/OrderHistoryItem';
import { OrderDetailModal } from '../orders/OrderDetailModal';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

export const TripsHistoryView: React.FC = () => {
  const { completedOrders } = useDeliveryContext();
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filteredOrders = completedOrders.filter((order) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'TODAY') return order.createdAt?.includes('Today') || true;
    return true;
  });

  return (
    <View style={tw`p-3.5 gap-2.5 bg-slate-50 min-h-120`}>
      {/* Title & Filter Strip */}
      <View style={tw`flex-row justify-between items-center px-0.5`}>
        <View>
          <Text style={[Typography.sectionTitle, { color: '#0F172A' }]}>
            Trip History
          </Text>
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9 }]}>
            {filteredOrders.length} completed deliveries
          </Text>
        </View>

        {/* Filter Pills */}
        <View style={tw`flex-row items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm`}>
          {(['ALL', 'TODAY', 'WEEK'] as const).map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[
                tw`px-2 py-0.8 rounded-lg`,
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
                    fontSize: 9,
                  },
                ]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View style={tw`p-8 items-center justify-center bg-white rounded-2xl border border-slate-200 mt-4 shadow-sm`}>
          <View style={tw`w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center mb-2`}>
            <Ionicons name="receipt-outline" size={22} color="#94A3B8" />
          </View>
          <Text style={[Typography.cardTitle, { color: '#0F172A', marginBottom: 2 }]}>
            No Trips Recorded Yet
          </Text>
          <Text style={[Typography.caption, { color: '#64748B', textAlign: 'center' }]}>
            Complete your active deliveries to see your trip ledger here.
          </Text>
        </View>
      ) : (
        <View style={tw`gap-2`}>
          {filteredOrders.map((order) => (
            <TouchableOpacity
              key={order.id}
              activeOpacity={0.85}
              onPress={() => setSelectedOrder(order)}
              style={tw`p-3 rounded-2xl bg-white border border-slate-200 shadow-sm`}
            >
              <View style={tw`flex-row justify-between items-center mb-1.5`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-6 h-6 rounded-lg bg-emerald-50 border border-emerald-200 items-center justify-center mr-1.5`}>
                    <Ionicons name="checkmark" size={12} color="#047857" />
                  </View>
                  <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 11 }]}>
                    #{order.orderNumber}
                  </Text>
                </View>

                <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 13 }]}>
                  +₹{order.totalPayout}
                </Text>
              </View>

              <Text style={[Typography.caption, { color: '#475569', fontSize: 10 }]} numberOfLines={1}>
                🏬 {order.storeName} ➔ 🏠 {order.customerAddress}
              </Text>

              <View style={tw`flex-row justify-between items-center mt-1.5 pt-1.5 border-t border-slate-100`}>
                <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 9 }]}>
                  {order.items?.length || 3} items • {order.paymentMode || 'Prepaid'}
                </Text>
                <View style={tw`flex-row items-center`}>
                  <Text style={[Typography.caption, { color: '#047857', fontSize: 9, fontWeight: '700', marginRight: 2 }]}>
                    View Summary
                  </Text>
                  <Ionicons name="chevron-forward" size={10} color="#047857" />
                </View>
              </View>
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
