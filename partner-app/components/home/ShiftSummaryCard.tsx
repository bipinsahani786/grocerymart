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

  return (
    <View
      style={[
        tw`rounded-2xl p-4 border mb-4 shadow-sm`,
        { backgroundColor: Colors.surface, borderColor: Colors.border },
      ]}
    >
      {/* Top row: Earnings & Details link */}
      <View style={tw`flex-row justify-between items-start`}>
        <View>
          <Text style={[tw`text-xs font-semibold`, { color: Colors.textSecondary }]}>
            {"TODAY'S EARNINGS"}
          </Text>
          <Text style={[tw`text-3xl font-black mt-0.5`, { color: Colors.text }]}>
            ₹{earningsSummary.todayTotal}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onViewWallet}
          style={[
            tw`flex-row items-center border px-2.5 py-1.5 rounded-lg`,
            { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
          ]}
        >
          <Text style={[tw`text-xs font-bold mr-1`, { color: Colors.primaryDark }]}>
            Wallet
          </Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {/* Metrics Row: Trips, Online Time, Floating Cash */}
      <View
        style={[
          tw`flex-row rounded-xl p-3 mt-3.5 justify-between border`,
          { backgroundColor: Colors.surfaceLight, borderColor: Colors.borderLight },
        ]}
      >
        <View style={tw`items-center flex-1`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="bicycle" size={14} color={Colors.primary} style={tw`mr-1`} />
            <Text style={[tw`text-base font-black`, { color: Colors.text }]}>
              {earningsSummary.tripsCount}
            </Text>
          </View>
          <Text style={[tw`text-[11px] mt-0.5`, { color: Colors.textSecondary }]}>
            Trips Done
          </Text>
        </View>

        <View style={[tw`w-[1px]`, { backgroundColor: Colors.border }]} />

        <View style={tw`items-center flex-1`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="time-outline" size={14} color={Colors.amber} style={tw`mr-1`} />
            <Text style={[tw`text-base font-black`, { color: Colors.text }]}>
              {formattedShiftTime}
            </Text>
          </View>
          <Text style={[tw`text-[11px] mt-0.5`, { color: Colors.textSecondary }]}>
            Shift Time
          </Text>
        </View>

        <View style={[tw`w-[1px]`, { backgroundColor: Colors.border }]} />

        <View style={tw`items-center flex-1`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="cash-outline" size={14} color={Colors.blue} style={tw`mr-1`} />
            <Text style={[tw`text-base font-black`, { color: Colors.text }]}>
              ₹{earningsSummary.cashCollected}
            </Text>
          </View>
          <Text style={[tw`text-[11px] mt-0.5`, { color: Colors.textSecondary }]}>
            Cash in Hand
          </Text>
        </View>
      </View>

      {/* Breakdown chips */}
      <View style={[tw`flex-row flex-wrap gap-2 mt-3 pt-2.5 border-t`, { borderTopColor: Colors.border }]}>
        <View style={tw`flex-row items-center`}>
          <Text style={[tw`text-[11px]`, { color: Colors.textMuted }]}>Base Pay: </Text>
          <Text style={[tw`text-[11px] font-bold`, { color: Colors.text }]}>₹{earningsSummary.basePay}</Text>
        </View>
        <Text style={{ color: Colors.textMuted }}>•</Text>
        <View style={tw`flex-row items-center`}>
          <Text style={[tw`text-[11px]`, { color: Colors.textMuted }]}>Surge: </Text>
          <Text style={[tw`text-[11px] font-bold`, { color: Colors.amberDark }]}>+₹{earningsSummary.surgeBonus}</Text>
        </View>
        <Text style={{ color: Colors.textMuted }}>•</Text>
        <View style={tw`flex-row items-center`}>
          <Text style={[tw`text-[11px]`, { color: Colors.textMuted }]}>Tips: </Text>
          <Text style={[tw`text-[11px] font-bold`, { color: Colors.primaryDark }]}>+₹{earningsSummary.tips}</Text>
        </View>
      </View>
    </View>
  );
};
