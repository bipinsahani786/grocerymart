import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  StyleSheet,
} from 'react-native';
import Svg, {
  Path,
  Circle,
  Rect,
  G,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface FullScreenCityMapProps {
  isOnline: boolean;
  activeOrder: any;
  currentHub: string;
  onSimulateOrder: () => void;
  onSelectHub?: (hubName: string) => void;
}

export const FullScreenCityMap: React.FC<FullScreenCityMapProps> = ({
  isOnline,
  activeOrder,
  currentHub,
  onSimulateOrder,
  onSelectHub,
}) => {
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const [selectedHubId, setSelectedHubId] = useState<string>('1');
  const [showSurgeHeatmap, setShowSurgeHeatmap] = useState(true);

  // Radar Pulse Animation for Rider Location
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(0);
    }
  }, [isOnline]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 2.4],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.6, 0.25, 0],
  });

  // Dark stores in full screen coordinates
  const stores = [
    {
      id: '1',
      name: 'Koramangala Hub #04',
      shortName: 'Koramangala',
      x: screenWidth * 0.5,
      y: screenHeight * 0.42,
      surge: '+₹35',
    },
    {
      id: '2',
      name: 'HSR Layout Sector 2',
      shortName: 'HSR Sec 2',
      x: screenWidth * 0.22,
      y: screenHeight * 0.56,
      surge: '+₹25',
    },
    {
      id: '3',
      name: 'Indiranagar 100ft Hub',
      shortName: 'Indiranagar',
      x: screenWidth * 0.78,
      y: screenHeight * 0.28,
      surge: '+₹30',
    },
  ];

  return (
    <View style={StyleSheet.absoluteFillObject}>
      {/* ================= VECTOR CITY MAP BASE (FULL-SCREEN LIGHT THEME) ================= */}
      <Svg width={screenWidth} height={screenHeight} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="parkGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#DCFCE7" stopOpacity="1" />
            <Stop offset="100%" stopColor="#BBF7D0" stopOpacity="1" />
          </LinearGradient>

          <LinearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#BAE6FD" stopOpacity="1" />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity="1" />
          </LinearGradient>

          <RadialGradient id="surgeRadial1" cx="50%" cy="42%" rx="40%" ry="40%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <Stop offset="70%" stopColor="#10B981" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#E2E8F0" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* 1. Base City Terrain */}
        <Rect width={screenWidth} height={screenHeight} fill="#F1F5F9" />

        {/* 2. City Parks & Lakes */}
        <Path
          d={`M 0 0 L ${screenWidth * 0.4} 0 Q ${screenWidth * 0.3} ${screenHeight * 0.25} ${screenWidth * 0.12} ${screenHeight * 0.3} L 0 ${screenHeight * 0.22} Z`}
          fill="url(#parkGrad)"
        />
        <Path
          d={`M ${screenWidth * 0.6} ${screenHeight} Q ${screenWidth * 0.75} ${screenHeight * 0.7} ${screenWidth} ${screenHeight * 0.75} L ${screenWidth} ${screenHeight} Z`}
          fill="url(#waterGrad)"
        />

        {/* 3. Surge Heatmap Layers */}
        {showSurgeHeatmap && isOnline && (
          <Circle cx={screenWidth * 0.5} cy={screenHeight * 0.42} r={130} fill="url(#surgeRadial1)" />
        )}

        {/* 4. City Street Road Outlines */}
        <G stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          {/* Ring Road */}
          <Path d={`M 0 ${screenHeight * 0.42} Q ${screenWidth * 0.45} ${screenHeight * 0.32} ${screenWidth} ${screenHeight * 0.42}`} fill="none" />
          {/* North-South Expressway */}
          <Path d={`M ${screenWidth * 0.5} 0 Q ${screenWidth * 0.58} ${screenHeight * 0.45} ${screenWidth * 0.38} ${screenHeight}`} fill="none" />
          {/* South Outer Arterial */}
          <Path d={`M 0 ${screenHeight * 0.68} L ${screenWidth} ${screenHeight * 0.58}`} fill="none" />
          {/* Intermediate Streets */}
          <Path d={`M ${screenWidth * 0.22} 0 L ${screenWidth * 0.26} ${screenHeight}`} strokeWidth="5" fill="none" />
          <Path d={`M ${screenWidth * 0.78} 0 L ${screenWidth * 0.72} ${screenHeight}`} strokeWidth="5" fill="none" />
          <Path d={`M 0 ${screenHeight * 0.2} L ${screenWidth} ${screenHeight * 0.14}`} strokeWidth="5" fill="none" />
        </G>

        {/* 5. City Street Road Fill */}
        <G stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <Path d={`M 0 ${screenHeight * 0.42} Q ${screenWidth * 0.45} ${screenHeight * 0.32} ${screenWidth} ${screenHeight * 0.42}`} fill="none" />
          <Path d={`M ${screenWidth * 0.5} 0 Q ${screenWidth * 0.58} ${screenHeight * 0.45} ${screenWidth * 0.38} ${screenHeight}`} fill="none" />
          <Path d={`M 0 ${screenHeight * 0.68} L ${screenWidth} ${screenHeight * 0.58}`} fill="none" />
          <Path d={`M ${screenWidth * 0.22} 0 L ${screenWidth * 0.26} ${screenHeight}`} strokeWidth="3.5" fill="none" />
          <Path d={`M ${screenWidth * 0.78} 0 L ${screenWidth * 0.72} ${screenHeight}`} strokeWidth="3.5" fill="none" />
          <Path d={`M 0 ${screenHeight * 0.2} L ${screenWidth} ${screenHeight * 0.14}`} strokeWidth="3.5" fill="none" />
        </G>

        {/* 6. Active Delivery Route Line (If Order is Active) */}
        {activeOrder && (
          <G>
            <Path
              d={`M ${screenWidth * 0.5} ${screenHeight * 0.42} Q ${screenWidth * 0.65} ${screenHeight * 0.48} ${screenWidth * 0.78} ${screenHeight * 0.58}`}
              stroke="#047857"
              strokeWidth="5"
              fill="none"
              strokeDasharray="6, 4"
            />
            <Circle cx={screenWidth * 0.5} cy={screenHeight * 0.42} r="8" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
            <Circle cx={screenWidth * 0.78} cy={screenHeight * 0.58} r="9" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
          </G>
        )}
      </Svg>

      {/* ================= DARK STORE PINS WITH SURGE BADGES ================= */}
      {stores.map((store) => (
        <TouchableOpacity
          key={store.id}
          activeOpacity={0.85}
          onPress={() => {
            setSelectedHubId(store.id);
            onSelectHub?.(store.name);
          }}
          style={{
            position: 'absolute',
            left: store.x - 38,
            top: store.y - 40,
            alignItems: 'center',
            width: 76,
          }}
        >
          {/* Surge Price Tag Bubble */}
          <View
            style={[
              tw`px-2 py-0.5 rounded-full flex-row items-center shadow-sm mb-0.5`,
              {
                backgroundColor: store.id === selectedHubId ? '#047857' : '#FFFFFF',
                borderWidth: 1,
                borderColor: store.id === selectedHubId ? '#047857' : '#CBD5E1',
              },
            ]}
          >
            <Text
              style={[
                Typography.badge,
                { color: store.id === selectedHubId ? '#FFFFFF' : '#047857' },
              ]}
            >
              ⚡ {store.surge}
            </Text>
          </View>

          {/* Store Pin Icon */}
          <View
            style={[
              tw`w-6.5 h-6.5 rounded-full items-center justify-center shadow-sm border border-white`,
              {
                backgroundColor: store.id === selectedHubId ? '#10B981' : '#64748B',
              },
            ]}
          >
            <Ionicons name="storefront" size={11} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      ))}

      {/* ================= RIDER LIVE GPS BEACON (PULSING) ================= */}
      <View
        style={{
          position: 'absolute',
          left: screenWidth * 0.5 - 28,
          top: screenHeight * 0.42 - 28,
          width: 56,
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {isOnline && (
          <Animated.View
            style={{
              position: 'absolute',
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#10B981',
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            }}
          />
        )}

        <View
          style={[
            tw`w-8 h-8 rounded-full items-center justify-center shadow-md border-2 border-white`,
            {
              backgroundColor: isOnline ? '#10B981' : '#64748B',
            },
          ]}
        >
          <Ionicons
            name={activeOrder ? 'bicycle' : 'navigate'}
            size={15}
            color="#FFFFFF"
          />
        </View>
      </View>
    </View>
  );
};
