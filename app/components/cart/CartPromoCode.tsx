import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { Coupon, productService } from '../../services/product.service';
import { useCart } from '../../context/CartContext';
import tw from 'twrnc';

interface CartPromoCodeProps {
  coupons?: Coupon[];
  isLoadingCoupons?: boolean;
}

/**
 * Single Responsibility: Seamless promo code voucher strip with 1-tap coupon chips
 * and instant discount feedback without floating card frames.
 */
export const CartPromoCode: React.FC<CartPromoCodeProps> = ({
  coupons = [],
  isLoadingCoupons = false,
}) => {
  const { pricing, appliedCoupon, appliedDiscount, applyCoupon, removeCoupon, selectedStore, pincode } = useCart();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApplyCouponCode = async (codeToApply: string) => {
    const cleanCode = codeToApply.trim().toUpperCase();
    if (!cleanCode) return;

    setIsValidating(true);
    setErrorMessage(null);

    try {
      const result = await productService.validateCoupon(
        cleanCode,
        pricing.subtotal,
        selectedStore?.id,
        pincode
      );

      if (result.valid && result.coupon) {
        applyCoupon(result.coupon, result.discountAmount);
        setPromoCodeInput('');
        setErrorMessage(null);
      } else {
        setErrorMessage(result.error || 'Invalid or expired coupon code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to validate coupon.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <View style={tw`bg-white py-3.5 px-4`}>
      <View style={tw`flex-row items-center justify-between mb-2.5`}>
        <View style={tw`flex-row items-center gap-1.5`}>
          <Ionicons name="pricetag" size={15} color="#047857" />
          <Text style={tw`text-xs font-black text-slate-800 uppercase tracking-wider`}>
            Offers & Coupons
          </Text>
        </View>
        {coupons.length > 0 && !appliedCoupon && (
          <Text style={tw`text-[10px] font-bold text-emerald-700`}>
            {coupons.length} available
          </Text>
        )}
      </View>

      {/* ── Case 1: Coupon Applied ── */}
      {appliedCoupon ? (
        <View style={tw`p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex-row items-center justify-between`}>
          <View style={tw`flex-row items-center gap-2.5 flex-1 mr-2`}>
            <View style={tw`w-8 h-8 rounded-xl bg-emerald-600 items-center justify-center`}>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
            </View>
            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center gap-1.5`}>
                <Text style={tw`text-xs font-black text-emerald-950`}>{appliedCoupon.code}</Text>
                <View style={tw`px-1.5 py-0.2 rounded bg-emerald-200`}>
                  <Text style={tw`text-[8px] font-black text-emerald-900`}>APPLIED</Text>
                </View>
              </View>
              <Text style={tw`text-[10px] font-bold text-emerald-700 mt-0.5`}>
                Saved ₹{appliedDiscount.toFixed(0)} on this order
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={removeCoupon}
            style={tw`px-2.5 py-1 rounded-xl bg-white border border-rose-200`}
            activeOpacity={0.7}
          >
            <Text style={tw`text-[10px] font-black text-rose-600`}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── Case 2: Coupon Input Box + 1-Tap Chips ── */
        <View>
          <View style={tw`flex-row items-center bg-slate-50 rounded-2xl border border-slate-200 px-3 py-1`}>
            <TextInput
              value={promoCodeInput}
              onChangeText={(text) => {
                setPromoCodeInput(text);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Enter coupon code"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              style={tw`flex-1 text-xs font-bold text-slate-800 py-2`}
            />

            <TouchableOpacity
              onPress={() => handleApplyCouponCode(promoCodeInput)}
              disabled={!promoCodeInput.trim() || isValidating}
              activeOpacity={0.8}
              style={[
                tw`px-3.5 py-1.5 rounded-xl`,
                promoCodeInput.trim()
                  ? { backgroundColor: theme.colors.primary }
                  : tw`bg-slate-200`,
              ]}
            >
              {isValidating ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    tw`text-[10px] font-black uppercase tracking-wider`,
                    promoCodeInput.trim() ? tw`text-white` : tw`text-slate-400`,
                  ]}
                >
                  Apply
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Error notice */}
          {errorMessage && (
            <Text style={tw`text-[10px] font-bold text-rose-500 mt-1.5 ml-1`}>
              {errorMessage}
            </Text>
          )}

          {/* 1-Tap Coupon Quick Apply Chips */}
          {coupons.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={tw`gap-2 pt-2.5`}
            >
              {coupons.slice(0, 4).map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => handleApplyCouponCode(c.code)}
                  activeOpacity={0.8}
                  style={tw`px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex-row items-center gap-1.5`}
                >
                  <Text style={tw`text-[10px] font-black text-emerald-800`}>{c.code}</Text>
                  <Text style={tw`text-[9px] font-bold text-emerald-600`}>
                    • Save ₹{c.discountValue}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
};
