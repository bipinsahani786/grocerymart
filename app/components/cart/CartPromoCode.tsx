import React, { useState } from 'react';
import { Text, View, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CartPromoCodeProps {
  discountAmount: number;
  onApplyPromo: (code: string) => void;
}

/**
 * Single Responsibility: Promo code voucher input and applied coupon badge.
 */
export const CartPromoCode: React.FC<CartPromoCodeProps> = ({
  discountAmount = 3.5,
  onApplyPromo,
}) => {
  const [promoCode, setPromoCode] = useState('ORGANIC10');
  const [isApplied, setIsApplied] = useState(true);

  return (
    <View style={tw`mb-4`}>
      <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1`}>
        Offers & Coupons
      </Text>

      <View style={tw`p-3.5 rounded-3xl bg-white border border-slate-100 shadow-2xs`}>
        {isApplied ? (
          <View style={tw`flex-row items-center justify-between`}>
            <View style={tw`flex-row items-center gap-2.5`}>
              <View style={tw`w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center`}>
                <Ionicons name="pricetag" size={16} color="#059669" />
              </View>
              <View>
                <View style={tw`flex-row items-center gap-1.5`}>
                  <Text style={tw`text-xs font-black text-slate-800`}>{promoCode}</Text>
                  <View style={tw`px-1.5 py-0.2 rounded bg-emerald-100`}>
                    <Text style={tw`text-[9px] font-black text-emerald-800`}>APPLIED</Text>
                  </View>
                </View>
                <Text style={tw`text-[10px] font-medium text-emerald-700 mt-0.5`}>
                  Saved ₹{discountAmount.toFixed(0)} with 10% organic discount
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => setIsApplied(false)}>
              <Text style={tw`text-[11px] font-bold text-rose-600`}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={tw`flex-row items-center justify-between gap-2`}>
            <View style={tw`flex-row items-center flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100`}>
              <Ionicons name="pricetag-outline" size={16} color="#94A3B8" />
              <TextInput
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="Enter coupon code"
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
                style={tw`flex-1 ml-2 text-xs font-bold text-slate-800`}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                if (promoCode) {
                  setIsApplied(true);
                  onApplyPromo(promoCode);
                }
              }}
              style={[tw`px-4 py-2.5 rounded-xl`, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>Apply</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
