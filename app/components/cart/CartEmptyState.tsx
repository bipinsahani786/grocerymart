import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CartEmptyStateProps {
  onShopMore?: () => void;
}

/**
 * Single Responsibility: High-fidelity empty basket state illustration and call to action.
 */
export const CartEmptyState: React.FC<CartEmptyStateProps> = ({ onShopMore }) => {
  return (
    <View style={tw`flex-1 items-center justify-center py-16 px-6`}>
      <View style={[tw`w-28 h-28 rounded-full items-center justify-center mb-5`, { backgroundColor: '#ECFDF5' }]}>
        <Text style={tw`text-[56px]`}>🛒</Text>
      </View>

      <Text style={[tw`text-2xl font-black text-center mb-1.5`, { color: theme.colors.text }]}>
        Your Basket is Hungry!
      </Text>

      <Text style={[tw`text-xs text-center font-medium px-8 mb-6`, { color: theme.colors.textMuted }]}>
        Fill it with farm-fresh organic vegetables, crisp fruits, daily bakery essentials, and drinks.
      </Text>

      {onShopMore && (
        <TouchableOpacity
          onPress={onShopMore}
          activeOpacity={0.8}
          style={[
            tw`px-8 py-4 rounded-full flex-row items-center gap-2 shadow-md`,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Ionicons name="leaf-outline" size={17} color="#FFFFFF" />
          <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
            Explore Fresh Groceries
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
