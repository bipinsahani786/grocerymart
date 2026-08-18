import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CartDeliveryBannerProps {
  subtotal: number;
  onChangeLocation?: () => void;
}

/**
 * Single Responsibility: Domino's style Delivery vs Store Pickup switcher,
 * ETA status, and threshold meter.
 */
export const CartDeliveryBanner: React.FC<CartDeliveryBannerProps> = ({ subtotal, onChangeLocation }) => {
  const { fulfillmentMode, setFulfillmentMode, selectedStore, selectedAddress } = useCart();
  const freeThreshold = 299.0;
  const amountLeft = Math.max(0, freeThreshold - subtotal);
  const progress = Math.min(1, subtotal / freeThreshold);

  return (
    <View style={tw`mb-4`}>
      {/* ── Domino's Style Fulfillment Mode Segmented Switcher ── */}
      <View style={tw`flex-row bg-slate-200/70 p-1 rounded-2xl mb-3 border border-slate-200/80`}>
        <TouchableOpacity
          onPress={() => setFulfillmentMode('delivery')}
          activeOpacity={0.8}
          style={[
            tw`flex-1 py-2 rounded-xl flex-row items-center justify-center gap-1.5`,
            fulfillmentMode === 'delivery'
              ? tw`bg-white shadow-sm`
              : tw`bg-transparent`,
          ]}
        >
          <Ionicons
            name="bicycle"
            size={16}
            color={fulfillmentMode === 'delivery' ? '#047857' : '#64748B'}
          />
          <Text
            style={[
              tw`text-[11px] font-black uppercase tracking-wider`,
              fulfillmentMode === 'delivery' ? tw`text-emerald-800` : tw`text-slate-500`,
            ]}
          >
            Home Delivery
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setFulfillmentMode('pickup')}
          activeOpacity={0.8}
          style={[
            tw`flex-1 py-2 rounded-xl flex-row items-center justify-center gap-1.5`,
            fulfillmentMode === 'pickup'
              ? tw`bg-white shadow-sm`
              : tw`bg-transparent`,
          ]}
        >
          <Ionicons
            name="storefront"
            size={16}
            color={fulfillmentMode === 'pickup' ? '#047857' : '#64748B'}
          />
          <Text
            style={[
              tw`text-[11px] font-black uppercase tracking-wider`,
              fulfillmentMode === 'pickup' ? tw`text-emerald-800` : tw`text-slate-500`,
            ]}
          >
            Store Pickup (₹0)
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Location / Store Preview Card ── */}
      <View style={tw`p-3.5 rounded-3xl bg-white border border-slate-100 shadow-sm mb-2.5 flex-row items-center justify-between`}>
        <View style={tw`flex-row items-center gap-2.5 flex-1 mr-2`}>
          <View
            style={[
              tw`w-10 h-10 rounded-2xl items-center justify-center`,
              { backgroundColor: fulfillmentMode === 'delivery' ? '#ECFDF5' : '#EFF6FF' },
            ]}
          >
            <Ionicons
              name={fulfillmentMode === 'delivery' ? 'flash' : 'storefront'}
              size={18}
              color={fulfillmentMode === 'delivery' ? '#059669' : '#2563EB'}
            />
          </View>
          <View style={tw`flex-1`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <Text style={tw`text-xs font-black text-slate-800`}>
                {fulfillmentMode === 'delivery' ? '12-15 Mins Express Delivery' : 'Ready in 10 Mins (Takeaway)'}
              </Text>
              <View style={[tw`w-2 h-2 rounded-full`, fulfillmentMode === 'delivery' ? tw`bg-emerald-500` : tw`bg-blue-500`]} />
            </View>
            <Text style={tw`text-[10px] font-medium text-slate-400 mt-0.5`} numberOfLines={1}>
              {fulfillmentMode === 'delivery' ? (
                <>Deliver to: <Text style={tw`font-bold text-slate-600`}>{selectedAddress || 'Delivery Address'}</Text></>
              ) : (
                <>Pickup at: <Text style={tw`font-bold text-slate-600`}>{selectedStore?.name || 'Nearest Outlet'}</Text></>
              )}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={onChangeLocation}
          activeOpacity={0.7}
          style={tw`px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-100`}
        >
          <Text style={[tw`text-[10px] font-black uppercase tracking-wider`, { color: theme.colors.primary }]}>
            Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Free Delivery Threshold (Only for Delivery) ── */}
      {fulfillmentMode === 'delivery' ? (
        <View style={tw`p-3 rounded-2xl bg-emerald-50/80 border border-emerald-100`}>
          <View style={tw`flex-row items-center justify-between mb-1.5`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <Text style={tw`text-xs`}>
                {amountLeft === 0 ? '🎉' : '🚚'}
              </Text>
              <Text style={tw`text-[11px] font-black text-emerald-900`}>
                {amountLeft === 0
                  ? 'Free Express Delivery Unlocked!'
                  : `Add ₹${amountLeft.toFixed(0)} more for FREE Delivery`}
              </Text>
            </View>
            <Text style={tw`text-[10px] font-bold text-emerald-700`}>
              {Math.round(progress * 100)}%
            </Text>
          </View>

          {/* Progress Bar Track */}
          <View style={tw`w-full h-1.5 bg-emerald-200/60 rounded-full overflow-hidden`}>
            <View
              style={[
                tw`h-full rounded-full`,
                {
                  width: `${Math.round(progress * 100)}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </View>
      ) : (
        <View style={tw`p-2.5 rounded-2xl bg-blue-50/80 border border-blue-100 flex-row items-center gap-2`}>
          <Ionicons name="bag-check-outline" size={16} color="#2563EB" />
          <Text style={tw`text-[11px] font-bold text-blue-900 flex-1`}>
            Store pickup is 100% Free • Collect directly at the express counter
          </Text>
        </View>
      )}
    </View>
  );
};
