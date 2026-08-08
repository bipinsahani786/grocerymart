import React from 'react';
import { Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import tw from 'twrnc';

export const CartFooter: React.FC = () => {
  const { totalItems, totalAmount, clearCart } = useCart();

  if (totalItems === 0) return null;

  const bottomSpacing = Platform.OS === 'ios' ? 'bottom-6' : 'bottom-4';

  return (
    <View
      style={[
        tw`absolute ${bottomSpacing} left-4 right-4 bg-white rounded-xl border border-gray-200 px-4 py-3`,
        Platform.OS === 'android' ? { elevation: 6 } : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }
      ]}
    >
      <View style={tw`flex-row justify-between items-center`}>
        {/* Left Side: Summary info */}
        <View style={tw`justify-center`}>
          <Text style={tw`text-xs text-gray-500 font-semibold`}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in Cart
          </Text>
          <Text style={tw`text-xl font-black text-emerald-700`}>${totalAmount.toFixed(2)}</Text>
        </View>

        {/* Right Side: Action Button */}
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity
            style={tw`w-11 h-11 rounded-lg bg-red-100 justify-center items-center mr-2`}
            onPress={clearCart}
            activeOpacity={0.7}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>

          <TouchableOpacity
            style={tw`flex-row bg-emerald-500 px-5 h-11 rounded-lg justify-center items-center`}
            onPress={() => alert(`Ordering ${totalItems} items. Total: $${totalAmount.toFixed(2)}`)}
            activeOpacity={0.9}
          >
            <Text style={tw`color-white font-extrabold text-sm mr-1`}>Place Order</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
