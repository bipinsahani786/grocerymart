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

interface CityMapViewProps {
  isOnline: boolean;
  activeOrder: any;
  currentHub: string;
  onSimulateOrder: () => void;
  onSelectHub?: (hubName: string) => void;
}

export const CityMapView: React.FC<CityMapViewProps> = ({
  isOnline,
  activeOrder,
  currentHub,
  onSimulateOrder,
  onSelectHub,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const mapHeight = 230; // Compact, perfectly proportioned height

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
    outputRange: [0.9, 2.2],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.6, 0.25, 0],
  });

  // Dark stores in city coordinates
  const stores = [
    {
      id: '1',
      name: 'Koramangala Hub #04',
      shortName: 'Koramangala',
      x: screenWidth * 0.48,
      y: mapHeight * 0.48,
      surge: '+₹35',
    },
    {
      id: '2',
      name: 'HSR Layout Sector 2',
      shortName: 'HSR Sec 2',
      x: screenWidth * 0.22,
      y: mapHeight * 0.72,
      surge: '+₹25',
    },
    {
      id: '3',
      name: 'Indiranagar 100ft Hub',
      shortName: 'Indiranagar',
      x: screenWidth * 0.76,
      y: mapHeight * 0.28,
      surge: '+₹30',
    },
  ];

  return (
    <View
      style={[
        tw`relative w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200`,
        { height: mapHeight, backgroundColor: '#E2E8F0' },
      ]}
    >
      {/* ================= VECTOR CITY MAP BASE (GOOGLE MAPS LIGHT THEME) ================= */}
      <Svg width={screenWidth} height={mapHeight} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="parkGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#DCFCE7" stopOpacity="1" />
            <Stop offset="100%" stopColor="#BBF7D0" stopOpacity="1" />
          </LinearGradient>

          <LinearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor="#BAE6FD" stopOpacity="1" />
            <Stop offset="100%" stopColor="#93C5FD" stopOpacity="1" />
          </LinearGradient>

          <RadialGradient id="surgeRadial1" cx="48%" cy="48%" rx="35%" ry="35%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <Stop offset="70%" stopColor="#10B981" stopOpacity="0.05" />
            <Stop offset="100%" stopColor="#E2E8F0" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* 1. Base City Terrain */}
        <Rect width={screenWidth} height={mapHeight} fill="#F1F5F9" />

        {/* 2. City Parks & Lakes */}
        <Path
          d={`M 0 0 L ${screenWidth * 0.35} 0 Q ${screenWidth * 0.28} ${mapHeight * 0.35} ${screenWidth * 0.12} ${mapHeight * 0.38} L 0 ${mapHeight * 0.28} Z`}
          fill="url(#parkGrad)"
        />
        <Path
          d={`M ${screenWidth * 0.65} ${mapHeight} Q ${screenWidth * 0.78} ${mapHeight * 0.68} ${screenWidth} ${mapHeight * 0.75} L ${screenWidth} ${mapHeight} Z`}
          fill="url(#waterGrad)"
        />

        {/* 3. Surge Heatmap Layers */}
        {showSurgeHeatmap && isOnline && (
          <Circle cx={screenWidth * 0.48} cy={mapHeight * 0.48} r={90} fill="url(#surgeRadial1)" />
        )}

        {/* 4. City Street Road Outlines */}
        <G stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
          <Path d={`M 0 ${mapHeight * 0.48} Q ${screenWidth * 0.4} ${mapHeight * 0.32} ${screenWidth} ${mapHeight * 0.48}`} fill="none" />
          <Path d={`M ${screenWidth * 0.48} 0 Q ${screenWidth * 0.55} ${mapHeight * 0.5} ${screenWidth * 0.38} ${mapHeight}`} fill="none" />
          <Path d={`M 0 ${mapHeight * 0.78} L ${screenWidth} ${mapHeight * 0.65}`} fill="none" />
          <Path d={`M ${screenWidth * 0.22} 0 L ${screenWidth * 0.26} ${mapHeight}`} strokeWidth="4" fill="none" />
          <Path d={`M ${screenWidth * 0.76} 0 L ${screenWidth * 0.72} ${mapHeight}`} strokeWidth="4" fill="none" />
        </G>

        {/* 5. City Street Road Fill */}
        <G stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
          <Path d={`M 0 ${mapHeight * 0.48} Q ${screenWidth * 0.4} ${mapHeight * 0.32} ${screenWidth} ${mapHeight * 0.48}`} fill="none" />
          <Path d={`M ${screenWidth * 0.48} 0 Q ${screenWidth * 0.55} ${mapHeight * 0.5} ${screenWidth * 0.38} ${mapHeight}`} fill="none" />
          <Path d={`M 0 ${mapHeight * 0.78} L ${screenWidth} ${mapHeight * 0.65}`} fill="none" />
          <Path d={`M ${screenWidth * 0.22} 0 L ${screenWidth * 0.26} ${mapHeight}`} strokeWidth="2.5" fill="none" />
          <Path d={`M ${screenWidth * 0.76} 0 L ${screenWidth * 0.72} ${mapHeight}`} strokeWidth="2.5" fill="none" />
        </G>

        {/* 6. Active Delivery Route */}
        {activeOrder && (
          <G>
            <Path
              d={`M ${screenWidth * 0.48} ${mapHeight * 0.48} Q ${screenWidth * 0.6} ${mapHeight * 0.55} ${screenWidth * 0.74} ${mapHeight * 0.68}`}
              stroke="#047857"
              strokeWidth="4"
              fill="none"
              strokeDasharray="5, 3"
            />
            <Circle cx={screenWidth * 0.48} cy={mapHeight * 0.48} r="6" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
            <Circle cx={screenWidth * 0.74} cy={mapHeight * 0.68} r="7" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
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
            left: store.x - 35,
            top: store.y - 36,
            alignItems: 'center',
            width: 70,
          }}
        >
          {/* Surge Price Tag Bubble */}
          <View
            style={[
              tw`px-1.5 py-0.2 rounded-full flex-row items-center shadow-sm mb-0.5`,
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
              tw`w-5.5 h-5.5 rounded-full items-center justify-center shadow-sm border border-white`,
              {
                backgroundColor: store.id === selectedHubId ? '#10B981' : '#64748B',
              },
            ]}
          >
            <Ionicons name="storefront" size={10} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      ))}

      {/* ================= RIDER LIVE GPS BEACON (PULSING) ================= */}
      <View
        style={{
          position: 'absolute',
          left: screenWidth * 0.48 - 25,
          top: mapHeight * 0.48 - 25,
          width: 50,
          height: 50,
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {isOnline && (
          <Animated.View
            style={{
              position: 'absolute',
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: '#10B981',
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            }}
          />
        )}

        <View
          style={[
            tw`w-7 h-7 rounded-full items-center justify-center shadow-md border-2 border-white`,
            {
              backgroundColor: isOnline ? '#10B981' : '#64748B',
            },
          ]}
        >
          <Ionicons
            name={activeOrder ? 'bicycle' : 'navigate'}
            size={13}
            color="#FFFFFF"
          />
        </View>
      </View>

      {/* ================= FLOATING MAP OVERLAYS & CONTROLS ================= */}
      {/* Top Left GPS Accuracy Badge */}
      <View style={tw`absolute top-2.5 left-2.5 flex-row items-center px-2 py-0.8 rounded-full bg-white/95 border border-slate-200 shadow-sm`}>
        <View style={[tw`w-1.5 h-1.5 rounded-full mr-1`, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
        <Text style={[Typography.caption, { color: '#0F172A', fontSize: 10, fontWeight: '700' }]}>
          {isOnline ? 'GPS Active' : 'Standby'}
        </Text>
      </View>

      {/* Top Right Live Surge Badge */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowSurgeHeatmap(!showSurgeHeatmap)}
        style={tw`absolute top-2.5 right-2.5 flex-row items-center px-2 py-0.8 rounded-full bg-amber-50 border border-amber-200 shadow-sm`}
      >
        <Ionicons name="flame" size={11} color="#D97706" style={tw`mr-0.5`} />
        <Text style={[Typography.caption, { color: '#B45309', fontSize: 10, fontWeight: '800' }]}>
          Surge Active
        </Text>
      </TouchableOpacity>

      {/* Bottom Right Recenter Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        style={tw`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full bg-white border border-slate-200 items-center justify-center shadow-sm`}
      >
        <Ionicons name="locate" size={16} color="#047857" />
      </TouchableOpacity>

      {/* Bottom Left Quick Test Order Trigger */}
      {isOnline && !activeOrder && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onSimulateOrder}
          style={tw`absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-600 border border-emerald-500 shadow-sm flex-row items-center`}
        >
          <Ionicons name="flash" size={11} color="#FFFFFF" style={tw`mr-1`} />
          <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 10 }]}>
            + Test Order
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
