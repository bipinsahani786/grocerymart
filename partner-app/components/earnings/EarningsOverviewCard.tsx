import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { MOCK_WEEKLY_EARNINGS } from '../../constants/mockData';

interface EarningsOverviewCardProps {
  onOpenWithdraw: () => void;
}

export const EarningsOverviewCard: React.FC<EarningsOverviewCardProps> = ({ onOpenWithdraw }) => {
  const { earningsSummary } = useDeliveryContext();
  const maxWeekly = Math.max(...MOCK_WEEKLY_EARNINGS.map((d) => d.amount));

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Wallet Balance Hero Card */}
      <View
        style={{
          backgroundColor: Colors.surfaceCard,
          borderRadius: 20,
          padding: 20,
          borderWidth: 1,
          borderColor: Colors.border,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.textSecondary }}>
              WALLET BALANCE (READY TO TRANSFER)
            </Text>
            <Text style={{ fontSize: 34, fontWeight: '900', color: Colors.text, marginTop: 4 }}>
              ₹{earningsSummary.walletBalance}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenWithdraw}
            style={{
              backgroundColor: Colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons name="card" size={16} color={Colors.textDark} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: '800', color: Colors.textDark }}>
              Cashout
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.surfaceLight,
            padding: 10,
            borderRadius: 10,
            marginTop: 14,
          }}
        >
          <Ionicons name="shield-checkmark" size={16} color={Colors.primary} style={{ marginRight: 8 }} />
          <Text style={{ fontSize: 11, color: Colors.textSecondary, flex: 1 }}>
            Auto-Settlement every Tuesday to HDFC Bank (****4921)
          </Text>
        </View>
      </View>

      {/* Weekly Trend Bar Chart Simulation */}
      <View
        style={{
          backgroundColor: Colors.surfaceCard,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          marginBottom: 16,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.text }}>
            Weekly Earnings Trend
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.primaryLight }}>
            Total: ₹11,880
          </Text>
        </View>

        {/* Bar container */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            height: 120,
            paddingTop: 10,
          }}
        >
          {MOCK_WEEKLY_EARNINGS.map((item, idx) => {
            const heightPercent = (item.amount / maxWeekly) * 100;
            const isToday = idx === MOCK_WEEKLY_EARNINGS.length - 1;

            return (
              <View key={item.day} style={{ alignItems: 'center', flex: 1 }}>
                <Text style={{ fontSize: 9, color: Colors.textMuted, marginBottom: 4 }}>
                  ₹{(item.amount / 1000).toFixed(1)}k
                </Text>
                <View
                  style={{
                    width: 20,
                    height: `${heightPercent}%`,
                    backgroundColor: isToday ? Colors.primary : Colors.blue,
                    borderRadius: 4,
                  }}
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: isToday ? '700' : '500',
                    color: isToday ? Colors.primary : Colors.textSecondary,
                    marginTop: 6,
                  }}
                >
                  {item.day.slice(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};
