import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface VipPerksBannerProps {
  onPress?: () => void;
}

export const VipPerksBanner: React.FC<VipPerksBannerProps> = ({ onPress }) => {
  return (
    <View style={tw`mb-6 px-4`}>
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        style={tw`bg-gradient-to-r bg-emerald-900 rounded-3xl p-4.5 border border-emerald-800 shadow-md relative overflow-hidden`}
      >
        {/* Background decorative circles */}
        <View style={[tw`absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-700/30`]} />
        <View style={[tw`absolute right-12 -top-8 w-20 h-20 rounded-full bg-emerald-600/20`]} />

        <View style={tw`flex-row justify-between items-center z-10`}>
          <View style={tw`flex-1 mr-3`}>
            <View style={tw`flex-row items-center gap-1.5 mb-1`}>
              <Ionicons name="diamond" size={14} color="#FBBF24" />
              <Text style={tw`text-[10px] font-black text-amber-400 uppercase tracking-widest`}>
                GROCERYMART VIP PASS
              </Text>
            </View>
            <Text style={tw`text-base font-black text-white leading-5`}>
              Unlimited FREE Deliveries
            </Text>
            <Text style={tw`text-[10px] font-bold text-emerald-200 mt-1`}>
              + Extra 5% cashback on every fresh & daily grocery order
            </Text>
          </View>

          <View style={tw`bg-amber-400 px-3.5 py-2 rounded-xl shadow-sm`}>
            <Text style={tw`text-[11px] font-black text-slate-900 uppercase tracking-wider`}>
              Join VIP
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};
