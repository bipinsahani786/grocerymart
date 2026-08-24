import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useDeliveryContext } from '../../context/DeliveryContext';

export const IncomingOrderModal: React.FC = () => {
  const { incomingOrder, acceptIncomingOrder, rejectIncomingOrder } = useDeliveryContext();
  const [secondsRemaining, setSecondsRemaining] = useState(45);

  useEffect(() => {
    if (!incomingOrder) {
      setSecondsRemaining(45);
      return;
    }
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          rejectIncomingOrder();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [incomingOrder, rejectIncomingOrder]);

  if (!incomingOrder) return null;

  return (
    <Modal visible={!!incomingOrder} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.85)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: Colors.surface,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderWidth: 2,
            borderColor: Colors.primary,
            padding: 20,
            paddingBottom: 36,
          }}
        >
          {/* Header & Timer */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 8,
                }}
              >
                <Ionicons name="bicycle" size={18} color={Colors.primary} />
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>
                New Delivery Request!
              </Text>
            </View>

            {/* Countdown Badge */}
            <View
              style={{
                backgroundColor: secondsRemaining < 15 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                borderColor: secondsRemaining < 15 ? Colors.danger : Colors.amber,
                borderWidth: 1.5,
                borderRadius: 20,
                paddingHorizontal: 10,
                paddingVertical: 4,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Ionicons
                name="timer-outline"
                size={14}
                color={secondsRemaining < 15 ? Colors.danger : Colors.amber}
                style={{ marginRight: 4 }}
              />
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: '800',
                  color: secondsRemaining < 15 ? Colors.danger : Colors.amber,
                }}
              >
                {secondsRemaining}s
              </Text>
            </View>
          </View>

          {/* Payout Hero Card */}
          <View
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              borderColor: Colors.primary,
              borderWidth: 1.5,
              borderRadius: 16,
              padding: 16,
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primaryLight }}>
              ESTIMATED TRIP EARNING
            </Text>
            <Text style={{ fontSize: 36, fontWeight: '900', color: Colors.text, marginVertical: 2 }}>
              ₹{incomingOrder.totalPayout}
            </Text>

            <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
              <Text style={{ fontSize: 11, color: Colors.textSecondary }}>
                Base: ₹{incomingOrder.payoutEarnings}
              </Text>
              <Text style={{ fontSize: 11, color: Colors.amber, fontWeight: '700' }}>
                Surge: +₹{incomingOrder.surgeBonus}
              </Text>
              <Text style={{ fontSize: 11, color: Colors.primaryLight, fontWeight: '700' }}>
                Tip: +₹{incomingOrder.tipAmount}
              </Text>
            </View>
          </View>

          {/* Route Details */}
          <View
            style={{
              backgroundColor: Colors.surfaceCard,
              borderRadius: 14,
              padding: 14,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            {/* Pickup */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ alignItems: 'center', marginRight: 10, marginTop: 2 }}>
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: Colors.blue,
                  }}
                />
                <View style={{ width: 2, height: 26, backgroundColor: Colors.border, marginVertical: 2 }} />
                <View
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 6,
                    backgroundColor: Colors.primary,
                  }}
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ marginBottom: 10 }}>
                  <Text style={{ fontSize: 11, color: Colors.blue, fontWeight: '700' }}>
                    PICKUP ({incomingOrder.storeDistanceKm} km • ~{incomingOrder.storeEstimatedMins} mins)
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text, marginTop: 1 }}>
                    {incomingOrder.storeName}
                  </Text>
                </View>

                <View>
                  <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: '700' }}>
                    DROP ({incomingOrder.customerDistanceKm} km • ~{incomingOrder.customerEstimatedMins} mins)
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text, marginTop: 1 }}>
                    {incomingOrder.customerAddress}
                  </Text>
                </View>
              </View>
            </View>

            {/* Order meta pills */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: Colors.border,
              }}
            >
              <Text style={{ fontSize: 12, color: Colors.textSecondary }}>
                📦 {incomingOrder.itemsCount} Items ({incomingOrder.paymentMode === 'PREPAID' ? '💳 Prepaid' : '💵 COD'})
              </Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.text }}>
                Total: {(incomingOrder.storeDistanceKm + incomingOrder.customerDistanceKm).toFixed(1)} km
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={rejectIncomingOrder}
              style={{
                flex: 1,
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                borderColor: Colors.danger,
                borderWidth: 1.5,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 15, fontWeight: '700', color: Colors.danger }}>
                Pass / Reject
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={acceptIncomingOrder}
              style={{
                flex: 2,
                backgroundColor: Colors.primary,
                borderRadius: 14,
                paddingVertical: 14,
                alignItems: 'center',
                flexDirection: 'row',
                justifyContent: 'center',
                shadowColor: Colors.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.4,
                shadowRadius: 8,
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color={Colors.textDark} style={{ marginRight: 8 }} />
              <Text style={{ fontSize: 16, fontWeight: '900', color: Colors.textDark }}>
                ACCEPT TRIP
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
