import React, { useState } from 'react';
import { View, ScrollView, Text, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { CartHeader } from './cart/CartHeader';
import { CartDeliveryBanner } from './cart/CartDeliveryBanner';
import { CartItemList } from './cart/CartItemList';
import { CartPromoCode } from './cart/CartPromoCode';
import { CartDeliveryNotes } from './cart/CartDeliveryNotes';
import { CartBillSummary } from './cart/CartBillSummary';
import { CartEmptyState } from './cart/CartEmptyState';
import { CartCheckoutFooter } from './cart/CartCheckoutFooter';
import { theme } from '../constants/theme';
import tw from 'twrnc';

interface CartViewProps {
  onShopMore?: () => void;
  onBack?: () => void;
}

/**
 * Single Responsibility: Real-world, production-tier Cart experience.
 * Fully adapts its layout, banner, instructions, fee calculations, and checkout
 * based on Domino's-style Delivery vs Store Takeaway modes.
 */
export const CartView: React.FC<CartViewProps> = ({ onShopMore, onBack }) => {
  const { cart, addToCart, removeFromCart, clearCart, totalItems, pricing, fulfillmentMode, selectedStore } = useCart();
  const [isOrdered, setIsOrdered] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(35);

  const handleCheckout = () => {
    setIsOrdered(true);
    setTimeout(() => {
      clearCart();
      setIsOrdered(false);
      if (fulfillmentMode === 'pickup') {
        Alert.alert(
          '🏬 Store Pickup Order Confirmed!',
          `Your order has been sent to ${selectedStore.name}. It will be packed and ready in 10 mins. Show OTP at Counter #2.`,
          [{ text: 'Got It!' }]
        );
      } else {
        Alert.alert(
          '🛵 Delivery Order Placed Successfully!',
          'Your farm-fresh organic groceries are being packed and will arrive at your doorstep in 12-15 minutes.',
          [{ text: 'Awesome!' }]
        );
      }
    }, 1800);
  };

  return (
    <View style={tw`flex-1 bg-slate-50`}>
      {/* ── 1. Top Header ── */}
      <CartHeader totalItems={totalItems} onClear={clearCart} onBack={onBack} />

      {/* ── 2. Order Processing State ── */}
      {isOrdered ? (
        <View style={tw`flex-1 items-center justify-center py-10 px-6`}>
          <View style={[tw`w-24 h-24 rounded-full bg-emerald-100 justify-center items-center mb-6`]}>
            <Ionicons name="checkmark-circle" size={64} color="#10B981" />
          </View>
          <Text style={[tw`text-2xl font-black text-center mb-2`, { color: theme.colors.text }]}>
            {fulfillmentMode === 'pickup' ? 'Confirming Store Pickup...' : 'Processing Delivery Order...'}
          </Text>
          <Text style={[tw`text-sm text-center px-8`, { color: theme.colors.textMuted }]}>
            {fulfillmentMode === 'pickup'
              ? `Notifying ${selectedStore.name} team to begin express packing.`
              : 'Securing your fresh organic order with our express delivery partner.'}
          </Text>
        </View>
      ) : totalItems === 0 ? (
        /* ── 3. Empty Basket State ── */
        <CartEmptyState onShopMore={onShopMore} />
      ) : (
        /* ── 4. Active Cart Scrollable Sections ── */
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={tw`flex-1 px-4 pt-4`}
          contentContainerStyle={[tw`pb-36`, { paddingBottom: 130 }]}
        >
          {/* Delivery vs Store Pickup Switcher & Location Card */}
          <CartDeliveryBanner subtotal={pricing.subtotal} />

          {/* Line Items List */}
          <CartItemList items={cart} onAdd={addToCart} onRemove={removeFromCart} />

          {/* Promo Code Voucher Hub */}
          <CartPromoCode
            discountAmount={discountAmount}
            onApplyPromo={(code) => setDiscountAmount(35)}
          />

          {/* Mode-Adapted Preferences: Rider Notes & Tip OR Store Pickup Guidelines */}
          <CartDeliveryNotes />

          {/* Transparent Bill Breakdown */}
          <CartBillSummary pricing={pricing} discount={discountAmount} />

          {/* Floating Checkout CTA */}
          <CartCheckoutFooter
            grandTotal={Math.max(0, pricing.grandTotal - discountAmount)}
            totalItems={totalItems}
            onCheckout={handleCheckout}
          />
        </ScrollView>
      )}
    </View>
  );
};
