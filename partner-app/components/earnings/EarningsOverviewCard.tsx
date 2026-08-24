import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { MOCK_WEEKLY_EARNINGS } from '../../constants/mockData';
import tw from 'twrnc';

interface EarningsOverviewCardProps {
  onOpenWithdraw: () => void;
}

type PeriodFilter = 'TODAY' | 'WEEK' | 'MONTH';

export const EarningsOverviewCard: React.FC<EarningsOverviewCardProps> = ({ onOpenWithdraw }) => {
  const { earningsSummary } = useDeliveryContext();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('TODAY');

  const maxWeekly = Math.max(...MOCK_WEEKLY_EARNINGS.map((d) => d.amount));
  const floatingCashPercent = Math.min(
    100,
    (earningsSummary.cashCollected / earningsSummary.floatingCashLimit) * 100
  );

  const periodData = {
    TODAY: {
      total: earningsSummary.todayTotal,
      trips: earningsSummary.tripsCount,
      hours: earningsSummary.onlineHours,
      avgPerOrder: Math.round(earningsSummary.todayTotal / Math.max(earningsSummary.tripsCount, 1)),
      basePay: earningsSummary.basePay,
      surge: earningsSummary.surgeBonus,
      tips: earningsSummary.tips,
      incentives: earningsSummary.incentives,
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

  return (
    <View style={tw`px-1 pt-1 pb-4`}>
      {/* ================= 1. CARDLESS BALANCE & CASHOUT ================= */}
      <View style={tw`mb-5`}>
        <View style={tw`flex-row justify-between items-start`}>
          <View>
            <Text style={tw`text-xs font-bold text-slate-500 uppercase tracking-wider`}>
              Available Balance
            </Text>
            <Text style={tw`text-4xl font-black text-slate-900 tracking-tight mt-0.5`}>
              ₹{earningsSummary.walletBalance.toLocaleString('en-IN')}
              <Text style={tw`text-2xl font-bold text-emerald-600`}>.00</Text>
            </Text>
            <View style={tw`flex-row items-center mt-1`}>
              <View style={tw`w-2 h-2 rounded-full bg-emerald-500 mr-1.5`} />
              <Text style={tw`text-xs font-bold text-slate-500`}>
                HDFC Bank ****4921 • Instant IMPS
              </Text>
            </View>
          </View>

          {/* Cashout Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onOpenWithdraw}
            style={[
              tw`px-5 py-2.5 rounded-full flex-row items-center`,
              { backgroundColor: '#047857' },
            ]}
          >
            <Ionicons name="flash" size={14} color="#FFFFFF" style={tw`mr-1.5`} />
            <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
              Cashout
            </Text>
          </TouchableOpacity>
        </View>

        {/* COD In Hand Bar (Flat) */}
        <View style={tw`mt-4 pt-3 border-t border-slate-200`}>
          <View style={tw`flex-row justify-between items-center mb-1.5`}>
            <Text style={tw`text-xs font-bold text-slate-700`}>
              COD Cash in Hand: <Text style={tw`font-black text-slate-900`}>₹{earningsSummary.cashCollected}</Text>
            </Text>
            <Text style={tw`text-xs font-bold text-slate-500`}>
              Limit: ₹{earningsSummary.floatingCashLimit}
            </Text>
          </View>
          <View style={tw`h-2 bg-slate-200 rounded-full overflow-hidden`}>
            <View
              style={[
                tw`h-full rounded-full`,
                {
                  width: `${floatingCashPercent}%`,
                  backgroundColor: floatingCashPercent > 80 ? Colors.danger : '#10B981',
                },
              ]}
            />
          </View>
        </View>
      </View>

      {/* ================= 2. PERIOD SELECTOR ================= */}
      <View style={tw`flex-row justify-between items-center mb-4 pt-2 border-t border-slate-200`}>
        <Text style={tw`text-sm font-black text-slate-900`}>
          Earnings Breakdown
        </Text>

        <View style={tw`flex-row bg-slate-200 p-0.5 rounded-full`}>
          {(['TODAY', 'WEEK', 'MONTH'] as PeriodFilter[]).map((tab) => {
            const isSelected = selectedPeriod === tab;
            return (
              <TouchableOpacity
                key={tab}
                activeOpacity={0.8}
                onPress={() => setSelectedPeriod(tab)}
                style={[
                  tw`px-3.5 py-1 rounded-full`,
                  isSelected ? tw`bg-white shadow-sm` : null,
                ]}
              >
                <Text
                  style={[
                    tw`text-[11px]`,
                    {
                      color: isSelected ? '#047857' : Colors.textSecondary,
                      fontWeight: isSelected ? '900' : '600',
                    },
                  ]}
                >
                  {tab === 'TODAY' ? 'Today' : tab === 'WEEK' ? 'Week' : 'Month'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ================= 3. FLAT 4-METRIC ROW (NO BOX) ================= */}
      <View style={tw`flex-row justify-between items-center py-3 px-1 mb-4 border-b border-slate-200`}>
        <View style={tw`items-center flex-1`}>
          <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-wider`}>Total</Text>
          <Text style={tw`text-lg font-black text-slate-900 mt-0.5`}>₹{periodData.total}</Text>
        </View>
        <View style={tw`w-[1px] bg-slate-200 h-8`} />
        <View style={tw`items-center flex-1`}>
          <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-wider`}>Trips</Text>
          <Text style={tw`text-lg font-black text-slate-900 mt-0.5`}>{periodData.trips}</Text>
        </View>
        <View style={tw`w-[1px] bg-slate-200 h-8`} />
        <View style={tw`items-center flex-1`}>
          <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-wider`}>Online</Text>
          <Text style={tw`text-lg font-black text-slate-900 mt-0.5`}>{periodData.hours}h</Text>
        </View>
        <View style={tw`w-[1px] bg-slate-200 h-8`} />
        <View style={tw`items-center flex-1`}>
          <Text style={tw`text-[10px] font-bold text-emerald-600 uppercase tracking-wider`}>Avg/Trip</Text>
          <Text style={tw`text-lg font-black text-emerald-600 mt-0.5`}>₹{periodData.avgPerOrder}</Text>
        </View>
      </View>

      {/* ================= 4. FLAT WEEKLY BAR VISUALIZER ================= */}
      <View style={tw`mb-4 pb-4 border-b border-slate-200`}>
        <View style={tw`flex-row justify-between items-center mb-2`}>
          <Text style={tw`text-xs font-bold text-slate-600`}>Weekly Activity</Text>
          <Text style={tw`text-xs font-bold text-emerald-600`}>Peak: Sunday (₹2.4k)</Text>
        </View>

        <View style={tw`flex-row justify-between items-end h-20 pt-1`}>
          {MOCK_WEEKLY_EARNINGS.map((item, idx) => {
            const heightPercent = Math.max(16, (item.amount / maxWeekly) * 100);
            const isToday = idx === MOCK_WEEKLY_EARNINGS.length - 1;

            return (
              <View key={item.day} style={tw`items-center flex-1`}>
                <Text style={tw`text-[8px] font-bold text-slate-400 mb-1`}>
                  {(item.amount / 1000).toFixed(1)}k
                </Text>
                <View
                  style={[
                    tw`w-4 rounded-full`,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isToday ? '#047857' : '#CBD5E1',
                    },
                  ]}
                />
                <Text
                  style={[
                    tw`text-[9px] mt-1.5`,
                    {
                      fontWeight: isToday ? '900' : '600',
                      color: isToday ? '#047857' : '#64748B',
                    },
                  ]}
                >
                  {item.day.slice(0, 3)}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* ================= 5. FLAT ITEMIZED LEDGER ================= */}
      <View style={tw`mb-4`}>
        <Text style={tw`text-xs font-black text-slate-900 uppercase tracking-wider mb-2`}>
          Payout Stream
        </Text>

        <View style={tw`gap-1`}>
          <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-100`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="bicycle-outline" size={16} color="#047857" style={tw`mr-2.5`} />
              <Text style={tw`text-xs font-bold text-slate-800`}>Base Distance Fare</Text>
            </View>
            <Text style={tw`text-xs font-black text-slate-900`}>₹{periodData.basePay}</Text>
          </View>

          <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-100`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="trending-up-outline" size={16} color="#D97706" style={tw`mr-2.5`} />
              <Text style={tw`text-xs font-bold text-slate-800`}>Surge & Peak Hours</Text>
            </View>
            <Text style={tw`text-xs font-black text-amber-600`}>+₹{periodData.surge}</Text>
          </View>

          <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-100`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="heart-outline" size={16} color="#2563EB" style={tw`mr-2.5`} />
              <Text style={tw`text-xs font-bold text-slate-800`}>Customer Tips (100%)</Text>
            </View>
            <Text style={tw`text-xs font-black text-emerald-600`}>+₹{periodData.tips}</Text>
          </View>

          <View style={tw`flex-row justify-between items-center py-2 border-b border-slate-100`}>
            <View style={tw`flex-row items-center`}>
              <Ionicons name="trophy-outline" size={16} color="#7C3AED" style={tw`mr-2.5`} />
              <Text style={tw`text-xs font-bold text-slate-800`}>Milestone Quest Bonus</Text>
            </View>
            <Text style={tw`text-xs font-black text-purple-600`}>+₹{periodData.incentives}</Text>
          </View>
        </View>
      </View>

      {/* ================= 6. FLAT QUEST TARGET TRACKER ================= */}
      <View style={tw`pt-2`}>
        <View style={tw`flex-row justify-between items-center mb-1.5`}>
          <View style={tw`flex-row items-center`}>
            <Ionicons name="flame" size={15} color="#D97706" style={tw`mr-1.5`} />
            <Text style={tw`text-xs font-bold text-slate-800`}>
              Daily Target: <Text style={tw`font-black text-slate-900`}>14 / 20 Orders</Text>
            </Text>
          </View>
          <Text style={tw`text-xs font-black text-emerald-600`}>
            +₹250 Next Reward
          </Text>
        </View>
        <View style={tw`h-2 bg-slate-200 rounded-full overflow-hidden`}>
          <View style={[tw`h-full bg-amber-500 rounded-full`, { width: '70%' }]} />
        </View>
      </View>
    </View>
  );
};




