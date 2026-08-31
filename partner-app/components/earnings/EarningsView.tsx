import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { WalletPayoutModal } from './WalletPayoutModal';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface EarningsViewProps {
  onDepositCash: () => void;
}

type PeriodType = 'TODAY' | 'WEEK' | 'MONTH';

export const EarningsView: React.FC<EarningsViewProps> = ({ onDepositCash }) => {
  const { earningsSummary } = useDeliveryContext();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('TODAY');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const windowHeight = Dimensions.get('window').height;

  // Period Data Engine
  const periodData = {
    TODAY: {
      total: earningsSummary.todayTotal || 1600,
      trips: earningsSummary.tripsCount || 14,
      hours: earningsSummary.onlineHours || 5.5,
      avgPerOrder: Math.round((earningsSummary.todayTotal || 1600) / Math.max(earningsSummary.tripsCount || 14, 1)),
      basePay: earningsSummary.basePay || 820,
      surge: earningsSummary.surgeBonus || 350,
      tips: earningsSummary.tips || 180,
      incentives: earningsSummary.incentives || 250,
    },
    WEEK: {
      total: 11880,
      trips: 128,
      hours: 42.5,
      avgPerOrder: 93,
      basePay: 8200,
      surge: 1850,
      tips: 780,
      incentives: 1050,
    },
    MONTH: {
      total: 48650,
      trips: 520,
      hours: 174,
      avgPerOrder: 94,
      basePay: 34200,
      surge: 6900,
      tips: 2950,
      incentives: 4600,
    },
  }[selectedPeriod];

  // Weekly Performance Bar Chart Data
  const weeklyData = [
    { day: 'Mon', amount: 1450, isToday: false },
    { day: 'Tue', amount: 1680, isToday: false },
    { day: 'Wed', amount: 1200, isToday: false },
    { day: 'Thu', amount: 1950, isToday: false },
    { day: 'Fri', amount: 2200, isToday: false },
    { day: 'Sat', amount: 2450, isToday: false },
    { day: 'Sun', amount: 1600, isToday: true },
  ];
  const maxWeeklyAmount = Math.max(...weeklyData.map((d) => d.amount));

  // Recent Transactions Ledger
  const recentPayouts = [
    { id: 'tx-101', title: 'Instant Bank Transfer', bank: 'HDFC Bank ****4921', time: 'Today, 11:30 AM', amount: 1200, status: 'COMPLETED' },
    { id: 'tx-102', title: 'Daily Shift Closing Payout', bank: 'HDFC Bank ****4921', time: 'Yesterday, 11:45 PM', amount: 1850, status: 'COMPLETED' },
    { id: 'tx-103', title: 'Weekly Milestone Reward', bank: 'Wallet Credit', time: '28 Aug, 06:00 PM', amount: 500, status: 'COMPLETED' },
  ];

  return (
    <View style={[tw`p-3.5 gap-3 bg-white flex-1`, { minHeight: windowHeight, paddingBottom: 140 }]}>
      {/* ================= 1. CLEAN HERO WALLET CARD ================= */}
      <View style={tw`p-4 rounded-3xl bg-emerald-700 shadow-md`}>
        <View style={tw`flex-row justify-between items-start mb-1`}>
          <View>
            <Text style={[Typography.caption, { color: '#A7F3D0', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }]}>
              TOTAL AVAILABLE BALANCE
            </Text>
            <View style={tw`flex-row items-baseline mt-1`}>
              <Text style={[Typography.amountLarge, { color: '#FFFFFF', fontSize: 28, fontWeight: '900' }]}>
                ₹{earningsSummary.walletBalance.toLocaleString('en-IN')}
              </Text>
              <Text style={[Typography.caption, { color: '#6EE7B7', fontSize: 14, fontWeight: '800', marginLeft: 2 }]}>
                .00
              </Text>
            </View>
          </View>

          {/* Instant IMPS Tag */}
          <View style={tw`px-2.5 py-1 rounded-xl bg-emerald-800 border border-emerald-600`}>
            <Text style={[Typography.badge, { color: '#A7F3D0', fontSize: 9 }]}>
              ⚡ Instant IMPS
            </Text>
          </View>
        </View>

        {/* Bank & COD Status Sub-Row */}
        <View style={tw`flex-row justify-between items-center pt-2.5 mt-1 border-t border-emerald-600`}>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-2 h-2 rounded-full bg-emerald-300 mr-1.5`} />
            <Text style={[Typography.caption, { color: '#D1FAE5', fontSize: 10.5 }]}>
              HDFC Bank • ****4921
            </Text>
          </View>

          <Text style={[Typography.caption, { color: '#FDE68A', fontSize: 10.5, fontWeight: '800' }]}>
            Floating COD: ₹{earningsSummary.cashCollected}
          </Text>
        </View>

        {/* Dual Actions: Cashout & Deposit */}
        <View style={tw`flex-row gap-2 mt-3.5`}>
          {/* Instant Cashout */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => setShowPayoutModal(true)}
            style={tw`flex-1 py-2.5 rounded-xl bg-white items-center justify-center flex-row shadow-sm`}
          >
            <Ionicons name="flash" size={13} color="#047857" style={tw`mr-1.5`} />
            <Text style={[Typography.buttonText, { color: '#047857', fontSize: 11, fontWeight: '800' }]}>
              Instant Cashout
            </Text>
          </TouchableOpacity>

          {/* Deposit COD */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onDepositCash}
            style={tw`flex-1 py-2.5 rounded-xl bg-emerald-800 border border-emerald-600 items-center justify-center flex-row`}
          >
            <Ionicons name="arrow-up-circle-outline" size={14} color="#D1FAE5" style={tw`mr-1.5`} />
            <Text style={[Typography.buttonText, { color: '#D1FAE5', fontSize: 11, fontWeight: '700' }]}>
              Deposit COD Cash
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ================= 2. PERIOD TIMEFRAME SELECTOR ================= */}
      <View style={tw`flex-row justify-between items-center px-0.5`}>
        <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 13 }]}>
          Earnings Performance
        </Text>

        {/* Timeframe Tabs */}
        <View style={tw`flex-row items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200`}>
          {(['TODAY', 'WEEK', 'MONTH'] as const).map((period) => (
            <TouchableOpacity
              key={period}
              onPress={() => setSelectedPeriod(period)}
              style={[
                tw`px-2.5 py-1 rounded-lg`,
                {
                  backgroundColor: selectedPeriod === period ? '#047857' : 'transparent',
                },
              ]}
            >
              <Text
                style={[
                  Typography.buttonText,
                  {
                    color: selectedPeriod === period ? '#FFFFFF' : '#64748B',
                    fontSize: 9.5,
                  },
                ]}
              >
                {period === 'TODAY' ? 'Today' : period === 'WEEK' ? 'This Week' : 'This Month'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ================= 3. 4-PILLAR METRICS GRID ================= */}
      <View style={tw`flex-row gap-2`}>
        {/* Total Earned */}
        <View style={tw`flex-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-200`}>
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9, fontWeight: '700' }]}>
            TOTAL EARNED
          </Text>
          <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 15, marginTop: 2 }]}>
            ₹{periodData.total.toLocaleString('en-IN')}
          </Text>
        </View>

        {/* Trips Done */}
        <View style={tw`flex-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-200`}>
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9, fontWeight: '700' }]}>
            TRIPS DONE
          </Text>
          <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 15, marginTop: 2 }]}>
            {periodData.trips} Trips
          </Text>
        </View>

        {/* Shift Hours */}
        <View style={tw`flex-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-200`}>
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9, fontWeight: '700' }]}>
            HOURS ONLINE
          </Text>
          <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 15, marginTop: 2 }]}>
            {periodData.hours}h
          </Text>
        </View>

        {/* Avg / Trip */}
        <View style={tw`flex-1 p-2.5 rounded-2xl bg-slate-50 border border-slate-200`}>
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9, fontWeight: '700' }]}>
            AVG / TRIP
          </Text>
          <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 15, marginTop: 2 }]}>
            ₹{periodData.avgPerOrder}
          </Text>
        </View>
      </View>

      {/* ================= 4. WEEKLY ACTIVITY BAR CHART ================= */}
      <View style={tw`p-3.5 rounded-2xl bg-slate-50 border border-slate-200`}>
        <View style={tw`flex-row justify-between items-center mb-3`}>
          <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 11 }]}>
            Weekly Payout Trend
          </Text>
          <Text style={[Typography.caption, { color: '#047857', fontSize: 9, fontWeight: '800' }]}>
            Peak: Sat (₹2,450)
          </Text>
        </View>

        {/* Bars Strip */}
        <View style={tw`flex-row items-end justify-between h-24 pt-2`}>
          {weeklyData.map((d, idx) => {
            const heightPercent = Math.max(15, Math.round((d.amount / maxWeeklyAmount) * 100));
            return (
              <View key={idx} style={tw`items-center flex-1`}>
                <Text style={[Typography.caption, { color: d.isToday ? '#047857' : '#94A3B8', fontSize: 7.5, fontWeight: '700', marginBottom: 2 }]}>
                  ₹{d.amount > 999 ? `${(d.amount / 1000).toFixed(1)}k` : d.amount}
                </Text>
                <View style={tw`w-4 h-16 bg-slate-200 rounded-full justify-end overflow-hidden`}>
                  <View
                    style={[
                      tw`w-full rounded-full`,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: d.isToday ? '#047857' : d.amount > 2000 ? '#10B981' : '#94A3B8',
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    Typography.caption,
                    {
                      color: d.isToday ? '#047857' : '#64748B',
                      fontSize: 8.5,
                      fontWeight: d.isToday ? '800' : '600',
                      marginTop: 3,
                    },
                  ]}
                >
                  {d.day}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ================= 5. DETAILED INCOME BREAKDOWN ================= */}
      <View style={tw`p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm`}>
        <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 12, marginBottom: 3 }]}>
          Income Breakdown ({selectedPeriod === 'TODAY' ? 'Today' : selectedPeriod === 'WEEK' ? 'This Week' : 'This Month'})
        </Text>

        <View style={tw`gap-2`}>
          {/* Base Pay */}
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-2 h-2 rounded-full bg-slate-400 mr-2`} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 10.5 }]}>
                Base Delivery Pay ({periodData.trips} trips)
              </Text>
            </View>
            <Text style={[Typography.caption, { color: '#0F172A', fontSize: 11, fontWeight: '700' }]}>
              ₹{periodData.basePay.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Surge */}
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-2 h-2 rounded-full bg-amber-500 mr-2`} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 10.5 }]}>
                Peak Surge Demand Bonus
              </Text>
            </View>
            <Text style={[Typography.caption, { color: '#B45309', fontSize: 11, fontWeight: '700' }]}>
              +₹{periodData.surge.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Tips */}
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-2 h-2 rounded-full bg-emerald-500 mr-2`} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 10.5 }]}>
                Customer Tips (100% to you)
              </Text>
            </View>
            <Text style={[Typography.caption, { color: '#047857', fontSize: 11, fontWeight: '700' }]}>
              +₹{periodData.tips.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Incentives */}
          <View style={tw`flex-row justify-between items-center`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-2 h-2 rounded-full bg-blue-500 mr-2`} />
              <Text style={[Typography.caption, { color: '#334155', fontSize: 10.5 }]}>
                Milestone & Quest Bonus
              </Text>
            </View>
            <Text style={[Typography.caption, { color: '#2563EB', fontSize: 11, fontWeight: '700' }]}>
              +₹{periodData.incentives.toLocaleString('en-IN')}
            </Text>
          </View>

          {/* Total Net */}
          <View style={tw`flex-row justify-between items-center pt-2.5 border-t border-slate-100 mt-1`}>
            <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11.5 }]}>
              Net Total Earnings
            </Text>
            <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 14 }]}>
              ₹{periodData.total.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </View>

      {/* ================= 6. DAILY QUEST & TARGET CARD ================= */}
      <View style={tw`p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm`}>
        <View style={tw`flex-row justify-between items-center mb-1.5`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="trophy" size={14} color="#047857" style={tw`mr-1.5`} />
            <Text style={[Typography.cardTitle, { color: '#064E3B', fontSize: 11.5 }]}>
              Daily Target Quest: 20 Orders
            </Text>
          </View>
          <View style={tw`px-2 py-0.5 rounded bg-emerald-200/80`}>
            <Text style={[Typography.badge, { color: '#064E3B', fontSize: 9 }]}>
              +₹250 Bonus
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={tw`h-2 bg-emerald-200 rounded-full my-1.5 overflow-hidden`}>
          <View style={[tw`h-full bg-emerald-600 rounded-full`, { width: '70%' }]} />
        </View>

        <View style={tw`flex-row justify-between items-center mt-0.5`}>
          <Text style={[Typography.caption, { color: '#047857', fontSize: 9.5, fontWeight: '700' }]}>
            14 of 20 Delivered (70%)
          </Text>
          <Text style={[Typography.caption, { color: '#065F46', fontSize: 9.5 }]}>
            6 more trips to unlock +₹250
          </Text>
        </View>
      </View>

      {/* ================= 7. RECENT TRANSACTIONS LEDGER ================= */}
      <View style={tw`p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm`}>
        <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 12, marginBottom: 2.5 }]}>
          Recent Payout Transfers
        </Text>

        <View style={tw`gap-2.5`}>
          {recentPayouts.map((tx) => (
            <View key={tx.id} style={tw`flex-row justify-between items-center py-1.5 border-b border-slate-50`}>
              <View style={tw`flex-row items-center flex-1 mr-2`}>
                <View style={tw`w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 items-center justify-center mr-2.5`}>
                  <Ionicons name="arrow-up" size={13} color="#047857" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 11 }]} numberOfLines={1}>
                    {tx.title}
                  </Text>
                  <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5 }]}>
                    {tx.bank} • {tx.time}
                  </Text>
                </View>
              </View>

              <View style={tw`items-end`}>
                <Text style={[Typography.amountLarge, { color: '#047857', fontSize: 12 }]}>
                  +₹{tx.amount}
                </Text>
                <Text style={[Typography.badge, { color: '#047857', fontSize: 8 }]}>
                  {tx.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Wallet Payout Modal */}
      <WalletPayoutModal
        visible={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
      />
    </View>
  );
};
