import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

/**
 * Single Responsibility: Seamless delivery preferences & optional rider tip
 * integrated directly into the cart scroll flow.
 */
export const CartDeliveryNotes: React.FC = () => {
  const { fulfillmentMode, selectedStore, selectedTip, setSelectedTip } = useCart();
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>(null);

  const instructions = [
    { id: 'door', label: 'Leave at Door', icon: 'home-outline' as const },
    { id: 'bell', label: "Don't Ring Bell", icon: 'notifications-off-outline' as const },
    { id: 'call', label: 'Call on Arrival', icon: 'call-outline' as const },
  ];

  const tipOptions = [10, 20, 30, 50];

  if (fulfillmentMode === 'pickup') {
    return (
      <View style={tw`bg-white py-3 px-4`}>
        <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider mb-2`}>
          Store Pickup Guidelines
        </Text>

        <View style={tw`p-3 rounded-2xl bg-blue-50/50 border border-blue-100 flex-row items-center gap-3 mb-2`}>
          <View style={tw`w-8 h-8 rounded-xl bg-blue-100 items-center justify-center`}>
            <Ionicons name="qr-code-outline" size={16} color="#2563EB" />
          </View>
          <View style={tw`flex-1`}>
            <Text style={tw`text-xs font-black text-slate-900`}>
              {selectedStore?.name ? `Express Pickup: ${selectedStore.name}` : 'Express Counter Pickup'}
            </Text>
            <Text style={tw`text-[10px] font-medium text-slate-500 mt-0.5`}>
              Show your order ID at <Text style={tw`font-bold text-blue-700`}>Takeaway Counter #1</Text>
            </Text>
          </View>
        </View>
      </View>
    );
  }

  // Home Delivery Mode Preferences
  return (
    <View style={tw`bg-white py-3.5 px-4`}>
      <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5`}>
        Delivery Instructions
      </Text>

      {/* Instruction Chips */}
      <View style={tw`flex-row gap-2 mb-3.5`}>
        {instructions.map((item) => {
          const isSelected = selectedInstruction === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => setSelectedInstruction(isSelected ? null : item.id)}
              style={[
                tw`flex-1 py-2 px-1 rounded-2xl border items-center justify-center flex-row gap-1.5`,
                isSelected
                  ? tw`bg-emerald-50 border-emerald-500`
                  : tw`bg-slate-50 border-slate-200`,
              ]}
              activeOpacity={0.75}
            >
              <Ionicons
                name={item.icon}
                size={14}
                color={isSelected ? '#047857' : '#64748B'}
              />
              <Text
                style={[
                  tw`text-[10px] font-black`,
                  isSelected ? tw`text-emerald-900` : tw`text-slate-600`,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Optional Delivery Partner Tip */}
      <View style={tw`pt-3 border-t border-slate-100 flex-row items-center justify-between`}>
        <View style={tw`flex-1 pr-2`}>
          <Text style={tw`text-xs font-black text-slate-800`}>Tip Delivery Partner</Text>
          <Text style={tw`text-[9px] font-medium text-slate-400 mt-0.5`}>
            {selectedTip > 0 ? `₹${selectedTip} tip added` : 'Optional • 100% goes to rider'}
          </Text>
        </View>

        <View style={tw`flex-row gap-1.5`}>
          {tipOptions.map((amount) => {
            const isSelected = selectedTip === amount;
            return (
              <TouchableOpacity
                key={amount}
                onPress={() => setSelectedTip(isSelected ? 0 : amount)}
                style={[
                  tw`px-2.5 py-1.2 rounded-xl border`,
                  isSelected
                    ? { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                    : tw`bg-slate-50 border-slate-200`,
                ]}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    tw`text-[10px] font-black`,
                    isSelected ? tw`text-white` : tw`text-slate-600`,
                  ]}
                >
                  +₹{amount}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};
