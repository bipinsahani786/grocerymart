import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useDeliveryContext } from '../../context/DeliveryContext';
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
  const screenWidth = Dimensions.get('window').width;

  // Full-width docked bottom bar dimensions
  const bottomInset = Math.max(insets.bottom, 12);
  const navHeight = 64 + bottomInset;
  const slopeWidth = 32;  // Width of left / and right \ slopes
  const slopeHeight = 14; // Height drop of the side shoulders
  const notchRadius = 42; // Center dip radius
  const notchDepth = 36;  // Deep center curve depth
  const cx = screenWidth / 2;

  const leftTabs: {
    id: PartnerTab;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'speedometer-outline',
      activeIcon: 'speedometer',
    },
    {
      id: 'trips',
      label: 'Trips',
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
      label: 'Earnings',
      icon: 'wallet-outline',
      activeIcon: 'wallet',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person-outline',
      activeIcon: 'person',
    },
  ];

  // Full-width / \ sloping top shoulder path with deep center scoop:
  // - Starts at left edge (0, slopeHeight)
  // - Slopes up-right (/) to (slopeWidth, 0)
  // - Runs along top edge towards center
  // - Deeply scoops down around center button (cx, notchDepth = 36)
  // - Runs to right top edge (screenWidth - slopeWidth, 0)
  // - Slopes down-right (\) to right edge (screenWidth, slopeHeight)
  // - Goes straight down to bottom right (screenWidth, navHeight)
  // - Goes straight left along screen bottom (0, navHeight)
  // - Goes back up to (0, slopeHeight) and closes
  const dPath = `
    M 0 ${slopeHeight}
    Q 4 2 ${slopeWidth} 0
    L ${cx - notchRadius - 12} 0
    C ${cx - notchRadius + 2} 0, ${cx - 24} ${notchDepth}, ${cx} ${notchDepth}
    C ${cx + 24} ${notchDepth}, ${cx + notchRadius - 2} 0, ${cx + notchRadius + 12} 0
    L ${screenWidth - slopeWidth} 0
    Q ${screenWidth - 4} 2 ${screenWidth} ${slopeHeight}
    L ${screenWidth} ${navHeight}
    L 0 ${navHeight}
    Z
  `;

  return (
    <View
      pointerEvents="box-none"
      style={[
        tw`absolute left-0 right-0 bottom-0 w-full`,
        {
          height: navHeight,
          zIndex: 50,
        },
      ]}
    >
      {/* ================= SVG SLOPING THEME GREEN BACKGROUND ================= */}
      <View
        style={[
          tw`absolute inset-0`,
          {
            shadowColor: '#047857',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.25,
            shadowRadius: 10,
            elevation: 16,
          },
        ]}
      >
        <Svg width={screenWidth} height={navHeight} style={tw`absolute inset-0`}>
          <Defs>
            <LinearGradient id="greenThemeGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#10B981" stopOpacity="1" />
              <Stop offset="1" stopColor="#047857" stopOpacity="1" />
            </LinearGradient>
          </Defs>
          <Path
            d={dPath}
            fill="url(#greenThemeGradient)"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth={1}
          />
        </Svg>
      </View>

      {/* ================= 4 TAB ICONS CONTAINER WITH SAFE AREA PADDING ================= */}
      <View
        style={[
          tw`absolute inset-0 flex-row items-center justify-between px-3`,
          {
            paddingBottom: bottomInset,
            paddingTop: 8,
          },
        ]}
      >
        {/* LEFT 2 TABS */}
        <View style={tw`flex-row flex-1 justify-around pr-2`}>
          {leftTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.75}
                onPress={() => onTabChange(tab.id)}
                style={tw`items-center justify-center py-0.5 flex-1`}
              >
                <View style={tw`items-center justify-center`}>
                  {/* Pure 100% Round Circle (No Android Elevation Square Shadow) */}
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    }}
                  >
                    <Ionicons
                      name={isActive ? tab.activeIcon : tab.icon}
                      size={20}
                      color={isActive ? '#047857' : '#FFFFFF'}
                    />
                  </View>
                  <Text
                    style={[
                      tw`text-xs mt-0.5 tracking-tight`,
                      {
                        color: '#FFFFFF',
                        fontWeight: isActive ? '900' : '600',
                        opacity: isActive ? 1 : 0.9,
                        fontSize: 11,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* CENTER GAP FOR FLOATING ACTION BUTTON */}
        <View style={{ width: notchRadius * 2 + 6 }} />

        {/* RIGHT 2 TABS */}
        <View style={tw`flex-row flex-1 justify-around pl-2`}>
          {rightTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                activeOpacity={0.75}
                onPress={() => onTabChange(tab.id)}
                style={tw`items-center justify-center py-0.5 flex-1`}
              >
                <View style={tw`items-center justify-center`}>
                  {/* Pure 100% Round Circle (No Android Elevation Square Shadow) */}
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      overflow: 'hidden',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                    }}
                  >
                    <Ionicons
                      name={isActive ? tab.activeIcon : tab.icon}
                      size={20}
                      color={isActive ? '#047857' : '#FFFFFF'}
                    />
                  </View>
                  <Text
                    style={[
                      tw`text-xs mt-0.5 tracking-tight`,
                      {
                        color: '#FFFFFF',
                        fontWeight: isActive ? '900' : '600',
                        opacity: isActive ? 1 : 0.9,
                        fontSize: 11,
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ================= CENTER FLOATING CIRCULAR BUTTON (LIFTED HIGHER) ================= */}
      <View
        pointerEvents="box-none"
        style={[
          tw`absolute items-center justify-center`,
          {
            top: -26,
            left: cx - 29,
            width: 58,
            height: 58,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => onTabChange('active')}
          style={[
            tw`w-14 h-14 rounded-full justify-center items-center relative`,
            {
              backgroundColor: '#FFFFFF',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 16,
              borderWidth: 3,
              borderColor: '#ECFDF5',
            },
          ]}
        >
          <Ionicons
            name={activeOrder ? 'bicycle' : 'storefront'}
            size={26}
            color="#047857"
          />

          {/* Active order live notification badge */}
          {activeOrder && (
            <View
              style={[
                tw`absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full justify-center items-center border-2`,
                { backgroundColor: Colors.amber, borderColor: Colors.white },
              ]}
            >
              <Text style={[tw`text-[8px] font-black`, { color: Colors.white }]}>
                1
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};



