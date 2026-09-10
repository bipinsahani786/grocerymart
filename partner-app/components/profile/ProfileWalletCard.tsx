import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface ProfileWalletCardProps {
  realWallet: number;
  realTotalEarned: number;
  onOpenWallet?: () => void;
  onOpenDeposit: () => void;
}

export const ProfileWalletCard: React.FC<ProfileWalletCardProps> = ({
  realWallet,
  realTotalEarned,
  onOpenWallet,
  onOpenDeposit,
}) => {
  return (
    <View style={tw`my-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md`}>
      <View style={tw`flex-row justify-between items-center mb-2`}>
        <View style={tw`flex-row items-center`}>
          <View
            style={tw`w-8 h-8 rounded-xl bg-emerald-500/20 items-center justify-center mr-2.5 border border-emerald-500/30`}
          >
            <Ionicons name="wallet-outline" size={17} color="#34D399" />
          </View>
          <View>
            <Text style={tw`text-[10.5px] font-bold text-slate-400 uppercase tracking-wider`}>
              Account Wallet Balance
            </Text>
            <Text style={tw`text-[9.5px] font-medium text-emerald-400`}>
              Live Database Balance
            </Text>
          </View>
        </View>

        {onOpenWallet && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenWallet}
            style={tw`flex-row items-center px-2 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30`}
          >
            <Text style={tw`text-[10px] font-bold text-emerald-400 mr-1`}>Manage</Text>
            <Ionicons name="arrow-forward" size={10} color="#34D399" />
          </TouchableOpacity>
        )}
      </View>

      <View style={tw`flex-row items-baseline justify-between pt-1 pb-3 border-b border-slate-800`}>
        <View style={tw`flex-row items-baseline`}>
          <Text style={tw`text-2xl font-black text-white mr-1.5`}>
            ₹{realWallet.toLocaleString('en-IN')}
          </Text>
          <Text style={tw`text-xs font-semibold text-slate-400`}>
            Available
          </Text>
        </View>

        <View style={tw`items-end`}>
          <Text style={tw`text-[9.5px] text-slate-400`}>Total Lifetime Earned</Text>
          <Text style={tw`text-xs font-bold text-emerald-400`}>
            ₹{realTotalEarned.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Action Row */}
      <View style={tw`flex-row gap-2 pt-3`}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenWallet}
          style={tw`flex-1 py-2.5 rounded-xl bg-emerald-600 flex-row items-center justify-center shadow-sm`}
        >
          <Ionicons name="cash-outline" size={14} color="#FFFFFF" style={tw`mr-1.5`} />
          <Text style={tw`text-xs font-black text-white tracking-wide`}>WITHDRAW</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onOpenDeposit}
          style={tw`flex-1 py-2.5 rounded-xl bg-slate-800 border border-slate-700 flex-row items-center justify-center`}
        >
          <Ionicons name="arrow-down-circle-outline" size={14} color="#E2E8F0" style={tw`mr-1.5`} />
          <Text style={tw`text-xs font-black text-slate-200 tracking-wide`}>DEPOSIT CASH</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
