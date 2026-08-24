import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

export const DailyMilestoneQuestCard: React.FC = () => {
  const currentTrips = 8;
  const targetTrips = 12;
  const bonusReward = 180;
  const progressPercent = Math.min(100, Math.round((currentTrips / targetTrips) * 100));

  return (
    <View
      style={[
        tw`rounded-2xl p-4 mb-3.5 shadow-sm`,
        { backgroundColor: Colors.surface },
      ]}
    >
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <View style={tw`flex-row items-center flex-1 mr-2`}>
          <Ionicons name="trophy-outline" size={16} color={Colors.amberDark} style={tw`mr-2`} />
          <View style={tw`flex-1`}>
            <Text style={[tw`text-xs font-black`, { color: Colors.text }]}>
              Evening Rush Hour Bonus Quest
            </Text>
            <Text style={[tw`text-[10px]`, { color: Colors.textSecondary }]}>
              {currentTrips}/{targetTrips} trips done • 4 more for +₹{bonusReward}
            </Text>
          </View>
        </View>

        <View
          style={[
            tw`px-2 py-0.5 rounded-md`,
            { backgroundColor: Colors.primaryBg },
          ]}
        >
          <Text style={[tw`text-[11px] font-black`, { color: Colors.primaryDark }]}>
            +₹{bonusReward}
          </Text>
        </View>
      </View>

      {/* Progress Line */}
      <View style={[tw`h-1.5 rounded-full overflow-hidden mt-1`, { backgroundColor: Colors.surfaceLight }]}>
        <View
          style={[
            tw`h-full rounded-full`,
            { width: `${progressPercent}%`, backgroundColor: Colors.amber },
          ]}
        />
      </View>
    </View>
  );
};
