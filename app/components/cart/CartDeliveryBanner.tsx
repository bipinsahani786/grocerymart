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
 * Single Responsibility: Unified top fulfillment mode switcher, destination address/store preview,
 * and live free delivery threshold progress indicator without bulky nested cards.
 */
export const CartDeliveryBanner: React.FC<CartDeliveryBannerProps> = ({ subtotal, onChangeLocation }) => {
  const { fulfillmentMode, setFulfillmentMode, selectedStore, selectedAddress, deliveryConfig, pricing } = useCart();
  const freeThreshold = deliveryConfig.freeDeliveryThreshold || 299.0;
  const freeKm = deliveryConfig.freeDeliveryKmRadius || 0;
  const amountLeft = Math.max(0, freeThreshold - subtotal);
  const progress = Math.min(1, subtotal / freeThreshold);

  return (
    <View style={tw`bg-white border-b border-slate-100`}>
      {/* ── 1. Segmented Fulfillment Toggle (Home Delivery vs Store Pickup) ── */}
      <View style={tw`px-4 pt-3 pb-2`}>
        <View style={tw`flex-row bg-slate-100 p-1 rounded-2xl`}>
          <TouchableOpacity
            onPress={() => setFulfillmentMode('delivery')}
            activeOpacity={0.8}
            style={[
              tw`flex-1 py-2.2 rounded-xl flex-row items-center justify-center gap-1.5`,
              fulfillmentMode === 'delivery' ? tw`bg-white shadow-sm` : tw`bg-transparent`,
            ]}
          >
            <Ionicons
              name="flash"
              size={14}
              color={fulfillmentMode === 'delivery' ? '#047857' : '#64748B'}
            />
            <Text
              style={[
                tw`text-xs font-black tracking-tight`,
                fulfillmentMode === 'delivery' ? tw`text-emerald-800` : tw`text-slate-500`,
              ]}
            >
              Delivery in 10-15m
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFulfillmentMode('pickup')}
            activeOpacity={0.8}
            style={[
              tw`flex-1 py-2.2 rounded-xl flex-row items-center justify-center gap-1.5`,
              fulfillmentMode === 'pickup' ? tw`bg-white shadow-sm` : tw`bg-transparent`,
            ]}
          >
            <Ionicons
              name="storefront"
              size={14}
              color={fulfillmentMode === 'pickup' ? '#047857' : '#64748B'}
            />
            <Text
              style={[
                tw`text-xs font-black tracking-tight`,
                fulfillmentMode === 'pickup' ? tw`text-emerald-800` : tw`text-slate-500`,
              ]}
            >
              Pickup at Outlet (₹0)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 2. Destination / Store Quick Info Bar ── */}
      <View style={tw`px-4 py-2.5 flex-row items-center justify-between bg-slate-50/70 border-t border-slate-100/80`}>
        <View style={tw`flex-row items-center gap-2 flex-1 mr-2`}>
          <Ionicons
            name={fulfillmentMode === 'delivery' ? 'location-sharp' : 'business-sharp'}
            size={16}
            color="#047857"
          />
          <View style={tw`flex-1`}>
            <Text style={tw`text-[11px] font-black text-slate-800`} numberOfLines={1}>
              {fulfillmentMode === 'delivery'
                ? selectedAddress || 'Delivering to your current location'
                : selectedStore?.name || 'Selected Pickup Outlet'}
            </Text>
            <Text style={tw`text-[10px] font-medium text-slate-400`} numberOfLines={1}>
              {fulfillmentMode === 'delivery'
                ? 'Standard home delivery'
                : selectedStore?.address || 'Ready in 10 mins'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={onChangeLocation}
          activeOpacity={0.7}
          style={tw`px-3 py-1 rounded-full bg-white border border-emerald-200`}
        >
          <Text style={tw`text-[10px] font-black text-emerald-700 uppercase tracking-wider`}>
            Change
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── 3. Free Delivery Status Meter ── */}
      {fulfillmentMode === 'delivery' ? (
        <View style={tw`px-4 py-2.5 bg-emerald-50/60 border-t border-emerald-100/70`}>
          <View style={tw`flex-row items-center justify-between mb-1.5`}>
            <View style={tw`flex-row items-center gap-1.5 flex-1 mr-2`}>
              <Text style={tw`text-xs`}>{pricing.isFreeDelivery ? '🎉' : '🚚'}</Text>
              <Text style={tw`text-[11px] font-black text-emerald-900`} numberOfLines={1}>
                {pricing.isFreeDelivery
                  ? freeKm > 0
                    ? `Free Delivery within ${freeKm} km radius!`
                    : 'Free Express Delivery Unlocked!'
                  : freeKm > 0
                  ? `Free delivery within ${freeKm} km or on orders above ₹${freeThreshold}`
                  : `Add ₹${amountLeft.toFixed(0)} more for FREE Delivery`}
              </Text>
            </View>
            <Text style={tw`text-[10px] font-bold text-emerald-700`}>
              {pricing.isFreeDelivery ? 'FREE' : `${Math.round(progress * 100)}%`}
            </Text>
          </View>

          <View style={tw`w-full h-1.5 bg-emerald-200/50 rounded-full overflow-hidden`}>
            <View
              style={[
                tw`h-full rounded-full`,
                {
                  width: pricing.isFreeDelivery ? '100%' : `${Math.round(progress * 100)}%`,
                  backgroundColor: theme.colors.primary,
                },
              ]}
            />
          </View>
        </View>
      ) : (
        <View style={tw`px-4 py-2 bg-blue-50/60 border-t border-blue-100/70 flex-row items-center gap-2`}>
          <Ionicons name="checkmark-circle" size={14} color="#2563EB" />
          <Text style={tw`text-[11px] font-bold text-blue-900 flex-1`}>
            100% Free Store Pickup • Collect at express takeaway counter
          </Text>
        </View>
      )}
    </View>
  );
};
