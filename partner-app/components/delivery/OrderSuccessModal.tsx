import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { DeliveryOrder } from '../../constants/mockData';

export interface OrderSuccessModalProps {
  visible: boolean;
  order?: DeliveryOrder | null;
  payoutAmount?: number;
  onDismiss?: () => void;
  onClose?: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  visible,
  order,
  payoutAmount,
  onDismiss,
  onClose,
}) => {
  const handleClose = onDismiss || onClose || (() => {});
  const amount = payoutAmount ?? order?.totalPayout ?? order?.payoutEarnings ?? 0;
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        }}
      >
        <View
          style={{
            backgroundColor: Colors.surface,
            borderRadius: 24,
            borderWidth: 2,
            borderColor: Colors.primary,
            padding: 24,
            alignItems: 'center',
            width: '100%',
            maxWidth: 380,
          }}
        >
          {/* Animated Celebration Icon */}
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: Colors.primaryBg,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              borderWidth: 2,
              borderColor: Colors.primary,
            }}
          >
            <Ionicons name="checkmark-done" size={38} color={Colors.primary} />
          </View>

          <Text style={{ fontSize: 22, fontWeight: '900', color: Colors.text, textAlign: 'center' }}>
            Delivery Completed! 🎉
          </Text>
          <Text style={{ fontSize: 13, color: Colors.textSecondary, textAlign: 'center', marginTop: 4 }}>
            Customer OTP verified successfully.
          </Text>

          {/* Payout badge */}
          <View
            style={{
              backgroundColor: Colors.primaryBg,
              borderColor: Colors.primary,
              borderWidth: 1.5,
              borderRadius: 16,
              paddingVertical: 14,
              paddingHorizontal: 24,
              alignItems: 'center',
              marginVertical: 20,
              width: '100%',
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primaryDark }}>
              ADDED TO YOUR WALLET
            </Text>
            <Text style={{ fontSize: 32, fontWeight: '900', color: Colors.text, marginTop: 2 }}>
              +₹{amount}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
              Great job! Your on-time rating is 99.1%
            </Text>
          </View>

          {/* Dismiss Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleClose}
            style={{
              backgroundColor: Colors.primary,
              width: '100%',
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '900', color: Colors.white }}>
              BACK TO DASHBOARD
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
