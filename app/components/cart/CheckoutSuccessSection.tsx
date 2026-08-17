import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface CheckoutSuccessSectionProps {
  orderId: string;
  finalSummary: {
    items: any[];
    pricing: any;
    fulfillmentMode: 'delivery' | 'pickup';
    selectedStore: any;
    address: string;
    paymentMethod: string;
    time: string;
  };
  onContinueShopping: () => void;
}

export const CheckoutSuccessSection: React.FC<CheckoutSuccessSectionProps> = ({
  orderId,
  finalSummary,
  onContinueShopping,
}) => {
  const pickupOTP = Math.floor(1000 + Math.random() * 9000);

  return (
    <View style={tw`flex-1`}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`p-5 pb-28`}>
        {/* Success Check Header */}
        <View style={tw`items-center py-6 bg-white rounded-3xl border border-slate-100 shadow-sm mb-5`}>
          <View style={tw`w-18 h-18 bg-emerald-50 rounded-full items-center justify-center mb-3 shadow-inner`}>
            <Ionicons name="checkmark-circle" size={54} color="#059669" />
          </View>
          <Text style={tw`text-xl font-black text-emerald-800`}>Woohoo! Order Placed</Text>
          <Text style={tw`text-xs font-bold text-slate-400 mt-1`}>
            Packed & {finalSummary.fulfillmentMode === 'delivery' ? 'delivering fresh' : 'ready for pickup'}
          </Text>

          {/* Copyable Order ID Badge */}
          <TouchableOpacity
            onPress={() => Clipboard.setString(orderId)}
            activeOpacity={0.7}
            style={tw`flex-row items-center bg-slate-50 border border-slate-100 rounded-full px-4 py-1.5 mt-4 gap-1`}
          >
            <Text style={tw`text-xs font-black text-slate-600`}>Order ID: {orderId}</Text>
            <Ionicons name="copy-outline" size={12} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Stepper Logistics Timeline */}
        <View style={tw`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-5`}>
          <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-4`}>📦 Order Tracker Status</Text>

          <View style={tw`pl-4 border-l-2 border-slate-100 gap-4.5`}>
            <View style={tw`relative pl-3`}>
              <View style={[tw`absolute -left-5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white`, { top: 2 }]} />
              <Text style={tw`text-xs font-black text-slate-800`}>Order Received - {finalSummary.time}</Text>
              <Text style={tw`text-[10px] text-slate-400 font-semibold mt-0.5`}>Verified and subtotal charged via {finalSummary.paymentMethod}</Text>
            </View>

            <View style={tw`relative pl-3`}>
              <View style={[tw`absolute -left-5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white`, { top: 2 }]} />
              <Text style={tw`text-xs font-black text-slate-800`}>Packing in Cold Room</Text>
              <Text style={tw`text-[10px] text-slate-400 font-semibold mt-0.5`}>Items are pre-washed and packed in cold chain transit bags</Text>
            </View>

            <View style={tw`relative pl-3`}>
              <View style={[tw`absolute -left-5 w-3 h-3 rounded-full bg-slate-300 border-2 border-white`, { top: 2 }]} />
              <Text style={tw`text-xs font-black text-slate-500`}>
                {finalSummary.fulfillmentMode === 'delivery' ? 'Rider Assigned' : 'Store Counter Verification'}
              </Text>
              <Text style={tw`text-[10px] text-slate-400 font-semibold mt-0.5`}>
                {finalSummary.fulfillmentMode === 'delivery'
                  ? 'Rider will deliver to your counter doorstep in 12-15 mins'
                  : `Pick up at counter using verification code: OTP ${pickupOTP}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery or Pickup Address Card */}
        <View style={tw`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-5`}>
          <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-3`}>📍 Logistics Details</Text>
          <Text style={tw`text-sm font-black text-slate-800`}>
            {finalSummary.fulfillmentMode === 'delivery' ? '🛵 Destination Address:' : '🏬 Pickup Store Location:'}
          </Text>
          <Text style={tw`text-xs text-slate-500 font-bold mt-1 leading-5`}>
            {finalSummary.fulfillmentMode === 'delivery'
              ? finalSummary.address
              : `${finalSummary.selectedStore.name}\n${finalSummary.selectedStore.address}`}
          </Text>
          {finalSummary.fulfillmentMode === 'pickup' && (
            <View style={tw`mt-3 bg-emerald-50 border border-emerald-100 p-3 rounded-2xl`}>
              <Text style={tw`text-xs font-bold text-emerald-800`}>🔐 Store Counter OTP code:</Text>
              <Text style={tw`text-lg font-black text-emerald-700 mt-0.5`}>{pickupOTP}</Text>
            </View>
          )}
        </View>

        {/* Detailed Invoice Summary List */}
        <View style={tw`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-5`}>
          <Text style={tw`text-xs font-black text-slate-400 uppercase tracking-wider mb-3`}>📄 Invoice Items</Text>

          {/* List elements */}
          <View style={tw`border-b border-slate-100 pb-3 mb-3 gap-2.5`}>
            {finalSummary.items.map((item: any) => (
              <View key={item.id} style={tw`flex-row justify-between items-center`}>
                <View style={tw`flex-row items-center gap-2 flex-1 pr-4`}>
                  <Text style={tw`text-base`}>{item.emoji}</Text>
                  <View style={tw`flex-1`}>
                    <Text style={tw`text-xs font-black text-slate-700`} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={tw`text-[9px] text-slate-400 font-semibold mt-0.5`}>{item.weight}</Text>
                  </View>
                </View>
                <Text style={tw`text-xs text-slate-500 font-bold mr-4`}>x{item.quantity}</Text>
                <Text style={tw`text-xs font-black text-slate-800`}>₹{(item.price * item.quantity).toFixed(0)}</Text>
              </View>
            ))}
          </View>

          {/* Bill pricing index */}
          <View style={tw`gap-2`}>
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-xs text-slate-400 font-bold`}>Basket Subtotal</Text>
              <Text style={tw`text-xs font-black text-slate-700`}>₹{finalSummary.pricing.subtotal.toFixed(0)}</Text>
            </View>
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-xs text-slate-400 font-bold`}>Store Discounts</Text>
              <Text style={tw`text-xs font-black text-emerald-600`}>-₹{finalSummary.pricing.discount.toFixed(0)}</Text>
            </View>
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-xs text-slate-400 font-bold`}>Delivery Fee</Text>
              <Text style={tw`text-xs font-black text-slate-700`}>
                {finalSummary.pricing.deliveryFee === 0 ? 'FREE' : `₹${finalSummary.pricing.deliveryFee.toFixed(0)}`}
              </Text>
            </View>
            <View style={tw`flex-row justify-between items-center border-t border-slate-100 pt-3 mt-1`}>
              <Text style={tw`text-xs font-black text-slate-800`}>Total Amount Paid</Text>
              <Text style={tw`text-sm font-black text-slate-800`}>₹{finalSummary.pricing.grandTotal.toFixed(0)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Success Footer Navigation CTAs */}
      <View style={[tw`absolute left-0 right-0 bg-white border-t border-slate-100/80 px-6 py-4.5 flex-row gap-3 shadow-lg`, { bottom: 84 }]}>
        <TouchableOpacity
          onPress={onContinueShopping}
          activeOpacity={0.8}
          style={tw`flex-1 h-13 rounded-full border border-slate-200 justify-center items-center`}
        >
          <Text style={tw`text-xs font-black text-slate-600 uppercase tracking-wider`}>Continue Shopping</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => alert('Simulating real-time delivery GPS route details...')}
          activeOpacity={0.85}
          style={[tw`flex-1 h-13 rounded-full justify-center items-center shadow-md`, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={tw`text-xs font-black text-white uppercase tracking-wider`}>Track Delivery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
