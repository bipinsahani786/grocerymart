import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { MOCK_INCENTIVES } from '../../constants/mockData';

export const HighDemandBanner: React.FC = () => {
  const currentIncentive = MOCK_INCENTIVES[0];

  return (
    <View style={{ marginBottom: 16 }}>
      {/* High Demand Surge Alert */}
      <View
        style={{
          backgroundColor: Colors.amberLight,
          borderColor: Colors.amber,
          borderWidth: 1,
          borderRadius: 14,
          padding: 14,
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: Colors.surface,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10,
              }}
            >
              <Ionicons name="flame" size={18} color={Colors.amberDark} />
            </View>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                High Demand in Koramangala
              </Text>
              <Text style={{ fontSize: 11, color: Colors.amberDark, fontWeight: '600', marginTop: 1 }}>
                +₹25 Surge Pay per delivery order
              </Text>
            </View>
          </View>
          <View
            style={{
              backgroundColor: Colors.amber,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 6,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '800', color: Colors.white }}>
              HOT ZONE
            </Text>
          </View>
        </View>
      </View>

      {/* Target Milestone Progress */}
      {currentIncentive && (
        <View
          style={{
            backgroundColor: Colors.surfaceCard,
            borderColor: Colors.border,
            borderWidth: 1,
            borderRadius: 14,
            padding: 14,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="trophy-outline" size={16} color={Colors.primaryLight} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>
                {currentIncentive.title}
              </Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primaryLight }}>
              +₹{currentIncentive.rewardAmount}
            </Text>
          </View>

          <Text style={{ fontSize: 11, color: Colors.textSecondary, marginTop: 4 }}>
            {currentIncentive.description}
          </Text>

          {/* Progress Bar */}
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
                  width: `${(currentIncentive.progress / currentIncentive.target) * 100}%`,
                  backgroundColor: Colors.primary,
                  borderRadius: 3,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={{ fontSize: 10, color: Colors.textMuted }}>
                {currentIncentive.progress} / {currentIncentive.target} completed
              </Text>
              <Text style={{ fontSize: 10, color: Colors.amber }}>
                ⏳ Expires in {currentIncentive.expiresIn}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};
