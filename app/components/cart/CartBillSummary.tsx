import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import { PricingSummary } from '../../utils/pricing';
import tw from 'twrnc';

interface CartBillSummaryProps {
  pricing: PricingSummary;
  discount?: number;
}

/**
 * Single Responsibility: Transparent bill details breakdown, taxes, and total savings highlight
 * dynamically formatted for Delivery vs Store Pickup modes.
 */
export const CartBillSummary: React.FC<CartBillSummaryProps> = ({
  pricing,
  discount = 35,
}) => {
  const { fulfillmentMode } = useCart();
  const deliverySaved = fulfillmentMode === 'pickup' ? 30 : (pricing.deliveryFee === 0 ? 30 : 0);
  const totalSaved = discount + deliverySaved;

  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 px-5`}>
        Bill Details
      </Text>

      <View style={tw`p-4 rounded-3xl bg-white border border-slate-100 shadow-sm`}>
        {/* Item Total */}
        <View style={tw`flex-row justify-between mb-2`}>
          <Text style={tw`text-xs font-medium text-slate-500`}>Item Total</Text>
          <Text style={tw`text-xs font-bold text-slate-800`}>₹{pricing.subtotal.toFixed(0)}</Text>
        </View>

        {/* Promo Discount */}
        {discount > 0 && (
          <View style={tw`flex-row justify-between mb-2`}>
            <Text style={tw`text-xs font-medium text-emerald-700`}>Organic Discount (ORGANIC10)</Text>
            <Text style={tw`text-xs font-bold text-emerald-700`}>-₹{discount.toFixed(0)}</Text>
          </View>
        )}

        {/* Delivery Fee */}
        <View style={tw`flex-row justify-between mb-2`}>
          <Text style={tw`text-xs font-medium text-slate-500`}>
            {fulfillmentMode === 'pickup' ? 'Delivery Charges (Self-Pickup)' : 'Delivery Partner Fee'}
          </Text>
          <Text style={[tw`text-xs font-bold`, (fulfillmentMode === 'pickup' || pricing.deliveryFee === 0) ? tw`text-emerald-600` : tw`text-slate-800`]}>
            {fulfillmentMode === 'pickup' ? '₹0 (FREE)' : (pricing.deliveryFee === 0 ? 'FREE' : `₹${pricing.deliveryFee.toFixed(0)}`)}
          </Text>
        </View>

        {/* Taxes & GST */}
        <View style={tw`flex-row justify-between mb-3`}>
          <Text style={tw`text-xs font-medium text-slate-500`}>Taxes & GST (5%)</Text>
          <Text style={tw`text-xs font-bold text-slate-800`}>₹{pricing.tax.toFixed(0)}</Text>
        </View>

        {/* Divider */}
        <View style={tw`h-px bg-slate-100 my-1`} />

        {/* Grand Total */}
        <View style={tw`flex-row justify-between items-center mt-2.5`}>
          <View>
            <Text style={tw`text-sm font-black text-slate-900`}>To Pay</Text>
            <Text style={tw`text-[10px] font-semibold text-slate-400`}>Inclusive of all taxes</Text>
          </View>
          <Text style={[tw`text-lg font-black`, { color: theme.colors.primary }]}>
            ₹{Math.max(0, pricing.grandTotal - discount).toFixed(0)}
          </Text>
        </View>

        {/* Savings Badge */}
        {totalSaved > 0 && (
          <View style={tw`mt-3 p-2 rounded-xl bg-emerald-50 border border-emerald-100 flex-row items-center justify-center gap-1.5`}>
            <Ionicons name="sparkles" size={13} color="#059669" />
            <Text style={tw`text-[11px] font-black text-emerald-800`}>
              Yay! You saved ₹{totalSaved.toFixed(0)} on this order
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
