import React from 'react';
import { Text, View, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CartCheckoutFooterProps {
  grandTotal: number;
  totalItems: number;
  onCheckout: () => void;
}

/**
 * Single Responsibility: Floating elevated checkout bar positioned cleanly above
 * the curved bottom navigation bar with dynamic safe area insets.
 */
export const CartCheckoutFooter: React.FC<CartCheckoutFooterProps> = ({
  grandTotal,
  totalItems,
  onCheckout,
}) => {
  const insets = useSafeAreaInsets();
  const { fulfillmentMode, selectedStore, selectedAddress, pincode, pricing } = useCart();
  const bottomOffset = Math.max(insets.bottom, 12) + 90;

  const isPickup = fulfillmentMode === 'pickup';
  const deliveryText = isPickup
    ? 'FREE Pickup'
    : pricing.deliveryFee === 0
    ? 'FREE Delivery'
    : `+₹${pricing.deliveryFee.toFixed(0)} Delivery`;

  return (
    <View
      style={[
        tw`absolute left-3 right-3 bg-white rounded-3xl border border-slate-200/90 z-40 p-3.5`,
        Platform.OS === 'ios'
          ? {
              shadowColor: '#0F172A',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
            }
          : { elevation: 5 },
        { bottom: bottomOffset },
      ]}
    >
      {/* Address & Payment Method Row */}
      <View style={tw`flex-row items-center justify-between pb-2 mb-2 border-b border-slate-100`}>
        <View style={tw`flex-row items-center gap-1.5 flex-1 mr-2`}>
          <Ionicons
            name={isPickup ? 'storefront-outline' : 'bicycle-outline'}
            size={14}
            color="#059669"
          />
          <Text style={tw`text-[11px] font-bold text-slate-700`} numberOfLines={1}>
            {isPickup ? (
              <>Pickup at <Text style={tw`font-black text-slate-900`}>{selectedStore?.name || 'Nearest Outlet'}</Text></>
            ) : (
              <>Deliver to <Text style={tw`font-black text-slate-900`}>{selectedAddress || (pincode ? `PIN: ${pincode}` : 'Location not set')}</Text></>
            )}
          </Text>
        </View>

        <View
          style={[
            tw`px-2 py-0.5 rounded-full border`,
            isPickup || pricing.deliveryFee === 0
              ? tw`bg-emerald-50 border-emerald-200`
              : tw`bg-slate-100 border-slate-200`,
          ]}
        >
          <Text
            style={[
              tw`text-[9px] font-black uppercase tracking-wider`,
              isPickup || pricing.deliveryFee === 0 ? tw`text-emerald-800` : tw`text-slate-600`,
            ]}
          >
            {deliveryText}
          </Text>
        </View>
      </View>

      {/* Action Button with Price & Delivery Breakdown */}
      <TouchableOpacity
        onPress={onCheckout}
        activeOpacity={0.88}
        style={[
          tw`w-full py-3.2 rounded-2xl flex-row items-center justify-between px-4`,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <View>
          <View style={tw`flex-row items-center gap-1.5`}>
            <Text style={tw`text-[10px] uppercase font-black text-white/80 tracking-wider`}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </Text>
            <View style={tw`w-1 h-1 rounded-full bg-white/50`} />
            <Text style={tw`text-[10px] font-black text-emerald-200`}>
              {deliveryText}
            </Text>
          </View>
          <Text style={tw`text-lg font-black text-white leading-tight mt-0.5`}>
            ₹{grandTotal.toFixed(0)}
          </Text>
        </View>

        <View style={tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20`}>
          <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
            {isPickup ? 'Confirm Pickup' : 'Proceed'}
          </Text>
          <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
};
