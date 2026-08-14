import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

/**
 * Single Responsibility: Refer & Earn and My Coupons hub.
 */
export const ProfileOffersSection: React.FC = () => {
  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1`}>
        Offers & Rewards
      </Text>
      <View style={tw`rounded-3xl bg-white border border-slate-100 p-2 shadow-2xs`}>
        <TouchableOpacity style={tw`flex-row items-center justify-between p-3 border-b border-slate-50`}>
          <View style={tw`flex-row items-center gap-3`}>
            <View style={tw`w-8 h-8 rounded-xl bg-amber-50 items-center justify-center`}>
              <Ionicons name="gift-outline" size={17} color="#D97706" />
            </View>
            <View>
              <Text style={tw`text-xs font-black text-slate-800`}>Refer & Earn ₹150</Text>
              <Text style={tw`text-[10px] font-medium text-slate-400`}>Share your invite code with friends</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={tw`flex-row items-center justify-between p-3`}>
          <View style={tw`flex-row items-center gap-3`}>
            <View style={tw`w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center`}>
              <Ionicons name="pricetag-outline" size={17} color="#059669" />
            </View>
            <View>
              <Text style={tw`text-xs font-black text-slate-800`}>My Coupons & Deals</Text>
              <Text style={tw`text-[10px] font-medium text-slate-400`}>3 discount vouchers available</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
