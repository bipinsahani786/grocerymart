import React from 'react';
import { Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { theme } from '../constants/theme';
import tw from 'twrnc';

export const CartFooter: React.FC = () => {
  const { totalItems, totalAmount, clearCart } = useCart();

  if (totalItems === 0) return null;

  const bottomSpacing = Platform.OS === 'ios' ? 'bottom-6' : 'bottom-4';

  return (
    <View
      style={[
        tw`absolute ${bottomSpacing} left-4 right-4 rounded-xl border px-4 py-3`,
        {
          backgroundColor: theme.colors.white,
          borderColor: theme.colors.border,
        },
        Platform.OS === 'android' ? { elevation: 6 } : {
          shadowColor: theme.colors.shadowDark,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }
      ]}
    >
      <View style={tw`flex-row justify-between items-center`}>
        {/* Left Side: Summary info */}
        <View style={tw`justify-center`}>
          <Text style={[tw`text-xs font-semibold`, { color: theme.colors.textLight }]}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in Cart
          </Text>
          <Text style={[tw`text-xl font-black`, { color: theme.colors.primaryDark }]}>
            ${totalAmount.toFixed(2)}
          </Text>
        </View>

        {/* Right Side: Action Button */}
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity
            style={[
              tw`w-11 h-11 rounded-lg justify-center items-center mr-2`,
              { backgroundColor: theme.colors.dangerLight }
            ]}
            onPress={clearCart}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              tw`flex-row px-5 h-11 rounded-lg justify-center items-center`,
              { backgroundColor: theme.colors.primary }
            ]}
            onPress={() => alert(`Ordering ${totalItems} items. Total: $${totalAmount.toFixed(2)}`)}
            activeOpacity={0.9}
          >
            <Text style={[tw`font-extrabold text-sm mr-1`, { color: theme.colors.white }]}>Place Order</Text>
            <Ionicons name="arrow-forward" size={16} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
