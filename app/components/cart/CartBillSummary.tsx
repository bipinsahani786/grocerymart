import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import { PricingSummary } from '../../utils/pricing';
import tw from 'twrnc';

interface CartBillSummaryProps {
  pricing: PricingSummary;
}

/**
 * Single Responsibility: Receipt-style transparent bill breakdown,
 * backend KM delivery fee status, dynamic taxes, and total savings.
 */
export const CartBillSummary: React.FC<CartBillSummaryProps> = ({ pricing }) => {
  const { fulfillmentMode, appliedCoupon, appliedDiscount, deliveryConfig } = useCart();

  const standardFee = deliveryConfig.standardDeliveryFee || deliveryConfig.minDeliveryCharge || 30;
  const isPickup = fulfillmentMode === 'pickup';
  const freeKm = deliveryConfig.freeDeliveryKmRadius || 0;
  const dist = deliveryConfig.distanceKm || 1.2;

  const deliverySaved =
    isPickup
      ? standardFee
      : pricing.deliveryFee === 0 && pricing.subtotal > 0
      ? standardFee
      : 0;

  const totalSaved = appliedDiscount + deliverySaved;

  return (
    <View style={tw`bg-white py-3.5 px-4`}>
      <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider mb-3`}>
        Bill Summary
      </Text>

      {/* Item Total */}
      <View style={tw`flex-row justify-between mb-2`}>
        <Text style={tw`text-xs font-medium text-slate-500`}>Item Total</Text>
        <Text style={tw`text-xs font-bold text-slate-800`}>₹{pricing.subtotal.toFixed(0)}</Text>
      </View>

      {/* Promo Discount */}
      {appliedDiscount > 0 && (
        <View style={tw`flex-row justify-between mb-2`}>
          <View style={tw`flex-row items-center gap-1.5`}>
            <Ionicons name="pricetag" size={12} color="#059669" />
            <Text style={tw`text-xs font-bold text-emerald-700`}>
              Coupon Discount {appliedCoupon?.code ? `(${appliedCoupon.code})` : ''}
            </Text>
          </View>
          <Text style={tw`text-xs font-black text-emerald-700`}>-₹{appliedDiscount.toFixed(0)}</Text>
        </View>
      )}

      {/* Delivery Fee */}
      <View style={tw`flex-row justify-between mb-2`}>
        <View style={tw`flex-1 mr-2`}>
          <Text style={tw`text-xs font-medium text-slate-500`}>
            {isPickup ? 'Delivery Charges (Self-Pickup)' : 'Delivery Partner Fee'}
          </Text>
          {!isPickup && (
            <Text style={tw`text-[9px] font-bold text-emerald-600 mt-0.5`} numberOfLines={1}>
              {pricing.deliveryRuleReason ||
                (pricing.deliveryFee === 0
                  ? freeKm > 0 && dist <= freeKm
                    ? `Free within ${freeKm} km radius (${dist} km)`
                    : `Free above ₹${deliveryConfig.freeDeliveryThreshold}`
                  : `Standard delivery charge`)}
            </Text>
          )}
        </View>
        <Text
          style={[
            tw`text-xs font-black`,
            isPickup || pricing.deliveryFee === 0
              ? tw`text-emerald-600`
              : tw`text-slate-800`,
          ]}
        >
          {isPickup
            ? '₹0 (FREE)'
            : pricing.deliveryFee === 0
            ? 'FREE'
            : `₹${pricing.deliveryFee.toFixed(0)}`}
        </Text>
      </View>

      {/* Taxes & GST */}
      <View style={tw`flex-row justify-between mb-2`}>
        <Text style={tw`text-xs font-medium text-slate-500`}>
          Taxes & GST ({deliveryConfig.taxRatePercent}%)
        </Text>
        <Text style={tw`text-xs font-bold text-slate-800`}>₹{pricing.tax.toFixed(0)}</Text>
      </View>

      {/* Rider Tip */}
      {pricing.tip > 0 && (
        <View style={tw`flex-row justify-between mb-2`}>
          <View style={tw`flex-row items-center gap-1.5`}>
            <Ionicons name="heart" size={12} color="#E11D48" />
            <Text style={tw`text-xs font-medium text-slate-600`}>Rider Tip</Text>
          </View>
          <Text style={tw`text-xs font-bold text-slate-800`}>₹{pricing.tip.toFixed(0)}</Text>
        </View>
      )}

      {/* Divider */}
      <View style={tw`h-px bg-slate-100 my-2`} />

      {/* Grand Total */}
      <View style={tw`flex-row justify-between items-center py-1`}>
        <View>
          <Text style={tw`text-sm font-black text-slate-900`}>Total Amount</Text>
          <Text style={tw`text-[10px] font-medium text-slate-400`}>
            {isPickup ? 'Takeaway pickup' : 'Inclusive of all taxes'}
          </Text>
        </View>
        <Text style={[tw`text-xl font-black`, { color: theme.colors.primary }]}>
          ₹{pricing.grandTotal.toFixed(0)}
        </Text>
      </View>

      {/* Total Savings Highlight Pill */}
      {totalSaved > 0 && (
        <View style={tw`mt-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200/80 flex-row items-center justify-center gap-1.5`}>
          <Ionicons name="sparkles" size={14} color="#059669" />
          <Text style={tw`text-xs font-black text-emerald-800`}>
            Yay! You saved ₹{totalSaved.toFixed(0)} on this order
          </Text>
        </View>
      )}
    </View>
  );
};
