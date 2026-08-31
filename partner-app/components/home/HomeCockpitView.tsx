import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDeliveryContext } from '../../context/DeliveryContext';
import { useDutyContext } from '../../context/DutyContext';
import { LiveDriverRadarMap } from './LiveDriverRadarMap';
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

  return (
    <View style={tw`flex-1 w-full`}>
      {/* ================= 1. INTERACTIVE LIVE RADAR MAP CANVAS ================= */}
      <LiveDriverRadarMap
        isOnline={isOnline}
        activeOrder={activeOrder}
        currentHub={currentHub}
        onSimulateOrder={triggerIncomingOrderSimulation}
      />

      {/* ================= 2. FLOATING BOTTOM DRIVER CONTROLLER ================= */}
      <View
        style={[
          tw`p-4 rounded-t-3xl shadow-2xl`,
          {
            backgroundColor: '#0F172A',
            borderTopWidth: 1,
            borderTopColor: '#1E293B',
            marginTop: -24,
          },
        ]}
      >
        {/* Grabber Indicator */}
        <View style={tw`w-10 h-1 rounded-full bg-slate-600 self-center mb-3`} />

        {/* ACTIVE ORDER POPUP STRIP */}
        {activeOrder ? (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onOpenActiveTask}
            style={tw`mb-4 p-4 rounded-2xl bg-emerald-600 shadow-lg`}
          >
            <View style={tw`flex-row justify-between items-center mb-2`}>
              <View style={tw`flex-row items-center`}>
                <View style={tw`w-2.5 h-2.5 rounded-full bg-white mr-2`} />
                <Text style={tw`text-xs font-black text-white uppercase`}>
                  Active Order #{activeOrder.orderNumber}
                </Text>
              </View>
              <View style={tw`px-2.5 py-0.5 rounded-full bg-white/20`}>
                <Text style={tw`text-xs font-black text-white`}>
                  ₹{activeOrder.totalPayout}
                </Text>
              </View>
            </View>

            <Text style={tw`text-sm font-bold text-white mb-2`} numberOfLines={1}>
              🏬 {activeOrder.storeName} ➔ 🏠 {activeOrder.customerAddress}
            </Text>

            <View style={tw`flex-row justify-between items-center pt-2 border-t border-emerald-500`}>
              <Text style={tw`text-xs font-medium text-emerald-100`}>
                {activeOrder.items.length} items to deliver
              </Text>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-xs font-black text-white mr-1`}>Resume Journey</Text>
                <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* DRIVER MASTER DUTY ROW */}
        {isOnline ? (
          /* ONLINE STATE */
          <View>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <View style={tw`flex-row items-center flex-1 mr-2`}>
                <View style={tw`w-3 h-3 rounded-full bg-emerald-500 mr-2.5`} />
                <View style={tw`flex-1`}>
                  <Text style={tw`text-sm font-black text-white`}>
                    Searching for Orders
                  </Text>
                  <Text style={tw`text-xs font-medium text-slate-400`} numberOfLines={1}>
                    Auto-dispatching in {currentHub}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={toggleDuty}
                style={tw`px-4 py-2 rounded-full bg-rose-500/20 border border-rose-500/40 flex-row items-center`}
              >
                <Ionicons name="power" size={13} color="#FB7185" style={tw`mr-1`} />
                <Text style={tw`text-xs font-black text-rose-300`}>Go Offline</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* OFFLINE MASTER "GO ONLINE" BUTTON */
          <View style={tw`items-center my-1`}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggleDuty}
              style={[
                tw`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-lg`,
                { backgroundColor: '#10B981' },
              ]}
            >
              <Ionicons name="radio-button-on" size={18} color="#FFFFFF" style={tw`mr-2`} />
              <Text style={tw`text-base font-black text-white uppercase tracking-wider`}>
                Go Online
              </Text>
            </TouchableOpacity>
            <Text style={tw`text-xs font-medium text-slate-400 mt-2`}>
              Turn duty on to start receiving delivery requests
            </Text>
          </View>
        )}

        {/* 3-METRIC TELEMETRY STRIP */}
        <View style={tw`flex-row justify-between items-center py-3 my-2 border-t border-b border-slate-800`}>
          <View style={tw`items-center flex-1`}>
            <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider`}>Trips</Text>
            <Text style={tw`text-base font-black text-white mt-0.5`}>
              {earningsSummary.tripsCount} Done
            </Text>
          </View>
          <View style={tw`w-px bg-slate-800 h-6`} />
          <View style={tw`items-center flex-1`}>
            <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider`}>Online</Text>
            <Text style={tw`text-base font-black text-emerald-400 mt-0.5`}>
              {formattedShiftTime}
            </Text>
          </View>
          <View style={tw`w-px bg-slate-800 h-6`} />
          <View style={tw`items-center flex-1`}>
            <Text style={tw`text-xs font-bold text-slate-400 uppercase tracking-wider`}>COD Hand</Text>
            <Text style={tw`text-base font-black text-amber-400 mt-0.5`}>
              ₹{earningsSummary.cashCollected}
            </Text>
          </View>
        </View>

        {/* QUICK ACTION ICONS DOCK */}
        <View style={tw`flex-row justify-around items-center pt-2`}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onDepositCash}
            style={tw`items-center flex-1`}
          >
            <View style={tw`w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 items-center justify-center mb-1`}>
              <Ionicons name="cash-outline" size={20} color="#34D399" />
            </View>
            <Text style={tw`text-xs font-bold text-slate-300`}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onOpenSupport}
            style={tw`items-center flex-1`}
          >
            <View style={tw`w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 items-center justify-center mb-1`}>
              <Ionicons name="storefront-outline" size={20} color="#60A5FA" />
            </View>
            <Text style={tw`text-xs font-bold text-slate-300`}>Hubs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onViewWallet}
            style={tw`items-center flex-1`}
          >
            <View style={tw`w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 items-center justify-center mb-1`}>
              <Ionicons name="wallet-outline" size={20} color="#FBBF24" />
            </View>
            <Text style={tw`text-xs font-bold text-slate-300`}>Wallet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onOpenSupport}
            style={tw`items-center flex-1`}
          >
            <View style={tw`w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 items-center justify-center mb-1`}>
              <Ionicons name="shield-checkmark-outline" size={20} color="#F43F5E" />
            </View>
            <Text style={tw`text-xs font-bold text-slate-300`}>SOS Help</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
