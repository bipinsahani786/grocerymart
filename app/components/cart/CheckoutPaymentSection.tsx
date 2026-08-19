import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StoreLocation, useCart } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CheckoutPaymentSectionProps {
  fulfillmentMode: 'delivery' | 'pickup';
  selectedAddress: string;
  selectedStore: StoreLocation | null;
  selectedPayment: 'cod' | 'wallet' | 'upi' | 'card';
  setSelectedPayment: (pay: 'cod' | 'wallet' | 'upi' | 'card') => void;
  totalAmount: number;
  onPlaceOrder: () => void;
}

export const CheckoutPaymentSection: React.FC<CheckoutPaymentSectionProps> = ({
  fulfillmentMode,
  selectedAddress,
  selectedStore,
  selectedPayment,
  setSelectedPayment,
  totalAmount,
  onPlaceOrder,
}) => {
  const insets = useSafeAreaInsets();
  const { pricing } = useCart();
  const bottomOffset = Math.max(insets.bottom, 10) + 88;

  const isPickup = fulfillmentMode === 'pickup';
  const deliveryText = isPickup
    ? 'FREE Pickup'
    : pricing.deliveryFee === 0
    ? 'FREE Delivery'
    : `+₹${pricing.deliveryFee.toFixed(0)} Delivery`;

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[tw`p-5`, { paddingBottom: 190 }]}>
        {/* Order Summary banner */}
        <View style={tw`bg-white p-4 rounded-2xl border border-slate-200/80 mb-5`}>
          <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5`}>
            {fulfillmentMode === 'delivery' ? '🛵 Delivering To' : '🏬 Pickup Store Location'}
          </Text>
          <Text style={tw`text-xs font-black text-slate-800`} numberOfLines={2}>
            {fulfillmentMode === 'delivery'
              ? selectedAddress || 'Delivery Address'
              : `${selectedStore?.name || 'Selected Outlet'} - ${selectedStore?.address || 'Pickup Counter'}`}
          </Text>
        </View>

        {/* Payment list */}
        <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-3`}>
          Select Payment Method
        </Text>

        {/* 1. Cash on Delivery */}
        <TouchableOpacity
          onPress={() => setSelectedPayment('cod')}
          activeOpacity={0.88}
          style={[
            tw`bg-white p-4 rounded-2xl border mb-3 flex-row items-center justify-between`,
            selectedPayment === 'cod' ? tw`border-emerald-600 bg-emerald-50/20` : tw`border-slate-200/80`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3.5 flex-1 pr-3`}>
            <View style={[tw`w-10 h-10 rounded-xl items-center justify-center`, selectedPayment === 'cod' ? tw`bg-emerald-100` : tw`bg-slate-100`]}>
              <Ionicons name="cash-outline" size={20} color={selectedPayment === 'cod' ? '#059669' : '#64748B'} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-black text-slate-900`}>
                {fulfillmentMode === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Counter'}
              </Text>
              <Text style={tw`text-[11px] text-slate-500 font-medium mt-0.5`}>Pay when your order arrives</Text>
            </View>
          </View>
          <Ionicons
            name={selectedPayment === 'cod' ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={selectedPayment === 'cod' ? '#059669' : '#CBD5E1'}
          />
        </TouchableOpacity>

        {/* 2. Wallet Balance */}
        <TouchableOpacity
          onPress={() => setSelectedPayment('wallet')}
          activeOpacity={0.88}
          style={[
            tw`bg-white p-4 rounded-2xl border mb-3 flex-row items-center justify-between`,
            selectedPayment === 'wallet' ? tw`border-emerald-600 bg-emerald-50/20` : tw`border-slate-200/80`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3.5 flex-1 pr-3`}>
            <View style={[tw`w-10 h-10 rounded-xl items-center justify-center`, selectedPayment === 'wallet' ? tw`bg-emerald-100` : tw`bg-slate-100`]}>
              <Ionicons name="wallet-outline" size={20} color={selectedPayment === 'wallet' ? '#059669' : '#64748B'} />
            </View>
            <View style={tw`flex-1`}>
              <View style={tw`flex-row items-center gap-1.5`}>
                <Text style={tw`text-xs font-black text-slate-900`}>GroceryMart Wallet</Text>
                <View style={tw`bg-emerald-100 px-1.5 py-0.5 rounded`}>
                  <Text style={tw`text-[8px] font-black text-emerald-800 uppercase`}>Active</Text>
                </View>
              </View>
              <Text style={tw`text-[11px] text-slate-500 font-medium mt-0.5`}>Available: ₹500.00</Text>
            </View>
          </View>
          <Ionicons
            name={selectedPayment === 'wallet' ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={selectedPayment === 'wallet' ? '#059669' : '#CBD5E1'}
          />
        </TouchableOpacity>

        {/* 3. UPI / Mobile Apps */}
        <TouchableOpacity
          onPress={() => setSelectedPayment('upi')}
          activeOpacity={0.88}
          style={[
            tw`bg-white p-4 rounded-2xl border mb-3 flex-row items-center justify-between`,
            selectedPayment === 'upi' ? tw`border-emerald-600 bg-emerald-50/20` : tw`border-slate-200/80`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3.5 flex-1 pr-3`}>
            <View style={[tw`w-10 h-10 rounded-xl items-center justify-center`, selectedPayment === 'upi' ? tw`bg-emerald-100` : tw`bg-slate-100`]}>
              <Ionicons name="phone-portrait-outline" size={20} color={selectedPayment === 'upi' ? '#059669' : '#64748B'} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-black text-slate-900`}>UPI (Google Pay / PhonePe / Paytm)</Text>
              <Text style={tw`text-[11px] text-slate-500 font-medium mt-0.5`}>Fast instant UPI payment</Text>
            </View>
          </View>
          <Ionicons
            name={selectedPayment === 'upi' ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={selectedPayment === 'upi' ? '#059669' : '#CBD5E1'}
          />
        </TouchableOpacity>

        {/* 4. Cards */}
        <TouchableOpacity
          onPress={() => setSelectedPayment('card')}
          activeOpacity={0.88}
          style={[
            tw`bg-white p-4 rounded-2xl border mb-3 flex-row items-center justify-between`,
            selectedPayment === 'card' ? tw`border-emerald-600 bg-emerald-50/20` : tw`border-slate-200/80`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3.5 flex-1 pr-3`}>
            <View style={[tw`w-10 h-10 rounded-xl items-center justify-center`, selectedPayment === 'card' ? tw`bg-emerald-100` : tw`bg-slate-100`]}>
              <Ionicons name="card-outline" size={20} color={selectedPayment === 'card' ? '#059669' : '#64748B'} />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-xs font-black text-slate-900`}>Credit / Debit Card</Text>
              <Text style={tw`text-[11px] text-slate-500 font-medium mt-0.5`}>Visa, Mastercard, RuPay</Text>
            </View>
          </View>
          <Ionicons
            name={selectedPayment === 'card' ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={selectedPayment === 'card' ? '#059669' : '#CBD5E1'}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Place Order action bar (Positioned above bottom navbar) */}
      <View
        style={[
          tw`absolute left-3 right-3 bg-white rounded-3xl border border-slate-200/90 p-3.5 px-4.5 flex-row justify-between items-center z-40`,
          Platform.OS === 'ios'
            ? {
                shadowColor: '#0F172A',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 10,
              }
            : { elevation: 4 },
          { bottom: bottomOffset },
        ]}
      >
        <View style={tw`flex-1 mr-3`}>
          <Text style={tw`text-[10px] font-bold text-slate-400 uppercase tracking-wider`} numberOfLines={1}>
            Amount to Pay • {deliveryText}
          </Text>
          <Text style={tw`text-lg font-black text-slate-900`}>₹{totalAmount.toFixed(0)}</Text>
        </View>
        <TouchableOpacity
          onPress={onPlaceOrder}
          activeOpacity={0.88}
          style={[tw`px-6 py-3.5 rounded-2xl flex-row items-center gap-1.5`, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>Place Order</Text>
          <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
