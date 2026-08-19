import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../context/CartContext';
import { theme } from '../constants/theme';
import tw from 'twrnc';

import * as NavigationBar from 'expo-navigation-bar';

export type TabKey = 'home' | 'search' | 'cart' | 'profile';

export interface TabItem {
  key: TabKey;
  label: string;
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
}

interface CustomCurvedNavBarProps {
  activeTab: TabKey;
  onTabPress: (tab: TabKey) => void;
  isDark?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NAV_HORIZONTAL_MARGIN = 16;
const NAV_WIDTH = SCREEN_WIDTH - NAV_HORIZONTAL_MARGIN * 2;
const TAB_COUNT = 4;
const TAB_WIDTH = NAV_WIDTH / TAB_COUNT;
const BAR_HEIGHT = 64;
const CREST_SIZE = 60;
const BUBBLE_SIZE = 46;

const TABS: TabItem[] = [
  { key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
  { key: 'search', label: 'Search', activeIcon: 'search', inactiveIcon: 'search-outline' },
  { key: 'cart', label: 'Cart', activeIcon: 'basket', inactiveIcon: 'basket-outline' },
  { key: 'profile', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

/**
 * Single Responsibility: Renders a fluid, elevated BNB-27 style navigation bar
 * with a solid green foundation behind the device's native navigation bar.
 */
export const CustomCurvedNavBar: React.FC<CustomCurvedNavBarProps> = ({
  activeTab,
  onTabPress,
  isDark = false,
}) => {
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();

  const activeIndex = Math.max(0, TABS.findIndex((t) => t.key === activeTab));
  const animatedIndex = useRef(new Animated.Value(activeIndex)).current;
  const bubbleScale = useRef(new Animated.Value(1)).current;

  // Configure Android native system navigation bar button style safely for edge-to-edge
  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark').catch(() => {});
      } catch (_) {
        // Fallback for environments without navigation bar controls
      }
    }
  }, [isDark]);

  useEffect(() => {
    // Spring physics for active tab transition
    Animated.parallel([
      Animated.spring(animatedIndex, {
        toValue: activeIndex,
        friction: 6,
        tension: 70,
        useNativeDriver: false,
      }),
      Animated.sequence([
        Animated.timing(bubbleScale, {
          toValue: 0.82,
          duration: 90,
          useNativeDriver: false,
        }),
        Animated.spring(bubbleScale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, [activeIndex]);

  const barBgColor = isDark ? '#18181B' : '#FFFFFF';
  const activeColor = isDark ? '#3B82F6' : theme.colors.primary;
  const inactiveColor = isDark ? '#71717A' : '#94A3B8';
  const bottomOffset = Math.max(insets.bottom, 10);

  // Calculate animated horizontal position for the raised crest and floating bubble
  const crestLeft = animatedIndex.interpolate({
    inputRange: [0, 1, 2, 3],
    outputRange: [
      TAB_WIDTH * 0 + (TAB_WIDTH - CREST_SIZE) / 2,
      TAB_WIDTH * 1 + (TAB_WIDTH - CREST_SIZE) / 2,
      TAB_WIDTH * 2 + (TAB_WIDTH - CREST_SIZE) / 2,
      TAB_WIDTH * 3 + (TAB_WIDTH - CREST_SIZE) / 2,
    ],
  });

  const activeTabItem = TABS[activeIndex];

  return (
    <View
      pointerEvents="box-none"
      style={[
        tw`absolute left-0 right-0 items-center z-50`,
        { bottom: bottomOffset },
      ]}
    >
      <View
        style={{
          width: NAV_WIDTH,
          height: BAR_HEIGHT,
        }}
      >
        {/* Main Base Bar with Soft Rounded Shape and Elevation */}
        <View
          style={[
            tw`w-full h-full rounded-[28px]`,
            { backgroundColor: barBgColor },
            Platform.OS === 'android'
              ? { elevation: 12 }
              : {
                  shadowColor: isDark ? '#000000' : '#475569',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: isDark ? 0.45 : 0.14,
                  shadowRadius: 18,
                },
          ]}
        />

        {/* Animated Elevated Crest (Bulging organic curve above the active tab) */}
        <Animated.View
          pointerEvents="none"
          style={[
            tw`absolute rounded-full`,
            {
              width: CREST_SIZE,
              height: CREST_SIZE,
              top: -18,
              left: crestLeft,
              backgroundColor: barBgColor,
            },
            Platform.OS === 'android'
              ? { elevation: 12 }
              : {
                  shadowColor: isDark ? '#000000' : '#475569',
                  shadowOffset: { width: 0, height: -2 },
                  shadowOpacity: isDark ? 0.35 : 0.1,
                  shadowRadius: 8,
                },
          ]}
        />

        {/* Floating Active Circle Bubble */}
        <Animated.View
          pointerEvents="none"
          style={[
            tw`absolute rounded-full items-center justify-center z-40`,
            {
              width: BUBBLE_SIZE,
              height: BUBBLE_SIZE,
              top: -11,
              left: animatedIndex.interpolate({
                inputRange: [0, 1, 2, 3],
                outputRange: [
                  TAB_WIDTH * 0 + (TAB_WIDTH - BUBBLE_SIZE) / 2,
                  TAB_WIDTH * 1 + (TAB_WIDTH - BUBBLE_SIZE) / 2,
                  TAB_WIDTH * 2 + (TAB_WIDTH - BUBBLE_SIZE) / 2,
                  TAB_WIDTH * 3 + (TAB_WIDTH - BUBBLE_SIZE) / 2,
                ],
              }),
              transform: [{ scale: bubbleScale }],
              backgroundColor: isDark ? '#27272A' : '#ECFDF5',
            },
            Platform.OS === 'android'
              ? { elevation: 8 }
              : {
                  shadowColor: activeColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                },
          ]}
        >
          <Ionicons
            name={activeTabItem.activeIcon}
            size={22}
            color={activeColor}
          />
        </Animated.View>

        {/* Tabs Action Row */}
        <View
          style={[
            tw`absolute top-0 left-0 right-0 bottom-0 flex-row justify-between items-center z-30`,
          ]}
        >
          {TABS.map((tab, idx) => {
            const isActive = idx === activeIndex;
            const badgeCount = tab.key === 'cart' ? totalItems : 0;

            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.7}
                onPress={() => onTabPress(tab.key)}
                style={[
                  tw`flex-1 items-center justify-center pt-1`,
                  { height: BAR_HEIGHT },
                ]}
              >
                {/* Tab Icon */}
                <View style={tw`h-6 items-center justify-center relative`}>
                  {!isActive ? (
                    <Ionicons
                      name={tab.inactiveIcon}
                      size={22}
                      color={inactiveColor}
                    />
                  ) : (
                    // Invisible placeholder when active so label stays aligned
                    <View style={tw`h-6 w-6`} />
                  )}

                  {/* Badge Counter */}
                  {badgeCount > 0 && !isActive && (
                    <View
                      style={[
                        tw`absolute -top-1.5 -right-2.5 min-w-[15px] h-[15px] rounded-full justify-center items-center px-0.5`,
                        { backgroundColor: theme.colors.accent || '#F59E0B' },
                      ]}
                    >
                      <Text style={[tw`text-[8px] font-black text-white`]}>
                        {badgeCount}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Tab Label */}
                <Text
                  style={[
                    tw`text-[11px] mt-0.5 tracking-tight`,
                    isActive
                      ? [tw`font-extrabold`, { color: activeColor }]
                      : [tw`font-semibold`, { color: inactiveColor }],
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
