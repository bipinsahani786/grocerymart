import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useDutyContext } from '../../context/DutyContext';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

interface ShiftSummaryCardProps {
  onViewWallet?: () => void;
}

export const ShiftSummaryCard: React.FC<ShiftSummaryCardProps> = ({ onViewWallet }) => {
  const { earningsSummary } = useDeliveryContext();
  const { formattedShiftTime } = useDutyContext();

  const dailyTarget = 1500;
  const progressPercent = Math.min(100, Math.round((earningsSummary.todayTotal / dailyTarget) * 100));

  return (
    <View
      style={[
        tw`rounded-2xl p-4.5 mb-3.5 shadow-sm`,
        { backgroundColor: Colors.surface },
      ]}
    >
      {/* Earnings Hero Row */}
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <View>
          <Text style={[tw`text-[11px] font-bold uppercase tracking-wider`, { color: Colors.textSecondary }]}>
            Today's Earnings
          </Text>
          <Text style={[tw`text-2xl font-black mt-0.5 tracking-tight`, { color: Colors.text }]}>
            ₹{earningsSummary.todayTotal}
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onViewWallet}
          style={[
            tw`flex-row items-center px-3 py-1.5 rounded-full`,
            { backgroundColor: Colors.primaryBg },
          ]}
        >
          <Ionicons name="flash" size={13} color={Colors.primaryDark} style={tw`mr-1`} />
          <Text style={[tw`text-xs font-black`, { color: Colors.primaryDark }]}>
            Withdraw
          </Text>
        </TouchableOpacity>
      </View>

      {/* Target Progress Bar */}
      <View style={tw`mb-3.5`}>
        <View style={tw`flex-row justify-between items-center mb-1`}>
          <Text style={[tw`text-[11px] font-semibold`, { color: Colors.textSecondary }]}>
            Target: ₹{dailyTarget}
          </Text>
          <Text style={[tw`text-[11px] font-bold`, { color: Colors.primaryDark }]}>
            {progressPercent}%
          </Text>
        </View>
        <View style={[tw`h-1.5 rounded-full overflow-hidden`, { backgroundColor: Colors.surfaceLight }]}>
          <View
            style={[
              tw`h-full rounded-full`,
              { width: `${progressPercent}%`, backgroundColor: Colors.primary },
            ]}
          />
        </View>
      </View>

      {/* Native Metrics Strip */}
      <View style={[tw`flex-row justify-between pt-3 border-t`, { borderTopColor: Colors.borderLight }]}>
        <View style={tw`items-center flex-1`}>
          <Text style={[tw`text-sm font-black`, { color: Colors.text }]}>
            {earningsSummary.tripsCount}
          </Text>
          <Text style={[tw`text-[10px] font-semibold`, { color: Colors.textSecondary }]}>
            Trips
          </Text>
        </View>

        <View style={[tw`w-[1px]`, { backgroundColor: Colors.borderLight }]} />

        <View style={tw`items-center flex-1`}>
          <Text style={[tw`text-sm font-black`, { color: Colors.text }]}>
            {formattedShiftTime}
          </Text>
          <Text style={[tw`text-[10px] font-semibold`, { color: Colors.textSecondary }]}>
            Shift
          </Text>
        </View>

        <View style={[tw`w-[1px]`, { backgroundColor: Colors.borderLight }]} />

        <View style={tw`items-center flex-1`}>
          <Text style={[tw`text-sm font-black`, { color: Colors.text }]}>
            ₹{earningsSummary.cashCollected}
          </Text>
          <Text style={[tw`text-[10px] font-semibold`, { color: Colors.textSecondary }]}>
            Cash in Hand
          </Text>
        </View>
      </View>
    </View>
  );
};
