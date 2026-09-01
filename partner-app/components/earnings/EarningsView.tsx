import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface EarningsViewProps {
  onDepositCash: () => void;
}

export const EarningsView: React.FC<EarningsViewProps> = ({ onDepositCash }) => {
  const { earningsSummary, walletBalance } = useDeliveryContext();
  const { t } = useLanguageContext();

  const [activeRange, setActiveRange] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');

  const windowHeight = Dimensions.get('window').height;

  const weeklyTrendData = [
    { day: 'Mon', amount: 980 },
    { day: 'Tue', amount: 1140 },
    { day: 'Wed', amount: 890 },
    { day: 'Thu', amount: 1250 },
    { day: 'Fri', amount: 1420 },
    { day: 'Sat', amount: 1680 },
    { day: 'Sun', amount: 1350 },
  ];

  const maxAmount = Math.max(...weeklyTrendData.map((d) => d.amount));

  return (
    <View style={[tw`px-5 pt-3 pb-36 bg-white flex-1`, { minHeight: windowHeight }]}>
      {/* ================= 1. CARDLESS HERO WALLET BALANCE ================= */}
      <View style={tw`pb-5 border-b border-slate-100 items-center`}>
        <Text style={[Typography.caption, { color: '#047857', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }]}>
          {t.availableBalance}
        </Text>
        <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 32, fontWeight: '900', marginVertical: 3 }]}>
          ₹{(walletBalance ?? 480).toFixed(2)}
        </Text>
        <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
          {t.instantImps} • Auto-Settled Daily
        </Text>

        {/* Dual Floating Action Buttons */}
        <View style={tw`flex-row gap-3 mt-4 w-full px-2`}>
          <TouchableOpacity
            activeOpacity={0.88}
            style={tw`flex-1 py-3 rounded-2xl bg-emerald-600 border border-emerald-500 items-center justify-center flex-row shadow-sm`}
          >
            <Ionicons name="flash-outline" size={15} color="#FFFFFF" style={tw`mr-1.5`} />
            <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }]}>
              {t.instantCashout}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onDepositCash}
            style={tw`flex-1 py-3 rounded-2xl bg-slate-900 border border-slate-800 items-center justify-center flex-row shadow-sm`}
          >
            <Ionicons name="cash-outline" size={15} color="#FFFFFF" style={tw`mr-1.5`} />
            <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 11.5, fontWeight: '800' }]}>
              {t.depositCashBtn}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 2. TIME-RANGE FILTER & 3 TELEMETRY COLUMNS ================= */}
      <View style={tw`py-4 border-b border-slate-100`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 14, fontWeight: '900' }]}>
            Payout Summary
          </Text>

          {/* Time Selector Pills */}
          <View style={tw`flex-row items-center gap-1 bg-slate-100 p-1 rounded-xl`}>
            {(['TODAY', 'WEEK', 'MONTH'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => setActiveRange(range)}
                style={[
                  tw`px-2.5 py-1 rounded-lg`,
                  {
                    backgroundColor: activeRange === range ? '#047857' : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.buttonText,
                    {
                      color: activeRange === range ? '#FFFFFF' : '#64748B',
                      fontSize: 9.5,
                    },
                  ]}
                >
                  {range === 'TODAY' ? t.today : range === 'WEEK' ? t.thisWeek : t.thisMonth}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 3 Flat Columns */}
        <View style={tw`flex-row justify-between items-center pt-2`}>
          <View style={tw`items-center flex-1`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              {t.totalEarned}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 15, marginTop: 1 }]}>
              ₹{earningsSummary.todayTotal || 1640}
            </Text>
          </View>

          <View style={tw`w-px h-6 bg-slate-200`} />

          <View style={tw`items-center flex-1`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              {t.tripsDelivered}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 15, marginTop: 1 }]}>
              {earningsSummary.tripsCount || 14}
            </Text>
          </View>

          <View style={tw`w-px h-6 bg-slate-200`} />

          <View style={tw`items-center flex-1`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              {t.tipsEarned}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#D97706', fontSize: 15, marginTop: 1 }]}>
              ₹{earningsSummary.tipsTotal || 140}
            </Text>
          </View>
        </View>
      </View>

      {/* ================= 3. WEEKLY INCOME TREND GRAPH (CARDLESS) ================= */}
      <View style={tw`py-4 border-b border-slate-100`}>
        <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5, marginBottom: 10 }]}>
          {t.weeklyIncomeTrend}
        </Text>

        <View style={tw`flex-row justify-between items-end h-28 pt-2 px-2`}>
          {weeklyTrendData.map((item, idx) => {
            const heightPercent = Math.round((item.amount / maxAmount) * 100);
            return (
              <View key={idx} style={tw`items-center flex-1`}>
                <Text style={[Typography.caption, { color: '#64748B', fontSize: 8, marginBottom: 3 }]}>
                  ₹{item.amount}
                </Text>
                <View style={tw`w-5 bg-slate-100 rounded-full h-20 justify-end overflow-hidden mb-1.5`}>
                  <View
                    style={[
                      tw`w-full bg-emerald-600 rounded-full`,
                      { height: `${heightPercent}%` },
                    ]}
                  />
                </View>
                <Text style={[Typography.caption, { color: '#334155', fontSize: 9, fontWeight: '700' }]}>
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ================= 4. CARDLESS INCOME LEDGER ================= */}
      <View style={tw`py-4`}>
        <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5, marginBottom: 3 }]}>
          {t.incomeLedger}
        </Text>

        <View style={tw`py-1`}>
          {[
            { title: 'Trip Earnings (14 Orders)', amount: '+₹1,320.00', time: 'Today • 08:30 PM', type: 'EARNING' },
            { title: 'Peak Demand Surge Bonus', amount: '+₹180.00', time: 'Today • Lunch & Dinner', type: 'BONUS' },
            { title: 'Customer Tips (100% Direct)', amount: '+₹140.00', time: 'Today • 6 Orders', type: 'TIP' },
            { title: 'Daily Quest Bonus (15 Orders)', amount: '+₹250.00', time: 'Yesterday • Completed', type: 'BONUS' },
          ].map((item, idx) => (
            <View
              key={idx}
              style={[
                tw`py-3 flex-row justify-between items-center`,
                idx !== 3 && tw`border-b border-slate-100`,
              ]}
            >
              <View style={tw`flex-row items-center flex-1 mr-2`}>
                <View style={tw`w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 items-center justify-center mr-3`}>
                  <Ionicons name="arrow-down" size={14} color="#047857" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11.5 }]}>
                    {item.title}
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5, marginTop: 1 }]}>
                    {item.time}
                  </Text>
                </View>
              </View>

              <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 12.5 }]}>
                {item.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};
