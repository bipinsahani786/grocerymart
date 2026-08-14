import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import tw from 'twrnc';

/**
 * Single Responsibility: Renders VIP Plus membership banner and perks.
 */
export const ProfileVipCard: React.FC = () => {
  return (
    <LinearGradient
      colors={['#064E3B', '#047857', '#059669']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={tw`p-4 rounded-3xl mb-4 shadow-md border border-emerald-400/30`}
    >
      <View style={tw`flex-row justify-between items-center mb-1`}>
        <View style={tw`flex-row items-center gap-1.5`}>
          <Text style={tw`text-base`}>👑</Text>
          <Text style={tw`text-sm font-black text-white tracking-wide`}>
            GroceryMart PLUS
          </Text>
        </View>
        <View style={tw`px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/40`}>
          <Text style={tw`text-[10px] font-black text-emerald-200 uppercase tracking-wider`}>
            VIP Active
          </Text>
        </View>
      </View>
      <Text style={tw`text-[11px] font-medium text-emerald-100/90 mb-2`}>
        Enjoy Unlimited FREE Deliveries & 10% instant cashback on fresh organic harvests.
      </Text>
      <View style={tw`flex-row justify-between items-center pt-2 border-t border-emerald-600/40`}>
        <Text style={tw`text-[10px] font-bold text-emerald-200`}>Membership valid till Dec 2026</Text>
        <Ionicons name="chevron-forward" size={14} color="#A7F3D0" />
      </View>
    </LinearGradient>
  );
};
