import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CartCheckoutFooterProps {
  grandTotal: number;
  totalItems: number;
  onCheckout: () => void;
}

/**
 * Single Responsibility: Fixed checkout bar with grand total preview, fulfillment location summary, and mode-adapted CTA.
 */
export const CartCheckoutFooter: React.FC<CartCheckoutFooterProps> = ({
  grandTotal,
  totalItems,
  onCheckout,
}) => {
  const { fulfillmentMode, selectedStore, selectedAddress, pincode } = useCart();

  return (
    <View style={[
      tw`absolute left-4 right-4 bg-white rounded-3xl border border-slate-100 shadow-lg z-40 p-4`,
      { bottom: 104 }
    ]}>
      {/* Address & Payment Method Row */}
      <View style={tw`flex-row items-center justify-between pb-3 mb-3 border-b border-slate-100`}>
        <View style={tw`flex-row items-center gap-2 flex-1 mr-2`}>
          <Ionicons
            name={fulfillmentMode === 'delivery' ? 'bicycle-outline' : 'storefront-outline'}
            size={16}
            color={theme.colors.primary}
          />
          <Text style={tw`text-[11px] font-bold text-slate-700`} numberOfLines={1}>
            {fulfillmentMode === 'delivery' ? (
              <>Delivering to <Text style={tw`font-extrabold text-slate-900`}>{selectedAddress || (pincode ? `PIN: ${pincode}` : 'Location not set')}</Text></>
            ) : (
              <>Pickup at <Text style={tw`font-extrabold text-slate-900`}>{selectedStore?.name || 'Nearest Outlet'}</Text></>
            )}
          </Text>
        </View>
        <View style={tw`flex-row items-center gap-1`}>
          <Text style={tw`text-[10px] font-bold text-slate-400`}>UPI / Card</Text>
          <Ionicons name="chevron-forward" size={12} color="#94A3B8" />
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={onCheckout}
        activeOpacity={0.85}
        style={[
          tw`w-full py-4 rounded-2xl flex-row items-center justify-between px-5 shadow-md`,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <View>
          <Text style={tw`text-[10px] uppercase font-black text-white/80 tracking-wider`}>
            {totalItems} {totalItems === 1 ? 'item' : 'items'} • To Pay
          </Text>
          <Text style={tw`text-lg font-black text-white`}>
            ₹{grandTotal.toFixed(0)}
          </Text>
        </View>

        <View style={tw`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20`}>
          <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>
            {fulfillmentMode === 'delivery' ? 'Place Order' : 'Confirm Pickup'}
          </Text>
          <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    </View>
  );
};
