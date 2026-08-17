import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StoreLocation } from '../../context/CartContext';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CheckoutPaymentSectionProps {
  fulfillmentMode: 'delivery' | 'pickup';
  selectedAddress: 'home' | 'office';
  selectedStore: StoreLocation;
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
  return (
    <View style={tw`flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`p-5 pb-28`}>
        {/* Order Summary banner */}
        <View style={tw`bg-white p-4.5 rounded-3xl border border-slate-100 shadow-2xs mb-5`}>
          <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-2`}>📍 Order Summary</Text>
          <Text style={tw`text-sm font-black text-slate-800`}>
            {fulfillmentMode === 'delivery' ? '🛵 Fast delivery to:' : '🏬 Takeaway counter pickup:'}
          </Text>
          <Text style={tw`text-xs text-slate-500 font-bold mt-1`} numberOfLines={1}>
            {fulfillmentMode === 'delivery'
              ? selectedAddress === 'home'
                ? 'Home (123 Main Street, New York, NY)'
                : 'Office (55 Wall Street, New York, NY)'
              : `${selectedStore.name} - ${selectedStore.address}`}
          </Text>
        </View>

        {/* Payment list */}
        <Text style={tw`text-sm font-black text-slate-800 mb-4`}>💳 Select Payment Method</Text>

        {/* 1. Cash on Delivery */}
        <TouchableOpacity
          onPress={() => setSelectedPayment('cod')}
          activeOpacity={0.9}
          style={[
            tw`bg-white p-4.5 rounded-3xl border mb-3 flex-row items-center justify-between shadow-2xs`,
            selectedPayment === 'cod' ? tw`border-emerald-600 bg-emerald-50/10` : tw`border-slate-100`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3.5`}>
            <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
              <Ionicons name="cash-outline" size={20} color="#059669" />
            </View>
            <View>
              <Text style={tw`text-sm font-black text-slate-800`}>
                {fulfillmentMode === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Counter'}
              </Text>
              <Text style={tw`text-xs text-slate-400 font-bold mt-1`}>No extra convenience fees</Text>
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
          activeOpacity={0.9}
          style={[
            tw`bg-white p-4.5 rounded-3xl border mb-3 flex-row items-center justify-between shadow-2xs`,
            selectedPayment === 'wallet' ? tw`border-emerald-600 bg-emerald-50/10` : tw`border-slate-100`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3.5`}>
            <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
              <Ionicons name="wallet-outline" size={20} color="#059669" />
            </View>
            <View>
              <View style={tw`flex-row items-center gap-2`}>
                <Text style={tw`text-sm font-black text-slate-800`}>GroceryMart Wallet</Text>
                <Text style={tw`text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded`}>
                  Active
                </Text>
              </View>
              <Text style={tw`text-xs text-slate-400 font-bold mt-1`}>Available Balance: ₹500.00</Text>
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
          activeOpacity={0.9}
          style={[
            tw`bg-white p-4.5 rounded-3xl border mb-3 flex-row items-center justify-between shadow-2xs`,
            selectedPayment === 'upi' ? tw`border-emerald-600 bg-emerald-50/10` : tw`border-slate-100`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3.5`}>
            <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
              <Ionicons name="phone-portrait-outline" size={20} color="#059669" />
            </View>
            <View>
              <Text style={tw`text-sm font-black text-slate-800`}>UPI Pay (Google Pay / PhonePe)</Text>
              <Text style={tw`text-xs text-slate-400 font-bold mt-1`}>Secure payment via bank account</Text>
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
          activeOpacity={0.9}
          style={[
            tw`bg-white p-4.5 rounded-3xl border mb-3 flex-row items-center justify-between shadow-2xs`,
            selectedPayment === 'card' ? tw`border-emerald-600 bg-emerald-50/10` : tw`border-slate-100`,
          ]}
        >
          <View style={tw`flex-row items-center gap-3.5`}>
            <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
              <Ionicons name="card-outline" size={20} color="#059669" />
            </View>
            <View>
              <Text style={tw`text-sm font-black text-slate-800`}>Credit / Debit Card</Text>
              <Text style={tw`text-xs text-slate-400 font-bold mt-1`}>Visa, Mastercard, RuPay, Amex</Text>
            </View>
          </View>
          <Ionicons
            name={selectedPayment === 'card' ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={selectedPayment === 'card' ? '#059669' : '#CBD5E1'}
          />
        </TouchableOpacity>
      </ScrollView>

      {/* Footer Place Order action bar */}
      <View style={[tw`absolute left-0 right-0 bg-white border-t border-slate-100/80 px-6 py-4.5 flex-row justify-between items-center shadow-lg`, { bottom: 84 }]}>
        <View>
          <Text style={tw`text-xs font-bold text-slate-400`}>Amount to Pay</Text>
          <Text style={tw`text-xl font-black text-slate-800`}>₹{totalAmount}</Text>
        </View>
        <TouchableOpacity
          onPress={onPlaceOrder}
          activeOpacity={0.85}
          style={[tw`px-10 py-3.5 rounded-full flex-row items-center gap-1.5 shadow-md`, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>Place Order</Text>
          <Ionicons name="checkmark-circle" size={14} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
