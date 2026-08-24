import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { MOCK_INCENTIVES } from '../../constants/mockData';

export const IncentiveProgress: React.FC = () => {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: '700',
          color: Colors.text,
          marginBottom: 12,
          letterSpacing: 0.3,
        }}
      >
        ACTIVE INCENTIVES & BONUSES
      </Text>

      <View style={{ gap: 10 }}>
        {MOCK_INCENTIVES.map((inc) => (
          <View
            key={inc.id}
            style={{
              backgroundColor: Colors.surfaceCard,
              borderRadius: 14,
              padding: 14,
              borderWidth: 1,
              borderColor: Colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="gift" size={16} color={Colors.amber} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                  {inc.title}
                </Text>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.primaryLight }}>
                +₹{inc.rewardAmount}
              </Text>
            </View>

            <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 4 }}>
              {inc.description}
            </Text>

            {/* Progress bar */}
            <View style={{ marginTop: 10 }}>
              <View
                style={{
                  height: 6,
                  backgroundColor: Colors.surfaceLight,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${Math.min(100, (inc.progress / inc.target) * 100)}%`,
                    backgroundColor: Colors.amber,
                    borderRadius: 3,
                  }}
                />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                <Text style={{ fontSize: 10, color: Colors.textMuted }}>
                  Progress: {inc.progress} / {inc.target}
                </Text>
                <Text style={{ fontSize: 10, color: Colors.amber }}>
                  Expires: {inc.expiresIn}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};
