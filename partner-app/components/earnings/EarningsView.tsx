import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useLanguageContext } from '../../context/LanguageContext';
import { Typography } from '../../constants/typography';
import { WalletPayoutModal } from './WalletPayoutModal';
import tw from 'twrnc';

interface EarningsViewProps {
  onDepositCash: () => void;
  onCashout?: () => void;
}

export const EarningsView: React.FC<EarningsViewProps> = ({ onDepositCash, onCashout }) => {
  const { earningsSummary, earningsData, isLoadingEarnings, refreshEarnings } = useDeliveryContext();
  const { t } = useLanguageContext();

  const [activeRange, setActiveRange] = useState<'TODAY' | 'WEEK' | 'MONTH'>('TODAY');
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  const windowHeight = Dimensions.get('window').height;

  // Sync range changes with backend
  const handleRangeChange = (range: 'TODAY' | 'WEEK' | 'MONTH') => {
    setActiveRange(range);
    refreshEarnings(range);
  };

  const walletBalance = earningsData?.walletBalance ?? earningsSummary.walletBalance ?? 0;
  const periodTotalEarned = earningsData?.periodMetrics?.totalEarned ?? earningsSummary.todayTotal ?? 0;
  const periodTripsCount = earningsData?.periodMetrics?.tripsCount ?? earningsSummary.tripsCount ?? 0;
  const periodTipsEarned = earningsData?.periodMetrics?.tipsEarned ?? earningsSummary.tips ?? 0;

  // Dynamic weekly trend from backend
  const weeklyTrendData = earningsData?.weeklyTrend && earningsData.weeklyTrend.length === 7
    ? earningsData.weeklyTrend
    : [
        { day: 'Mon', amount: 0 },
        { day: 'Tue', amount: 0 },
        { day: 'Wed', amount: 0 },
        { day: 'Thu', amount: 0 },
        { day: 'Fri', amount: 0 },
        { day: 'Sat', amount: 0 },
        { day: 'Sun', amount: 0 },
      ];

  const maxWeeklyAmount = Math.max(...weeklyTrendData.map((d) => d.amount), 50);

  // Dynamic ledger transactions from backend
  const ledgerItems = earningsData?.ledger || [];

  const handleOpenCashout = () => {
    if (onCashout) {
      onCashout();
    } else {
      setShowPayoutModal(true);
    }
  };

  return (
    <View style={[tw`px-5 pt-3 pb-36 bg-white flex-1`, { minHeight: windowHeight }]}>
      {/* ================= 1. CARDLESS HERO WALLET BALANCE ================= */}
      <View style={tw`pb-5 border-b border-slate-100 items-center`}>
        <Text style={[Typography.caption, { color: '#047857', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 }]}>
          {t.availableBalance}
        </Text>
        <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 32, fontWeight: '900', marginVertical: 3 }]}>
          ₹{walletBalance.toFixed(2)}
        </Text>
        <Text style={[Typography.caption, { color: '#64748B', fontSize: 10 }]}>
          {t.instantImps} • Real-time DB Sync
        </Text>

        {/* Dual Floating Action Buttons */}
        <View style={tw`flex-row gap-3 mt-4 w-full px-2`}>
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleOpenCashout}
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
          <View style={tw`flex-row items-center`}>
            <Text style={[Typography.cardTitle, { color: '#0F172A', fontSize: 14, fontWeight: '900' }]}>
              Payout Summary
            </Text>
            {isLoadingEarnings && (
              <ActivityIndicator size="small" color="#047857" style={tw`ml-2`} />
            )}
          </View>

          {/* Time Selector Pills */}
          <View style={tw`flex-row items-center gap-1 bg-slate-100 p-1 rounded-xl`}>
            {(['TODAY', 'WEEK', 'MONTH'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                onPress={() => handleRangeChange(range)}
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
              ₹{periodTotalEarned.toFixed(2)}
            </Text>
          </View>

          <View style={tw`w-px h-6 bg-slate-200`} />

          <View style={tw`items-center flex-1`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              {t.tripsDelivered}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#0F172A', fontSize: 15, marginTop: 1 }]}>
              {periodTripsCount}
            </Text>
          </View>

          <View style={tw`w-px h-6 bg-slate-200`} />

          <View style={tw`items-center flex-1`}>
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 8.5, fontWeight: '700' }]}>
              {t.tipsEarned}
            </Text>
            <Text style={[Typography.amountLarge, { color: '#D97706', fontSize: 15, marginTop: 1 }]}>
              ₹{periodTipsEarned.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>

      {/* ================= 3. WEEKLY INCOME TREND GRAPH (CARDLESS) ================= */}
      <View style={tw`py-4 border-b border-slate-100`}>
        <View style={tw`flex-row justify-between items-center mb-2.5`}>
          <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5 }]}>
            {t.weeklyIncomeTrend}
          </Text>
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 9, fontWeight: '600' }]}>
            Current Week
          </Text>
        </View>

        <View style={tw`flex-row justify-between items-end h-28 pt-2 px-1`}>
          {weeklyTrendData.map((item, idx) => {
            const heightPercent = maxWeeklyAmount > 0
              ? Math.max(item.amount > 0 ? Math.round((item.amount / maxWeeklyAmount) * 100) : 4, 4)
              : 4;
            const hasAmount = item.amount > 0;

            return (
              <View key={idx} style={tw`items-center flex-1`}>
                <Text style={[Typography.caption, { color: hasAmount ? '#047857' : '#94A3B8', fontSize: 8, marginBottom: 3, fontWeight: hasAmount ? '700' : '400' }]}>
                  ₹{item.amount}
                </Text>
                <View style={tw`w-5 bg-slate-100 rounded-full h-20 justify-end overflow-hidden mb-1.5`}>
                  <View
                    style={[
                      tw`w-full rounded-full`,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: hasAmount ? '#047857' : '#CBD5E1',
                      },
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
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 9.5, fontWeight: '800', letterSpacing: 0.5 }]}>
            {t.incomeLedger}
          </Text>
          {ledgerItems.length > 0 && (
            <Text style={[Typography.caption, { color: '#64748B', fontSize: 9 }]}>
              {ledgerItems.length} Transactions
            </Text>
          )}
        </View>

        {ledgerItems.length === 0 ? (
          <View style={tw`py-8 items-center justify-center`}>
            <View style={tw`w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 items-center justify-center mb-2.5`}>
              <Ionicons name="receipt-outline" size={22} color="#94A3B8" />
            </View>
            <Text style={[Typography.bodyBold, { color: '#334155', fontSize: 13 }]}>
              No transactions yet
            </Text>
            <Text style={[Typography.caption, { color: '#94A3B8', fontSize: 10, textAlign: 'center', marginTop: 3, maxWidth: 240 }]}>
              Completed delivery payouts, tips, and quest bonuses will appear here in real-time.
            </Text>
          </View>
        ) : (
          <View style={tw`py-1`}>
            {ledgerItems.map((item, idx) => {
              const isDebit = item.isDebit || item.type === 'WITHDRAWAL';
              const isTip = item.type === 'TIP';
              const isBonus = item.type === 'BONUS';

              const iconName: any = isDebit
                ? 'arrow-up'
                : isTip
                ? 'heart'
                : isBonus
                ? 'flash'
                : 'arrow-down';

              const iconColor = isDebit
                ? '#DC2626'
                : isTip
                ? '#D97706'
                : isBonus
                ? '#4F46E5'
                : '#047857';

              const iconBg = isDebit
                ? '#FEF2F2'
                : isTip
                ? '#FFFBEB'
                : isBonus
                ? '#EEF2FF'
                : '#ECFDF5';

              const iconBorder = isDebit
                ? '#FEE2E2'
                : isTip
                ? '#FEF3C7'
                : isBonus
                ? '#E0E7FF'
                : '#D1FAE5';

              return (
                <View
                  key={item.id || idx}
                  style={[
                    tw`py-3 flex-row justify-between items-center`,
                    idx !== ledgerItems.length - 1 && tw`border-b border-slate-100`,
                  ]}
                >
                  <View style={tw`flex-row items-center flex-1 mr-2`}>
                    <View
                      style={[
                        tw`w-8 h-8 rounded-xl items-center justify-center mr-3 border`,
                        { backgroundColor: iconBg, borderColor: iconBorder },
                      ]}
                    >
                      <Ionicons name={iconName} size={14} color={iconColor} />
                    </View>
                    <View style={tw`flex-1`}>
                      <Text style={[Typography.bodyBold, { color: '#0F172A', fontSize: 11.5 }]} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={[Typography.caption, { color: '#64748B', fontSize: 9.5, marginTop: 1 }]}>
                        {item.time}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      Typography.amountLarge,
                      {
                        color: isDebit ? '#DC2626' : '#047857',
                        fontSize: 12.5,
                        fontWeight: '800',
                      },
                    ]}
                  >
                    {item.amount}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Embedded Payout Modal */}
      <WalletPayoutModal
        visible={showPayoutModal}
        onClose={() => setShowPayoutModal(false)}
      />
    </View>
  );
};
