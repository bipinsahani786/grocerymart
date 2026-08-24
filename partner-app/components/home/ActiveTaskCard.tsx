import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useDutyContext } from '../../context/DutyContext';
import { StatusBadge } from '../common/StatusBadge';

interface ActiveTaskCardProps {
  onOpenActiveTask: () => void;
}

export const ActiveTaskCard: React.FC<ActiveTaskCardProps> = ({ onOpenActiveTask }) => {
  const { isOnline, toggleDuty } = useDutyContext();
  const { activeOrder, triggerIncomingOrderSimulation } = useDeliveryContext();

  if (!isOnline) {
    return (
      <View
        style={{
          backgroundColor: Colors.surfaceCard,
          borderRadius: 16,
          padding: 20,
          borderWidth: 1,
          borderColor: Colors.border,
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: 'rgba(100, 116, 139, 0.2)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Ionicons name="power" size={24} color={Colors.textSecondary} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text }}>
          You Are Currently Off Duty
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: Colors.textSecondary,
            textAlign: 'center',
            marginTop: 4,
            marginBottom: 16,
          }}
        >
          Go online to start receiving instant grocery delivery requests in your zone.
        </Text>
        <TouchableOpacity
          onPress={toggleDuty}
          style={{
            backgroundColor: Colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 28,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="radio-button-on" size={16} color={Colors.textDark} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.textDark }}>
            GO ONLINE NOW
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (activeOrder) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onOpenActiveTask}
        style={{
          backgroundColor: Colors.surfaceCard,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1.5,
          borderColor: Colors.primary,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: Colors.primary,
                marginRight: 8,
              }}
            />
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primaryLight }}>
              ACTIVE TRIP: {activeOrder.orderNumber}
            </Text>
          </View>
          <StatusBadge status={activeOrder.status} />
        </View>

        {/* Route info */}
        <View style={{ marginTop: 12, backgroundColor: Colors.surfaceLight, borderRadius: 10, padding: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="storefront" size={16} color={Colors.blue} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }} numberOfLines={1}>
              {activeOrder.storeName}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="location" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: Colors.text }} numberOfLines={1}>
              {activeOrder.customerAddress}
            </Text>
          </View>
        </View>

        {/* Footer info: payout and continue button */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 12,
          }}
        >
          <View>
            <Text style={{ fontSize: 11, color: Colors.textMuted }}>Trip Payout</Text>
            <Text style={{ fontSize: 16, fontWeight: '800', color: Colors.primary }}>
              ₹{activeOrder.totalPayout}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: Colors.primary,
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark, marginRight: 6 }}>
              Continue Order
            </Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.textDark} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Idle state: waiting for order
  return (
    <View
      style={{
        backgroundColor: Colors.surfaceCard,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        marginBottom: 16,
      }}
    >
      <View
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <Ionicons name="radio" size={28} color={Colors.primary} />
      </View>

      <Text style={{ fontSize: 16, fontWeight: '700', color: Colors.text }}>
        Looking for Nearby Orders...
      </Text>
      <Text
        style={{
          fontSize: 12,
          color: Colors.textSecondary,
          textAlign: 'center',
          marginTop: 4,
          marginBottom: 16,
        }}
      >
        You are in the high priority queue for Koramangala Hub #04. Stay close to the store for faster assignments.
      </Text>

      {/* Simulator Action Button */}
      <TouchableOpacity
        onPress={triggerIncomingOrderSimulation}
        activeOpacity={0.85}
        style={{
          backgroundColor: Colors.surfaceLight,
          borderColor: Colors.primary,
          borderWidth: 1.5,
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Ionicons name="notifications-circle" size={18} color={Colors.primary} style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.primaryLight }}>
          Test Simulated Delivery Alert
        </Text>
      </TouchableOpacity>
    </View>
  );
};
