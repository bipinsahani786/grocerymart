import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
      >
        <LinearGradient
          colors={['#064E3B', '#022C22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={tw`rounded-2xl p-4.5 border border-emerald-700/50 shadow-md relative overflow-hidden`}
        >
          {/* Background decorative circles */}
          <View style={[tw`absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-emerald-500/10`]} />
          <View style={[tw`absolute right-14 -top-8 w-20 h-20 rounded-full bg-emerald-400/10`]} />

          <View style={tw`flex-row justify-between items-center z-10`}>
            <View style={tw`flex-1 mr-3`}>
              <View style={tw`flex-row items-center gap-1.5 mb-1`}>
                <Ionicons name="diamond" size={13} color="#FBBF24" />
                <Text style={tw`text-[9.5px] font-black text-amber-400 uppercase tracking-widest`}>
                  GROCERYMART VIP PASS
                </Text>
              </View>
              <Text style={tw`text-[15px] font-black text-white leading-5`}>
                Unlimited FREE Deliveries
              </Text>
              <Text style={tw`text-[10px] font-semibold text-emerald-200/90 mt-1`}>
                + Extra 5% instant cashback on all orders
              </Text>
            </View>

            <View style={tw`bg-amber-400 px-3.5 py-2 rounded-xl shadow-sm`}>
              <Text style={tw`text-[11px] font-black text-slate-900 uppercase tracking-wider`}>
                Join VIP
              </Text>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};
