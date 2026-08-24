import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useDutyContext } from '../../context/DutyContext';
import { StatusBadge } from '../common/StatusBadge';
import tw from 'twrnc';

interface HomeCockpitViewProps {
  onViewWallet: () => void;
  onOpenActiveTask: () => void;
  onDepositCash: () => void;
  onOpenSupport: () => void;
}

export const HomeCockpitView: React.FC<HomeCockpitViewProps> = ({
  onViewWallet,
  onOpenActiveTask,
  onDepositCash,
  onOpenSupport,
}) => {
  const { earningsSummary, activeOrder, triggerIncomingOrderSimulation } = useDeliveryContext();
  const { isOnline, toggleDuty, currentHub, formattedShiftTime } = useDutyContext();

  const hotspots = [
    { id: 'h1', name: 'HSR Layout Sector 2 Hub', surge: '+₹35', distance: '0.4 km', demand: 'High Surge 🔥' },
    { id: 'h2', name: 'Koramangala 4th Block', surge: '+₹25', distance: '2.1 km', demand: 'Peak Demand ⚡' },
    { id: 'h3', name: 'Indiranagar 100ft Rd', surge: '+₹30', distance: '3.8 km', demand: 'Surge Active' },
  ];

  return (
    <View style={tw`pb-4`}>
      {/* ================= 1. LIVE RADAR & DUTY STATUS HERO ================= */}
      {isOnline ? (
        <View style={tw`mb-5`}>
          {/* Top Status & Live Radar Header */}
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <View style={tw`flex-row items-center`}>
              <View style={tw`w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2`} />
              <Text style={tw`text-xs font-black text-emerald-800 uppercase tracking-wider`}>
                Online & Dispatch Radar Active
              </Text>
            </View>
            <View style={tw`flex-row items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200`}>
              <Ionicons name="location" size={11} color="#047857" style={tw`mr-1`} />
              <Text style={tw`text-[10px] font-black text-emerald-800`}>{currentHub}</Text>
            </View>
          </View>

          {/* Big Earnings Counter & Cashout Pill */}
          <View style={tw`flex-row justify-between items-start mb-4`}>
            <View>
              <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider`}>
                Today's Earnings
              </Text>
              <Text style={tw`text-3xl font-black text-slate-900 tracking-tight mt-0.5`}>
                ₹{earningsSummary.todayTotal}
                <Text style={tw`text-xl font-bold text-emerald-600`}>.00</Text>
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onViewWallet}
              style={[
                tw`px-4 py-2 rounded-full flex-row items-center`,
                { backgroundColor: '#047857' },
              ]}
            >
              <Ionicons name="flash" size={13} color="#FFFFFF" style={tw`mr-1.5`} />
              <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
                Cashout
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3-Metric Flat Shift Telemetry */}
          <View style={tw`flex-row justify-between items-center py-2.5 px-1 border-y border-slate-200`}>
            <View style={tw`items-center flex-1`}>
              <Text style={tw`text-[10px] font-bold text-slate-400 uppercase`}>Trips Done</Text>
              <Text style={tw`text-base font-black text-slate-900 mt-0.5`}>{earningsSummary.tripsCount}</Text>
            </View>
            <View style={tw`w-[1px] bg-slate-200 h-7 self-center`} />
            <View style={tw`items-center flex-1`}>
              <Text style={tw`text-[10px] font-bold text-slate-400 uppercase`}>Shift Time</Text>
              <Text style={tw`text-base font-black text-slate-900 mt-0.5`}>{formattedShiftTime}</Text>
            </View>
            <View style={tw`w-[1px] bg-slate-200 h-7 self-center`} />
            <View style={tw`items-center flex-1`}>
              <Text style={tw`text-[10px] font-bold text-amber-700 uppercase`}>COD in Hand</Text>
              <Text style={tw`text-base font-black text-amber-600 mt-0.5`}>₹{earningsSummary.cashCollected}</Text>
            </View>
          </View>

          {/* Active Order Banner OR Radar Scanner Mode */}
          {activeOrder ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onOpenActiveTask}
              style={tw`mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200`}
            >
              <View style={tw`flex-row justify-between items-center mb-2`}>
                <View style={tw`flex-row items-center`}>
                  <View style={tw`w-2 h-2 rounded-full bg-emerald-500 mr-2`} />
                  <Text style={tw`text-xs font-black text-emerald-900 uppercase`}>
                    Active Order #{activeOrder.orderNumber}
                  </Text>
                </View>
                <StatusBadge status={activeOrder.status} />
              </View>

              {/* Route snippet */}
              <View style={tw`my-1`}>
                <Text style={tw`text-xs font-bold text-slate-800`} numberOfLines={1}>
                  🏬 {activeOrder.storeName} ➔ 🏠 {activeOrder.customerAddress}
                </Text>
              </View>

              <View style={tw`flex-row justify-between items-center mt-2 pt-2 border-t border-emerald-200`}>
                <Text style={tw`text-xs font-black text-emerald-800`}>
                  Payout: ₹{activeOrder.totalPayout}
                </Text>
                <View style={tw`flex-row items-center`}>
                  <Text style={tw`text-xs font-black text-emerald-700 mr-1`}>Resume Trip</Text>
                  <Ionicons name="arrow-forward" size={14} color="#047857" />
                </View>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={tw`mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex-row justify-between items-center`}>
              <View style={tw`flex-row items-center flex-1 mr-2`}>
                <View style={tw`w-8 h-8 rounded-full bg-emerald-100 items-center justify-center mr-3`}>
                  <Ionicons name="radio" size={17} color="#047857" />
                </View>
                <View style={tw`flex-1`}>
                  <Text style={tw`text-xs font-black text-slate-900`}>
                    Scanning for Nearby Grocery Drops...
                  </Text>
                  <Text style={tw`text-[10px] text-slate-500 mt-0.5`}>
                    Auto-matching within 3.5 km dark store zone
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={triggerIncomingOrderSimulation}
                style={tw`px-3 py-1.5 rounded-xl bg-emerald-600 shadow-sm`}
              >
                <Text style={tw`text-[11px] font-black text-white`}>
                  + Test Order
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      ) : (
        /* OFFLINE HERO STATE */
        <View style={tw`mb-5 p-5 rounded-2xl bg-slate-100 border border-slate-200 items-center`}>
          <Ionicons name="power" size={28} color="#64748B" style={tw`mb-2`} />
          <Text style={tw`text-sm font-black text-slate-800`}>You Are Currently Offline</Text>
          <Text style={tw`text-xs text-slate-500 text-center mt-0.5 mb-4`}>
            Go online to start receiving instant grocery orders in your zone.
          </Text>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleDuty}
            style={tw`px-6 py-2.5 rounded-full bg-emerald-600 shadow-md flex-row items-center`}
          >
            <Ionicons name="radio-button-on" size={15} color="#FFFFFF" style={tw`mr-2`} />
            <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>Go Online Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= 2. SURGE HOTSPOTS & DEMAND HUBS ================= */}
      <View style={tw`mb-5`}>
        <View style={tw`flex-row justify-between items-center mb-2 px-0.5`}>
          <Text style={tw`text-xs font-black text-slate-900 uppercase tracking-wider`}>
            High Demand Dark Stores
          </Text>
          <View style={tw`flex-row items-center`}>
            <View style={tw`w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5`} />
            <Text style={tw`text-[10px] font-black text-amber-700`}>Live Surge ⚡</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={tw`gap-2.5 py-0.5`}
        >
          {hotspots.map((spot) => (
            <View
              key={spot.id}
              style={tw`w-52 p-3.5 rounded-2xl bg-slate-50 border border-slate-200`}
            >
              <View style={tw`flex-row justify-between items-start mb-1`}>
                <Text style={tw`text-xs font-black text-slate-800 flex-1 mr-1`} numberOfLines={1}>
                  {spot.name}
                </Text>
                <View style={tw`px-1.5 py-0.5 rounded bg-amber-100`}>
                  <Text style={tw`text-[10px] font-black text-amber-800`}>{spot.surge}</Text>
                </View>
              </View>
              <Text style={tw`text-[10px] text-slate-500`}>
                {spot.distance} away • {spot.demand}
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* ================= 3. DAILY QUEST PROGRESS ================= */}
      <View style={tw`mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex-row justify-between items-center`}>
        <View style={tw`flex-1 mr-3`}>
          <View style={tw`flex-row items-center mb-1`}>
            <Ionicons name="flame" size={15} color="#D97706" style={tw`mr-1`} />
            <Text style={tw`text-xs font-black text-amber-900`}>Daily Quest: 14/20 Deliveries</Text>
          </View>
          <View style={tw`h-1.5 bg-amber-200 rounded-full overflow-hidden`}>
            <View style={[tw`h-full bg-amber-500 rounded-full`, { width: '70%' }]} />
          </View>
        </View>
        <View style={tw`px-2 py-1 bg-white rounded-xl shadow-sm border border-amber-200`}>
          <Text style={tw`text-[10px] font-black text-amber-700`}>+₹250 Bonus</Text>
        </View>
      </View>

      {/* ================= 4. QUICK STATION TOOLS ================= */}
      <View style={tw`mb-2`}>
        <Text style={tw`text-xs font-black text-slate-900 uppercase tracking-wider mb-2.5 px-0.5`}>
          Rider Hub Utilities
        </Text>

        <View style={tw`flex-row justify-between gap-2`}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onDepositCash}
            style={tw`flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-200 items-center`}
          >
            <View style={tw`w-9 h-9 rounded-xl bg-emerald-100 items-center justify-center mb-1`}>
              <Ionicons name="wallet-outline" size={18} color="#047857" />
            </View>
            <Text style={tw`text-[11px] font-bold text-slate-800`}>Deposit Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenSupport}
            style={tw`flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-200 items-center`}
          >
            <View style={tw`w-9 h-9 rounded-xl bg-blue-100 items-center justify-center mb-1`}>
              <Ionicons name="storefront-outline" size={18} color="#2563EB" />
            </View>
            <Text style={tw`text-[11px] font-bold text-slate-800`}>Store Hubs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenSupport}
            style={tw`flex-1 p-3 rounded-2xl bg-slate-50 border border-slate-200 items-center`}
          >
            <View style={tw`w-9 h-9 rounded-xl bg-purple-100 items-center justify-center mb-1`}>
              <Ionicons name="headset-outline" size={18} color="#7C3AED" />
            </View>
            <Text style={tw`text-[11px] font-bold text-slate-800`}>Help SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
