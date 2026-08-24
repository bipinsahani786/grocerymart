import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

interface NavigationMapViewProps {
  headingText: string;
  subText: string;
  distanceRemaining: string;
  etaMins: number;
  isStoreRoute?: boolean;
}

export const NavigationMapView: React.FC<NavigationMapViewProps> = ({
  headingText,
  subText,
  distanceRemaining,
  etaMins,
  isStoreRoute = false,
}) => {
  return (
    <View style={{ marginBottom: 16 }}>
      {/* Top Turn-by-Turn Instruction Banner */}
      <View
        style={{
          backgroundColor: Colors.surfaceLight,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: Colors.border,
          borderBottomWidth: 0,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isStoreRoute ? Colors.blueLight : Colors.primaryBg,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons
            name={isStoreRoute ? 'arrow-forward' : 'arrow-up'}
            size={22}
            color={isStoreRoute ? Colors.blue : Colors.primary}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '800', color: Colors.text }}>
            {headingText}
          </Text>
          <Text style={{ fontSize: 12, color: Colors.textSecondary, marginTop: 1 }}>
            {subText}
          </Text>
        </View>
      </View>

      {/* Simulated Live Route Canvas Card */}
      <View
        style={{
          height: 180,
          backgroundColor: Colors.surfaceLight,
          borderColor: Colors.border,
          borderWidth: 1,
          position: 'relative',
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Stylized Grid Lines */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.15,
            borderWidth: 1,
            borderColor: Colors.border,
          }}
        />

        {/* Route Line Simulation */}
        <View
          style={{
            width: '75%',
            height: 4,
            backgroundColor: isStoreRoute ? Colors.blue : Colors.primary,
            borderRadius: 2,
            position: 'relative',
            shadowColor: isStoreRoute ? Colors.blue : Colors.primary,
            shadowOpacity: 0.8,
            shadowRadius: 6,
          }}
        >
          {/* Start Point */}
          <View
            style={{
              position: 'absolute',
              left: 0,
              top: -6,
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: Colors.white,
              borderWidth: 3,
              borderColor: Colors.blueDark,
            }}
          />

          {/* Rider Marker (Moving) */}
          <View
            style={{
              position: 'absolute',
              left: '45%',
              top: -12,
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: Colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: Colors.white,
              shadowColor: Colors.primary,
              shadowOpacity: 0.9,
              shadowRadius: 6,
            }}
          >
            <Ionicons name="bicycle" size={16} color={Colors.white} />
          </View>

          {/* Destination Pin */}
          <View
            style={{
              position: 'absolute',
              right: 0,
              top: -14,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: Colors.danger,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name="location" size={14} color={Colors.white} />
          </View>
        </View>

        {/* Live GPS badge */}
        <View
          style={{
            position: 'absolute',
            top: 10,
            left: 10,
            backgroundColor: Colors.surface,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors.border,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: Colors.primary,
              marginRight: 6,
            }}
          />
          <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primaryLight }}>
            GPS ACTIVE • 32 km/h
          </Text>
        </View>

        {/* Open External Maps Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: Colors.surfaceLight,
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: Colors.border,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Ionicons name="navigate" size={12} color={Colors.blue} style={{ marginRight: 4 }} />
          <Text style={{ fontSize: 11, fontWeight: '700', color: Colors.text }}>
            Google Maps
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Route Summary Bar */}
      <View
        style={{
          backgroundColor: Colors.surfaceLight,
          borderBottomLeftRadius: 16,
          borderBottomRightRadius: 16,
          padding: 12,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: Colors.border,
          borderTopWidth: 0,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="time" size={16} color={Colors.amber} style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 14, fontWeight: '800', color: Colors.text }}>
            {etaMins} mins ({distanceRemaining})
          </Text>
        </View>
        <Text style={{ fontSize: 12, color: Colors.primaryLight, fontWeight: '600' }}>
          Fastest Route via 80 Feet Rd
        </Text>
      </View>
    </View>
  );
};
