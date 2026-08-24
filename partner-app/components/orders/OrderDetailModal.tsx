import React from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { DeliveryOrder } from '../../constants/mockData';

interface OrderDetailModalProps {
  order: DeliveryOrder | null;
  onClose: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  return (
    <Modal visible={!!order} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.85)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: Colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 1,
            borderColor: Colors.border,
            padding: 20,
            maxHeight: '85%',
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>
                Trip #{order.orderNumber}
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                {order.createdAt} {order.deliveredAt ? `• Delivered ${order.deliveredAt}` : ''}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            {/* Payout Summary Box */}
            <View
              style={{
                backgroundColor: Colors.surfaceCard,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: Colors.border,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10 }}>
                PAYOUT BREAKDOWN
              </Text>
              <View style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Base Pay</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>₹{order.payoutEarnings}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Surge Incentive</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.amber }}>+₹{order.surgeBonus}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary }}>Customer Tip</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.primaryLight }}>+₹{order.tipAmount}</Text>
                </View>
                <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: 4 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.text }}>Total Trip Earning</Text>
                  <Text style={{ fontSize: 16, fontWeight: '900', color: Colors.primary }}>₹{order.totalPayout}</Text>
                </View>
              </View>
            </View>

            {/* Route summary */}
            <View
              style={{
                backgroundColor: Colors.surfaceCard,
                borderRadius: 14,
                padding: 16,
                borderWidth: 1,
                borderColor: Colors.border,
                marginBottom: 14,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary, marginBottom: 10 }}>
                ROUTE DETAILS
              </Text>
              <View style={{ gap: 12 }}>
                <View>
                  <Text style={{ fontSize: 11, color: Colors.blue, fontWeight: '700' }}>PICKUP DARK STORE</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>{order.storeName}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{order.storeAddress}</Text>
                </View>

                <View>
                  <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: '700' }}>CUSTOMER DELIVERY</Text>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }}>{order.customerName}</Text>
                  <Text style={{ fontSize: 11, color: Colors.textSecondary }}>{order.customerAddress}</Text>
                </View>
              </View>
            </View>

            {/* Payment & OTP status */}
            <View
              style={{
                backgroundColor: Colors.surfaceCard,
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: Colors.border,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Payment Mode:</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.text }}>{order.paymentMode}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
                <Text style={{ fontSize: 12, color: Colors.textSecondary }}>Delivery OTP:</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primaryLight }}>{order.otp}</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
