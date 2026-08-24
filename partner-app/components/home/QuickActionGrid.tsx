import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

interface QuickActionGridProps {
  onDepositCash?: () => void;
  onOpenSupport?: () => void;
  onOpenHotspots?: () => void;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  onDepositCash,
  onOpenSupport,
  onOpenHotspots,
}) => {
  const actions: {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    bg: string;
    onPress?: () => void;
  }[] = [
    {
      id: 'cash_deposit',
      title: 'Deposit Cash',
      icon: 'wallet-outline',
      color: Colors.primaryDark,
      bg: Colors.primaryBg,
      onPress: onDepositCash,
    },
    {
      id: 'store_hubs',
      title: 'Store Hubs',
      icon: 'storefront-outline',
      color: Colors.blueDark,
      bg: Colors.blueLight,
      onPress: onOpenHotspots,
    },
    {
      id: 'hotspots',
      title: 'Hotspots',
      icon: 'flame-outline',
      color: Colors.amberDark,
      bg: Colors.amberLight,
      onPress: onOpenHotspots,
    },
    {
      id: 'support',
      title: 'Captain Help',
      icon: 'headset-outline',
      color: Colors.purpleDark,
      bg: Colors.purpleLight,
      onPress: onOpenSupport,
    },
  ];

  return (
    <View style={tw`mb-4`}>
      <Text style={[tw`text-xs font-black uppercase tracking-wider mb-2.5 px-0.5`, { color: Colors.textSecondary }]}>
        Station Quick Tools
      </Text>

      <View style={tw`flex-row justify-between gap-2`}>
        {actions.map((act) => (
          <TouchableOpacity
            key={act.id}
            activeOpacity={0.85}
            onPress={act.onPress}
            style={[
              tw`flex-1 p-3 rounded-2xl items-center shadow-sm`,
              { backgroundColor: Colors.surface },
            ]}
          >
            <View
              style={[
                tw`w-10 h-10 rounded-xl justify-center items-center mb-1.5`,
                { backgroundColor: act.bg },
              ]}
            >
              <Ionicons name={act.icon} size={20} color={act.color} />
            </View>
            <Text style={[tw`text-[11px] font-extrabold text-center`, { color: Colors.text }]}>
              {act.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
