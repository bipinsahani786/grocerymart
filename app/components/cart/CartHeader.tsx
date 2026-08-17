import React from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CartHeaderProps {
  totalItems: number;
  onClear: () => void;
  onBack?: () => void;
}

/**
 * Single Responsibility: Top cart header with navigation, active item counter, and clear basket action.
 */
export const CartHeader: React.FC<CartHeaderProps> = ({ totalItems, onClear, onBack }) => {
  const confirmClear = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your basket?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: onClear },
      ]
    );
  };

  return (
    <View style={tw`pt-14 pb-4 px-5 bg-white border-b border-slate-100 flex-row justify-between items-center shadow-sm`}>
      <View style={tw`flex-row items-center gap-3`}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            style={tw`w-9 h-9 rounded-full bg-slate-50 border border-slate-100 justify-center items-center`}
          >
            <Ionicons name="arrow-back" size={19} color="#1E293B" />
          </TouchableOpacity>
        )}
        <View>
          <Text style={[tw`text-xl font-black tracking-tight`, { color: theme.colors.text }]}>
            My Basket
          </Text>
          <Text style={[tw`text-[11px] font-bold mt-0.5`, { color: theme.colors.textMuted }]}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </Text>
        </View>
      </View>

      {totalItems > 0 && (
        <TouchableOpacity
          onPress={confirmClear}
          style={tw`px-3 py-1.5 rounded-full bg-rose-50 border border-rose-100/80 flex-row items-center gap-1`}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={13} color="#E11D48" />
          <Text style={tw`text-[11px] font-bold text-rose-600`}>Clear</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
