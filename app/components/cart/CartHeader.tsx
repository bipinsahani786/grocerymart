import React from 'react';
import { Text, View, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CartHeaderProps {
  totalItems: number;
  onClear: () => void;
  onBack?: () => void;
}

/**
 * Single Responsibility: Theme-adapted top cart header with green background,
 * status bar insets, active item counter, and clear basket action.
 */
export const CartHeader: React.FC<CartHeaderProps> = ({ totalItems, onClear, onBack }) => {
  const insets = useSafeAreaInsets();

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
    <LinearGradient
      colors={['#064E3B', '#047857', '#059669']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        tw`pb-4.5 px-5 flex-row justify-between items-center`,
        { paddingTop: Math.max(insets.top, 14) + 8 },
      ]}
    >
      <View style={tw`flex-row items-center gap-3`}>
        {onBack && (
          <TouchableOpacity
            onPress={onBack}
            activeOpacity={0.8}
            style={tw`w-9 h-9 rounded-full bg-white/20 border border-white/20 justify-center items-center`}
          >
            <Ionicons name="arrow-back" size={19} color="#FFFFFF" />
          </TouchableOpacity>
        )}
        <View>
          <Text style={tw`text-xl font-black tracking-tight text-white`}>
            My Basket
          </Text>
          <Text style={tw`text-[11px] font-bold text-emerald-100 mt-0.5`}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
          </Text>
        </View>
      </View>

      {totalItems > 0 && (
        <TouchableOpacity
          onPress={confirmClear}
          style={tw`px-3 py-1.5 rounded-full bg-white/20 border border-white/30 flex-row items-center gap-1`}
          activeOpacity={0.75}
        >
          <Ionicons name="trash-outline" size={13} color="#FFFFFF" />
          <Text style={tw`text-[11px] font-black text-white uppercase tracking-wider`}>Clear</Text>
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
};
