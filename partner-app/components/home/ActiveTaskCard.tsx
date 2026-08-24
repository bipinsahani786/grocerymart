import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useDutyContext } from '../../context/DutyContext';
import { StatusBadge } from '../common/StatusBadge';
import tw from 'twrnc';

interface ActiveTaskCardProps {
  onOpenActiveTask?: () => void;
}

export const ActiveTaskCard: React.FC<ActiveTaskCardProps> = ({ onOpenActiveTask }) => {
  const { activeOrder, triggerIncomingOrderSimulation } = useDeliveryContext();
  const { isOnline, toggleDuty, currentHub } = useDutyContext();

  // State 1: OFF DUTY
  if (!isOnline) {
    return (
      <View
        style={[
          tw`rounded-2xl p-4 mb-3.5 shadow-sm items-center`,
          { backgroundColor: Colors.surface },
        ]}
      >
        <Ionicons name="power" size={24} color={Colors.textMuted} style={tw`mb-2`} />
        <Text style={[tw`text-sm font-black`, { color: Colors.text }]}>
          You Are Currently Offline
        </Text>
        <Text style={[tw`text-[11px] text-center mt-0.5 mb-3`, { color: Colors.textSecondary }]}>
          Go online to start receiving instant grocery orders in your zone.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={toggleDuty}
          style={[
            tw`flex-row items-center px-5 py-2.5 rounded-xl shadow-sm`,
            { backgroundColor: Colors.primary },
          ]}
        >
          <Ionicons name="radio-button-on" size={14} color={Colors.white} style={tw`mr-1.5`} />
          <Text style={[tw`text-xs font-black tracking-wide`, { color: Colors.white }]}>
            GO ONLINE
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // State 2: ACTIVE ORDER IN PROGRESS
  if (activeOrder) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onOpenActiveTask}
        style={[
          tw`rounded-2xl p-4 mb-3.5 shadow-sm`,
          { backgroundColor: Colors.surface },
        ]}
      >
        {/* Top Header */}
        <View style={tw`flex-row justify-between items-center mb-2.5`}>
          <View style={tw`flex-row items-center`}>
            <View style={[tw`w-2 h-2 rounded-full mr-2`, { backgroundColor: Colors.primary }]} />
            <Text style={[tw`text-xs font-black`, { color: Colors.primaryDark }]}>
              ACTIVE ORDER #{activeOrder.orderNumber}
            </Text>
          </View>
          <StatusBadge status={activeOrder.status} />
        </View>

        {/* Route Snapshot */}
        <View style={tw`py-1`}>
          <View style={tw`flex-row items-center mb-1.5`}>
            <Ionicons name="storefront" size={13} color={Colors.blue} style={tw`mr-2`} />
            <Text style={[tw`text-xs font-bold flex-1`, { color: Colors.text }]} numberOfLines={1}>
              {activeOrder.storeName}
            </Text>
            <Text style={[tw`text-[10px]`, { color: Colors.textSecondary }]}>
              {activeOrder.storeDistanceKm} km
            </Text>
          </View>

          <View style={tw`flex-row items-center`}>
            <Ionicons name="location" size={13} color={Colors.primary} style={tw`mr-2`} />
            <Text style={[tw`text-xs font-bold flex-1`, { color: Colors.text }]} numberOfLines={1}>
              {activeOrder.customerAddress}
            </Text>
            <Text style={[tw`text-[10px]`, { color: Colors.textSecondary }]}>
              {activeOrder.customerDistanceKm} km
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={[tw`flex-row justify-between items-center pt-2.5 mt-2 border-t`, { borderTopColor: Colors.borderLight }]}>
          <Text style={[tw`text-xs font-black`, { color: Colors.primaryDark }]}>
            Earn: ₹{activeOrder.totalPayout}
          </Text>

          <View style={tw`flex-row items-center`}>
            <Text style={[tw`text-xs font-bold mr-1`, { color: Colors.primary }]}>
              View Route
            </Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // State 3: IDLE ON DUTY (Radar Live Search Mode)
  return (
    <View
      style={[
        tw`rounded-2xl p-4 mb-3.5 shadow-sm`,
        { backgroundColor: Colors.surface },
      ]}
    >
      <View style={tw`flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <View
            style={[
              tw`w-9 h-9 rounded-xl justify-center items-center mr-3`,
              { backgroundColor: Colors.primaryBg },
            ]}
          >
            <Ionicons name="radio" size={20} color={Colors.primaryDark} />
          </View>
          <View style={tw`flex-1`}>
            <Text style={[tw`text-xs font-black`, { color: Colors.text }]}>
              Looking for Nearby Orders...
            </Text>
            <Text style={[tw`text-[10px] mt-0.5`, { color: Colors.textSecondary }]} numberOfLines={1}>
              Stationed at {currentHub}
            </Text>
          </View>
        </View>

        {/* Action Trigger */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={triggerIncomingOrderSimulation}
          style={[
            tw`px-3 py-1.5 rounded-lg border`,
            { backgroundColor: Colors.surfaceLight, borderColor: Colors.border },
          ]}
        >
          <Text style={[tw`text-[11px] font-bold`, { color: Colors.primaryDark }]}>
            Test Order
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
