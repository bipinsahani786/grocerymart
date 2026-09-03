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
  Line,
  G,
  Defs,
  RadialGradient,
  Stop,
} from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { getApiBaseUrl } from '../../constants/config';
import tw from 'twrnc';


interface LiveDriverRadarMapProps {
  isOnline: boolean;
  activeOrder: any;
  currentHub: string;
  onSimulateOrder: () => void;
  onRecenter?: () => void;
}

export const LiveDriverRadarMap: React.FC<LiveDriverRadarMapProps> = ({
  isOnline,
  activeOrder,
  currentHub,
  onSimulateOrder,
  onRecenter,
}) => {
  const screenWidth = Dimensions.get('window').width;
  const mapHeight = Dimensions.get('window').height - 240;

  // Pulse animation for radar
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const waveAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOnline) {
      Animated.loop(
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2400,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(600),
            Animated.timing(waveAnim2, {
              toValue: 1,
              duration: 2400,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      pulseAnim.setValue(0);
      waveAnim2.setValue(0);
    }
  }, [isOnline]);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 2.6],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.7, 0.4, 0],
  });

  const wave2Scale = waveAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 2.6],
  });

  const wave2Opacity = waveAnim2.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.7, 0.4, 0],
  });

  // Dark store pin locations on map canvas
  const [darkStores, setDarkStores] = useState<any[]>([
    { id: '1', name: 'Koramangala Hub #04', x: screenWidth * 0.5, y: mapHeight * 0.45, isCurrent: true, surge: '+₹35' },
    { id: '2', name: 'HSR Layout Hub', x: screenWidth * 0.22, y: mapHeight * 0.65, isCurrent: false, surge: '+₹25' },
    { id: '3', name: 'Indiranagar Express', x: screenWidth * 0.78, y: mapHeight * 0.28, isCurrent: false, surge: '+₹30' },
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchBackendStores = async () => {
      try {
        const baseUrl = getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/customer/stores`);
        const data = await res.json();
        if (data && data.success && Array.isArray(data.data) && data.data.length > 0) {
          const positions = [
            { x: screenWidth * 0.5, y: mapHeight * 0.45 },
            { x: screenWidth * 0.22, y: mapHeight * 0.65 },
            { x: screenWidth * 0.78, y: mapHeight * 0.28 },
          ];
          const mapped = data.data.map((s: any, idx: number) => ({
            id: s.id || String(idx + 1),
            name: s.name,
            x: positions[idx % positions.length].x,
            y: positions[idx % positions.length].y,
            isCurrent: idx === 0,
            surge: idx === 0 ? '+₹35' : idx === 1 ? '+₹25' : '+₹30',
          }));
          if (isMounted) {
            setDarkStores(mapped);
          }
        }
      } catch (err) {
        console.log('Failed to fetch stores for LiveDriverRadarMap:', err);
      }
    };
    fetchBackendStores();
    return () => {
      isMounted = false;
    };
  }, [screenWidth, mapHeight]);


  return (
    <View style={[tw`relative w-full overflow-hidden`, { height: mapHeight, backgroundColor: '#0B1320' }]}>
      {/* ================= VECTOR TACTICAL MAP BACKDROP ================= */}
      <Svg width={screenWidth} height={mapHeight} style={StyleSheet.absoluteFill}>
        <Defs>
          <RadialGradient id="radarHeatmap" cx="50%" cy="45%" rx="40%" ry="40%">
            <Stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
            <Stop offset="60%" stopColor="#047857" stopOpacity="0.10" />
            <Stop offset="100%" stopColor="#0B1320" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="surgeZone1" cx="22%" cy="65%" rx="25%" ry="25%">
            <Stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
            <Stop offset="100%" stopColor="#0B1320" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Heatmap ambient glow */}
        {isOnline && (
          <>
            <Circle cx={screenWidth * 0.5} cy={mapHeight * 0.45} r={180} fill="url(#radarHeatmap)" />
            <Circle cx={screenWidth * 0.22} cy={mapHeight * 0.65} r={120} fill="url(#surgeZone1)" />
          </>
        )}

        {/* Grid & Street Network */}
        <G stroke="#1E293B" strokeWidth="2" opacity="0.6">
          {/* Arterial Highways */}
          <Path d={`M 0 ${mapHeight * 0.45} Q ${screenWidth * 0.4} ${mapHeight * 0.3} ${screenWidth} ${mapHeight * 0.45}`} stroke="#334155" strokeWidth="6" />
          <Path d={`M ${screenWidth * 0.5} 0 Q ${screenWidth * 0.6} ${mapHeight * 0.5} ${screenWidth * 0.4} ${mapHeight}`} stroke="#334155" strokeWidth="5" />
          <Path d={`M 0 ${mapHeight * 0.75} L ${screenWidth} ${mapHeight * 0.6}`} stroke="#1E293B" strokeWidth="4" />
          <Path d={`M ${screenWidth * 0.2} 0 L ${screenWidth * 0.25} ${mapHeight}`} stroke="#1E293B" strokeWidth="3" />
          <Path d={`M ${screenWidth * 0.8} 0 L ${screenWidth * 0.75} ${mapHeight}`} stroke="#1E293B" strokeWidth="3" />
          <Path d={`M 0 ${mapHeight * 0.2} L ${screenWidth} ${mapHeight * 0.15}`} stroke="#1E293B" strokeWidth="3" />
        </G>

        {/* Active Route Line Simulation if Order Active */}
        {activeOrder && (
          <G>
            <Path
              d={`M ${screenWidth * 0.5} ${mapHeight * 0.45} Q ${screenWidth * 0.65} ${mapHeight * 0.52} ${screenWidth * 0.75} ${mapHeight * 0.68}`}
              stroke="#10B981"
              strokeWidth="5"
              strokeDasharray="6, 4"
            />
            {/* Store Dot */}
            <Circle cx={screenWidth * 0.5} cy={mapHeight * 0.45} r="8" fill="#10B981" />
            {/* Customer Drop Dot */}
            <Circle cx={screenWidth * 0.75} cy={mapHeight * 0.68} r="10" fill="#EF4444" />
          </G>
        )}
      </Svg>

      {/* ================= DARK STORE PINS ================= */}
      {darkStores.map((store) => (
        <View
          key={store.id}
          style={{
            position: 'absolute',
            left: store.x - 45,
            top: store.y - 45,
            alignItems: 'center',
            width: 90,
          }}
        >
          <View
            style={[
              tw`px-2 py-1 rounded-full flex-row items-center shadow-lg mb-1`,
              {
                backgroundColor: store.isCurrent ? '#047857' : '#1E293B',
                borderWidth: 1,
                borderColor: store.isCurrent ? '#34D399' : '#334155',
              },
            ]}
          >
            <Text style={tw`text-[11px] font-black text-white`}>
              ⚡ {store.surge}
            </Text>
          </View>
          <View
            style={[
              tw`w-7 h-7 rounded-full items-center justify-center border-2`,
              {
                backgroundColor: store.isCurrent ? '#10B981' : '#334155',
                borderColor: '#FFFFFF',
              },
            ]}
          >
            <Ionicons name="storefront" size={13} color="#FFFFFF" />
          </View>
        </View>
      ))}

      {/* ================= RIDER LIVE GPS RADAR PULSE (CENTER) ================= */}
      <View
        style={{
          position: 'absolute',
          left: screenWidth * 0.5 - 40,
          top: mapHeight * 0.45 - 40,
          width: 80,
          height: 80,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isOnline && (
          <>
            <Animated.View
              style={{
                position: 'absolute',
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: '#10B981',
                transform: [{ scale: pulseScale }],
                opacity: pulseOpacity,
              }}
            />
            <Animated.View
              style={{
                position: 'absolute',
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: '#059669',
                transform: [{ scale: wave2Scale }],
                opacity: wave2Opacity,
              }}
            />
          </>
        )}

        {/* Center Rider Marker Icon */}
        <View
          style={[
            tw`w-12 h-12 rounded-full items-center justify-center shadow-2xl`,
            {
              backgroundColor: isOnline ? '#10B981' : '#475569',
              borderWidth: 3,
              borderColor: '#FFFFFF',
            },
          ]}
        >
          <Ionicons
            name={activeOrder ? 'bicycle' : 'navigate'}
            size={22}
            color="#FFFFFF"
          />
        </View>
      </View>

      {/* ================= FLOATING MAP UTILITY OVERLAYS ================= */}
      {/* Top Left GPS Status */}
      <View style={tw`absolute top-4 left-4 flex-row items-center px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/60`}>
        <View style={[tw`w-2 h-2 rounded-full mr-2`, { backgroundColor: isOnline ? '#10B981' : '#94A3B8' }]} />
        <Text style={tw`text-xs font-bold text-white`}>
          {isOnline ? 'GPS Active • 100%' : 'GPS Standby'}
        </Text>
      </View>

      {/* Top Right Surge Badge */}
      <View style={tw`absolute top-4 right-4 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 flex-row items-center`}>
        <Ionicons name="flame" size={14} color="#F59E0B" style={tw`mr-1`} />
        <Text style={tw`text-xs font-black text-amber-300`}>
          High Surge Active
        </Text>
      </View>

      {/* Recenter / Target Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onRecenter}
        style={tw`absolute bottom-20 right-4 w-11 h-11 rounded-full bg-slate-900/90 border border-slate-700 items-center justify-center shadow-lg`}
      >
        <Ionicons name="locate" size={20} color="#10B981" />
      </TouchableOpacity>

      {/* Quick Simulate Order Button (When online) */}
      {isOnline && !activeOrder && (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onSimulateOrder}
          style={tw`absolute bottom-20 left-4 px-4 py-2 rounded-full bg-emerald-600 border border-emerald-400/50 flex-row items-center shadow-lg`}
        >
          <Ionicons name="flash" size={14} color="#FFFFFF" style={tw`mr-1.5`} />
          <Text style={tw`text-xs font-black text-white`}>
            + Test Delivery
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
