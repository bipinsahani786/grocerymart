import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

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
    subtitle: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
    onPress?: () => void;
  }[] = [
    {
      id: 'hotspots',
      title: 'Store Hotspots',
      subtitle: '3 high surge hubs',
      icon: 'map',
      color: Colors.amber,
      onPress: onOpenHotspots,
    },
    {
      id: 'cash_deposit',
      title: 'Deposit Cash',
      subtitle: 'Nearby CDM / Hub',
      icon: 'cash',
      color: Colors.primary,
      onPress: onDepositCash,
    },
    {
      id: 'ev_stations',
      title: 'EV Swap Stations',
      subtitle: '2 stations (0.5 km)',
      icon: 'battery-charging',
      color: Colors.blue,
      onPress: onOpenHotspots,
    },
    {
      id: 'support',
      title: 'Partner Support',
      subtitle: 'Instant call / chat',
      icon: 'headset',
      color: Colors.purple,
      onPress: onOpenSupport,
    },
  ];

  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: Colors.text,
          marginBottom: 12,
          letterSpacing: 0.3,
        }}
      >
        QUICK TOOLS & SERVICES
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {actions.map((act) => (
          <TouchableOpacity
            key={act.id}
            activeOpacity={0.8}
            onPress={act.onPress}
            style={{
              width: '48.3%',
              backgroundColor: Colors.surfaceCard,
              borderColor: Colors.border,
              borderWidth: 1,
              borderRadius: 14,
              padding: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: `${act.color}20`,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Ionicons name={act.icon} size={20} color={act.color} />
            </View>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
              {act.title}
            </Text>
            <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 2 }}>
              {act.subtitle}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
