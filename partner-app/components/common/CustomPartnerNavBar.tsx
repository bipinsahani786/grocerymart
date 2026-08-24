import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

export type PartnerTab = 'home' | 'active' | 'trips' | 'earnings' | 'profile';

interface CustomPartnerNavBarProps {
  activeTab: PartnerTab;
  onTabChange: (tab: PartnerTab) => void;
}

export const CustomPartnerNavBar: React.FC<CustomPartnerNavBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const insets = useSafeAreaInsets();
  const { activeOrder } = useDeliveryContext();

  const tabs: { id: PartnerTab; label: string; icon: keyof typeof Ionicons.glyphMap; badge?: boolean }[] = [
    { id: 'home', label: 'Dashboard', icon: 'speedometer' },
    { id: 'active', label: 'Active Task', icon: 'navigate-circle', badge: !!activeOrder },
    { id: 'trips', label: 'Trips', icon: 'receipt' },
    { id: 'earnings', label: 'Earnings', icon: 'wallet' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <View
      style={[
        tw`flex-row border-t pt-2 px-2 justify-around shadow-lg`,
        {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab.id)}
            style={tw`flex-1 items-center justify-center py-1 relative`}
          >
            <View style={tw`relative`}>
              <Ionicons
                name={tab.icon}
                size={22}
                color={isActive ? Colors.primary : Colors.textMuted}
              />
              {tab.badge && (
                <View
                  style={[
                    tw`absolute -top-0.5 -right-1 w-2 h-2 rounded-full border`,
                    { backgroundColor: Colors.amber, borderColor: Colors.surface },
                  ]}
                />
              )}
            </View>
            <Text
              style={[
                tw`text-[11px] mt-0.5`,
                {
                  color: isActive ? Colors.primary : Colors.textMuted,
                  fontWeight: isActive ? '700' : '500',
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
