import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { DeliveryOrder } from '../../constants/mockData';
import { useDeliveryContext } from '../../context/DeliveryContext';

interface DeliveryVerifyModalProps {
  visible: boolean;
  order: DeliveryOrder;
  onClose: () => void;
  onSuccess: (payout: number) => void;
}

export const DeliveryVerifyModal: React.FC<DeliveryVerifyModalProps> = ({
  visible,
  order,
  onClose,
  onSuccess,
}) => {
  const { completeDelivery } = useDeliveryContext();
  const [otp, setOtp] = useState('');
  const [cashCollectedCheck, setCashCollectedCheck] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isCod = order.paymentMode === 'CASH_ON_DELIVERY';

  const handleVerify = () => {
    if (isCod && !cashCollectedCheck) {
      setErrorMsg('Please confirm you collected ₹' + order.totalAmount + ' in cash.');
      return;
    }

    const res = completeDelivery(otp);
    if (res.success) {
      setErrorMsg('');
      setOtp('');
      onClose();
      onSuccess(order.totalPayout);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleAutoFill = () => {
    setOtp(order.otp || '1234');
    if (isCod) setCashCollectedCheck(true);
    setErrorMsg('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: Colors.overlay,
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
            paddingBottom: 36,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>
                Complete Delivery Verification
              </Text>
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                Order #{order.orderNumber} • {order.customerName}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* COD Alert if applicable */}
          {isCod && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setCashCollectedCheck(!cashCollectedCheck)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: cashCollectedCheck ? Colors.primaryBg : Colors.amberLight,
                borderColor: cashCollectedCheck ? Colors.primary : Colors.amber,
                borderWidth: 1.5,
                borderRadius: 12,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Ionicons
                name={cashCollectedCheck ? 'checkbox' : 'square-outline'}
                size={22}
                color={cashCollectedCheck ? Colors.primary : Colors.amber}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                  I have collected ₹{order.totalAmount} in Cash
                </Text>
                <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                  Ensure exact cash received before handing over package
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* OTP Input Card */}
          <View
            style={{
              backgroundColor: Colors.surfaceCard,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: Colors.border,
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                Ask Customer for 4-Digit Delivery OTP
              </Text>
              <TouchableOpacity onPress={handleAutoFill}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.primaryDark }}>
                  Auto-fill ({order.otp})
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={otp}
              onChangeText={(txt) => {
                setOtp(txt);
                setErrorMsg('');
              }}
              placeholder="Enter 4-digit OTP"
              placeholderTextColor={Colors.textMuted}
              keyboardType="number-pad"
              maxLength={4}
              style={{
                backgroundColor: Colors.surfaceLight,
                borderColor: errorMsg ? Colors.danger : Colors.primary,
                borderWidth: 1.5,
                borderRadius: 12,
                paddingVertical: 14,
                textAlign: 'center',
                fontSize: 24,
                fontWeight: '900',
                color: Colors.text,
                letterSpacing: 8,
              }}
            />

            {errorMsg ? (
              <Text style={{ fontSize: 12, color: Colors.danger, marginTop: 6, textAlign: 'center' }}>
                {errorMsg}
              </Text>
            ) : null}
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleVerify}
            style={{
              backgroundColor: Colors.primary,
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
            }}
          >
            <Ionicons name="checkmark-circle" size={20} color={Colors.white} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, fontWeight: '900', color: Colors.white }}>
              VERIFY & COMPLETE ORDER
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
