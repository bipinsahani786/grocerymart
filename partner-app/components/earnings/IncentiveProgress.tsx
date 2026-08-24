import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { MOCK_INCENTIVES } from '../../constants/mockData';
import tw from 'twrnc';

export const IncentiveProgress: React.FC = () => {
  return (
    <View
      style={[
        tw`rounded-3xl p-4.5 mb-4 border shadow-sm`,
        {
          backgroundColor: Colors.surface,
          borderColor: Colors.border,
        },
      ]}
    >
      <View style={tw`flex-row justify-between items-center mb-3.5`}>
        <Text style={[tw`text-sm font-black text-slate-900`]}>
          Target Bonus & Quests
        </Text>
        <View style={tw`flex-row items-center px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200`}>
          <Ionicons name="flame" size={12} color={Colors.amberDark} style={tw`mr-1`} />
          <Text style={[tw`text-[10px] font-black text-amber-700`]}>2 Active</Text>
        </View>
      </View>

      <View style={tw`gap-3`}>
        {MOCK_INCENTIVES.map((inc) => {
          const percent = Math.min(100, (inc.progress / inc.target) * 100);
          return (
            <View
              key={inc.id}
              style={[
                tw`p-3.5 rounded-2xl border`,
                {
                  backgroundColor: '#F8FAFC',
                  borderColor: Colors.borderLight,
                },
              ]}
            >
              <View style={tw`flex-row justify-between items-start`}>
                <View style={tw`flex-1 mr-2`}>
                  <View style={tw`flex-row items-center`}>
                    <Ionicons name="gift-outline" size={15} color={Colors.amberDark} style={tw`mr-1.5`} />
                    <Text style={[tw`text-xs font-bold text-slate-800`]}>
                      {inc.title}
                    </Text>
                  </View>
                  <Text style={[tw`text-[10px] text-slate-500 mt-0.5`]}>
                    {inc.description}
                  </Text>
                </View>
                <View style={tw`px-2 py-1 rounded-xl bg-emerald-50 border border-emerald-200`}>
                  <Text style={[tw`text-xs font-black text-emerald-700`]}>
                    +₹{inc.rewardAmount}
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              <View style={tw`mt-3`}>
                <View style={tw`h-2 bg-slate-200 rounded-full overflow-hidden`}>
                  <View
                    style={[
                      tw`h-full rounded-full`,
                      {
                        width: `${percent}%`,
                        backgroundColor: percent >= 100 ? Colors.primary : Colors.amber,
                      },
                    ]}
                  />
                </View>
                <View style={tw`flex-row justify-between items-center mt-1.5`}>
                  <Text style={[tw`text-[10px] font-bold text-slate-600`]}>
                    {inc.progress} of {inc.target} orders completed
                  </Text>
                  <Text style={[tw`text-[10px] font-bold text-amber-600`]}>
                    Expires in {inc.expiresIn}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

