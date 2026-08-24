import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { DeliveryOrder } from '../../constants/mockData';

interface CustomerDropSectionProps {
  order: DeliveryOrder;
  onOpenVerifyModal: () => void;
}

export const CustomerDropSection: React.FC<CustomerDropSectionProps> = ({
  order,
  onOpenVerifyModal,
}) => {
  return (
    <View style={{ marginBottom: 24 }}>
      {/* Customer Contact & Address Card */}
      <View
        style={{
          backgroundColor: Colors.surfaceCard,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          marginBottom: 14,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Ionicons name="person" size={20} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text }}>
                {order.customerName}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 1 }}>
                Order #{order.orderNumber}
              </Text>
            </View>
          </View>

          {/* Quick Call & Message Buttons */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color={Colors.blue} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="call" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Address */}
        <View
          style={{
            backgroundColor: Colors.surfaceLight,
            borderRadius: 10,
            padding: 12,
            marginTop: 12,
          }}
        >
          <Text style={{ fontSize: 11, color: Colors.primaryLight, fontWeight: '700', marginBottom: 2 }}>
            DELIVERY DESTINATION
          </Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>
            {order.customerAddress}
          </Text>
        </View>

        {/* Delivery Notes */}
        {order.deliveryNotes && (
          <View
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.1)',
              borderColor: Colors.amber,
              borderWidth: 1,
              borderRadius: 10,
              padding: 10,
              marginTop: 10,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="information-circle" size={18} color={Colors.amber} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 12, color: Colors.amber, flex: 1 }}>
              Note: {order.deliveryNotes}
            </Text>
          </View>
        )}

        {/* Payment Collect Box */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 14,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: Colors.border,
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: Colors.textMuted }}>
              Payment Mode
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.text }}>
              {order.paymentMode === 'PREPAID' ? '💳 PREPAID (DO NOT COLLECT)' : '💵 CASH ON DELIVERY'}
            </Text>
          </View>

          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 11, color: Colors.textMuted }}>
              {order.paymentMode === 'PREPAID' ? 'Amount to Collect' : 'Cash to Collect'}
            </Text>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '900',
                color: order.paymentMode === 'PREPAID' ? Colors.primaryLight : Colors.amber,
              }}
            >
              {order.paymentMode === 'PREPAID' ? '₹0.00' : `₹${order.totalAmount}`}
            </Text>
          </View>
        </View>
      </View>

      {/* Arrived at Doorstep Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onOpenVerifyModal}
        style={{
          backgroundColor: Colors.primary,
          borderRadius: 14,
          paddingVertical: 16,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          shadowColor: Colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        }}
      >
        <Ionicons name="checkmark-done-circle" size={22} color={Colors.textDark} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 16, fontWeight: '900', color: Colors.textDark }}>
          ARRIVED AT DOORSTEP & VERIFY OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
};
