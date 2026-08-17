import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface ProfileWalletHubProps {
  walletBalance?: number;
  loyaltyPoints?: number;
}

/**
 * Single Responsibility: Renders Wallet Cash and Reward Coins dual balance cards with quick action buttons.
 */
export const ProfileWalletHub: React.FC<ProfileWalletHubProps> = ({
  walletBalance = 250,
  loyaltyPoints = 140,
}) => {
  return (
    <View style={tw`flex-row gap-3 mb-4`}>
      {/* Wallet Card */}
      <View style={tw`flex-1 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm justify-between`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-[11px] font-bold text-slate-400 uppercase tracking-wider`}>
            Wallet Cash
          </Text>
          <View style={tw`w-6 h-6 rounded-full bg-emerald-50 items-center justify-center`}>
            <Ionicons name="wallet-outline" size={13} color="#059669" />
          </View>
        </View>
        <Text style={tw`text-xl font-black text-slate-900 mb-2`}>
          ₹{walletBalance}
        </Text>
        <TouchableOpacity
          style={tw`py-1.5 rounded-xl bg-emerald-50 border border-emerald-100 items-center`}
          activeOpacity={0.7}
        >
          <Text style={tw`text-[10px] font-black text-emerald-700 uppercase tracking-wider`}>
            + Add Cash
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reward Points Card */}
      <View style={tw`flex-1 p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm justify-between`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-[11px] font-bold text-slate-400 uppercase tracking-wider`}>
            Reward Coins
          </Text>
          <View style={tw`w-6 h-6 rounded-full bg-amber-50 items-center justify-center`}>
            <Ionicons name="sparkles" size={13} color="#D97706" />
          </View>
        </View>
        <Text style={tw`text-xl font-black text-amber-600 mb-2`}>
          🪙 {loyaltyPoints}
        </Text>
        <TouchableOpacity
          style={tw`py-1.5 rounded-xl bg-amber-50 border border-amber-100 items-center`}
          activeOpacity={0.7}
        >
          <Text style={tw`text-[10px] font-black text-amber-700 uppercase tracking-wider`}>
            Redeem Coins
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
