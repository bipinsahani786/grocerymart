import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import tw from 'twrnc';

/**
 * Single Responsibility: Renders fulfillment preferences (Delivery rider notes/tipping OR Store Pickup express guidelines).
 */
export const CartDeliveryNotes: React.FC = () => {
  const { fulfillmentMode, selectedStore } = useCart();
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>('door');
  const [selectedTip, setSelectedTip] = useState<number | null>(2);

  const instructions = [
    { id: 'door', label: 'Leave at Door', icon: 'home-outline' as const },
    { id: 'bell', label: "Don't Ring Bell", icon: 'notifications-off-outline' as const },
    { id: 'call', label: 'Call on Arrival', icon: 'call-outline' as const },
  ];

  const tips = [1, 2, 5];

  if (fulfillmentMode === 'pickup') {
    return (
      <View style={tw`mb-4`}>
        <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1`}>
          Store Pickup Information
        </Text>

        <View style={tw`p-4 rounded-3xl bg-white border border-slate-100 shadow-2xs`}>
          {/* Pickup Counter Guideline */}
          <View style={tw`flex-row items-center gap-3 pb-3 mb-3 border-b border-slate-50`}>
            <View style={tw`w-9 h-9 rounded-2xl bg-blue-50 items-center justify-center`}>
              <Ionicons name="qr-code-outline" size={18} color="#2563EB" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-black text-slate-800`}>Express Counter Pickup</Text>
              <Text style={tw`text-[10px] font-medium text-slate-400 mt-0.5`}>
                Show your pickup OTP at <Text style={tw`font-bold text-slate-700`}>Counter #2 (Online Orders)</Text>
              </Text>
            </View>
          </View>

          {/* Packing & Timing */}
          <View style={tw`flex-row items-center gap-3 pb-3 mb-3 border-b border-slate-50`}>
            <View style={tw`w-9 h-9 rounded-2xl bg-emerald-50 items-center justify-center`}>
              <Ionicons name="timer-outline" size={18} color="#059669" />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-black text-slate-800`}>10-Minute Packing Promise</Text>
              <Text style={tw`text-[10px] font-medium text-slate-400 mt-0.5`}>
                Your organic basket will be packed and sealed fresh before you arrive.
              </Text>
            </View>
          </View>

          {/* Store Address Preview */}
          <View style={tw`flex-row items-center justify-between pt-1`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <Ionicons name="navigate-circle" size={16} color="#7C3AED" />
              <Text style={tw`text-[11px] font-bold text-purple-700`}>{selectedStore.distance}</Text>
            </View>
            <Text style={tw`text-[10px] font-bold text-slate-400`}>{selectedStore.address}</Text>
          </View>
        </View>
      </View>
    );
  }

  // Home Delivery Mode Preferences
  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1`}>
        Delivery Preferences
      </Text>

      <View style={tw`p-3.5 rounded-3xl bg-white border border-slate-100 shadow-2xs`}>
        {/* Instruction Chips */}
        <Text style={tw`text-[11px] font-bold text-slate-600 mb-2`}>Delivery Instructions</Text>
        <View style={tw`flex-row gap-2 mb-3.5`}>
          {instructions.map((item) => {
            const isSelected = selectedInstruction === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSelectedInstruction(isSelected ? null : item.id)}
                style={[
                  tw`flex-1 p-2 rounded-2xl border items-center justify-center`,
                  isSelected
                    ? tw`bg-emerald-50 border-emerald-300`
                    : tw`bg-slate-50 border-slate-100`,
                ]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={15}
                  color={isSelected ? '#059669' : '#64748B'}
                />
                <Text
                  style={[
                    tw`text-[9px] font-bold mt-1 text-center`,
                    isSelected ? tw`text-emerald-800` : tw`text-slate-500`,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Delivery Partner Tip */}
        <View style={tw`pt-2.5 border-t border-slate-50 flex-row items-center justify-between`}>
          <View>
            <Text style={tw`text-[11px] font-bold text-slate-700`}>Tip Delivery Partner</Text>
            <Text style={tw`text-[9px] font-medium text-slate-400`}>100% goes to your rider</Text>
          </View>

          <View style={tw`flex-row gap-1.5`}>
            {tips.map((amount) => {
              const isSelected = selectedTip === amount;
              return (
                <TouchableOpacity
                  key={amount}
                  onPress={() => setSelectedTip(isSelected ? null : amount)}
                  style={[
                    tw`px-2.5 py-1 rounded-full border`,
                    isSelected
                      ? tw`bg-emerald-500 border-emerald-500`
                      : tw`bg-slate-50 border-slate-200`,
                  ]}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      tw`text-[10px] font-black`,
                      isSelected ? tw`text-white` : tw`text-slate-600`,
                    ]}
                  >
                    +₹{amount * 10}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};
