import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { DeliveryOrder } from '../../constants/mockData';
import { StatusBadge } from '../common/StatusBadge';

interface OrderHistoryItemProps {
  order: DeliveryOrder;
  onPress: () => void;
}

export const OrderHistoryItem: React.FC<OrderHistoryItemProps> = ({ order, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        backgroundColor: Colors.surfaceCard,
        borderRadius: 14,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.border,
        marginBottom: 10,
      }}
    >
      {/* Top Header: Order ID + Status + Time */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.text, marginRight: 8 }}>
            {order.orderNumber}
          </Text>
          <StatusBadge status={order.status} />
        </View>

        <Text style={{ fontSize: 11, color: Colors.textMuted }}>
          {order.createdAt}
        </Text>
      </View>

      {/* Route snippet */}
      <View style={{ marginTop: 10, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="storefront" size={14} color={Colors.blue} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 12, color: Colors.textSecondary }} numberOfLines={1}>
            {order.storeName}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="location" size={14} color={Colors.primary} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 12, color: Colors.text }} numberOfLines={1}>
            {order.customerAddress}
          </Text>
        </View>
      </View>

      {/* Footer: Payout & Item Count */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 10,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
        }}
      >
        <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
          {order.itemsCount} items • {order.paymentMode === 'PREPAID' ? 'Prepaid' : 'COD'}
        </Text>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, color: Colors.textMuted, marginRight: 4 }}>Payout:</Text>
          <Text style={{ fontSize: 15, fontWeight: '900', color: Colors.primary }}>
            ₹{order.totalPayout}
          </Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textMuted} style={{ marginLeft: 4 }} />
        </View>
      </View>
    </TouchableOpacity>
  );
};
