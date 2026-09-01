import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

export type PartnerTab = 'home' | 'active' | 'trips' | 'earnings' | 'profile';
export type PartnerTabType = PartnerTab;

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
  const { t } = useLanguageContext();
  const screenWidth = Dimensions.get('window').width;

  // Full-width docked bottom bar dimensions
  const bottomInset = Math.max(insets.bottom, 12);
  const navHeight = 64 + bottomInset;
  const slopeWidth = 32;
  const slopeHeight = 14;
  const notchRadius = 42;
  const notchDepth = 36;
  const cx = screenWidth / 2;

  const leftTabs: {
    id: PartnerTab;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      id: 'home',
      label: t.home,
      icon: 'speedometer-outline',
      activeIcon: 'speedometer',
    },
    {
      id: 'trips',
      label: t.trips,
      icon: 'receipt-outline',
      activeIcon: 'receipt',
    },
  ];

  const rightTabs: {
    id: PartnerTab;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      id: 'earnings',
      label: t.earnings,
      icon: 'wallet-outline',
      activeIcon: 'wallet',
    },
    {
      id: 'profile',
      label: t.profile,
      icon: 'person-outline',
      activeIcon: 'person',
    },
  ];

  // SVG Path calculation
  const pathData = `
    M 0 0
    L ${cx - notchRadius - slopeWidth} 0
    C ${cx - notchRadius} 0, ${cx - notchRadius + 4} ${slopeHeight}, ${cx - notchRadius + 14} ${slopeHeight + 4}
    C ${cx - notchRadius + 24} ${notchDepth}, ${cx - 16} ${notchDepth + 6}, ${cx} ${notchDepth + 6}
    C ${cx + 16} ${notchDepth + 6}, ${cx + notchRadius - 24} ${notchDepth}, ${cx + notchRadius - 14} ${slopeHeight + 4}
    C ${cx + notchRadius - 4} ${slopeHeight}, ${cx + notchRadius} 0, ${cx + notchRadius + slopeWidth} 0
    L ${screenWidth} 0
    L ${screenWidth} ${navHeight}
    L 0 ${navHeight}
    Z
  `;

  return (
    <View
      style={[
        tw`absolute bottom-0 left-0 right-0 z-40`,
        { height: navHeight },
      ]}
      pointerEvents="box-none"
    >
      {/* Background SVG Canvas */}
      <View style={tw`absolute inset-0`}>
        <Svg width={screenWidth} height={navHeight}>
          <Defs>
            <LinearGradient id="emeraldBarGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#047857" stopOpacity="1" />
              <Stop offset="100%" stopColor="#064E3B" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Path d={pathData} fill="url(#emeraldBarGrad)" />
        </Svg>
      </View>

      {/* Floating Center Action Button */}
      <View
        style={[
          tw`absolute items-center justify-center z-50`,
          {
            left: cx - 28,
            top: activeOrder ? -12 : -8,
            width: 56,
            height: 56,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => onTabChange('active')}
          style={[
            tw`w-14 h-14 rounded-full items-center justify-center shadow-lg border-2`,
            {
              backgroundColor: activeOrder ? '#10B981' : '#0F172A',
              borderColor: activeOrder ? '#A7F3D0' : '#047857',
            },
          ]}
        >
          <Ionicons
            name={activeOrder ? 'bicycle' : 'compass'}
            size={26}
            color="#FFFFFF"
          />
          {activeOrder && (
            <View style={tw`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 border border-white items-center justify-center`}>
              <Text style={{ color: '#FFFFFF', fontSize: 8, fontWeight: '900' }}>1</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Navigation Buttons Row */}
      <View style={[tw`flex-row items-center justify-between px-2 pt-2`, { height: 50 }]}>
        {/* Left Side Buttons */}
        <View style={tw`flex-row flex-1 justify-around pr-8`}>
          {leftTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.7}
                onPress={() => onTabChange(tab.id)}
                style={tw`items-center justify-center px-3 py-1`}
              >
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={20}
                  color={isActive ? '#34D399' : '#A7F3D0'}
                />
                <Text
                  style={[
                    tw`text-[10px] mt-0.5`,
                    {
                      color: isActive ? '#FFFFFF' : '#D1FAE5',
                      fontWeight: isActive ? '900' : '600',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Right Side Buttons */}
        <View style={tw`flex-row flex-1 justify-around pl-8`}>
          {rightTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.7}
                onPress={() => onTabChange(tab.id)}
                style={tw`items-center justify-center px-3 py-1`}
              >
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={20}
                  color={isActive ? '#34D399' : '#A7F3D0'}
                />
                <Text
                  style={[
                    tw`text-[10px] mt-0.5`,
                    {
                      color: isActive ? '#FFFFFF' : '#D1FAE5',
                      fontWeight: isActive ? '900' : '600',
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};
