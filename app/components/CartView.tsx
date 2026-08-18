import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useCart, StoreLocation } from '../context/CartContext';
import { CartHeader } from './cart/CartHeader';
import { CartDeliveryBanner } from './cart/CartDeliveryBanner';
import { CartItemList } from './cart/CartItemList';
import { CartPromoCode } from './cart/CartPromoCode';
import { CartDeliveryNotes } from './cart/CartDeliveryNotes';
import { CartBillSummary } from './cart/CartBillSummary';
import { CartEmptyState } from './cart/CartEmptyState';
import { CartCheckoutFooter } from './cart/CartCheckoutFooter';
import { CheckoutAddressSection } from './cart/CheckoutAddressSection';
import { CheckoutPaymentSection } from './cart/CheckoutPaymentSection';
import { CheckoutSuccessSection } from './cart/CheckoutSuccessSection';
import tw from 'twrnc';

interface CartViewProps {
  onShopMore?: () => void;
  onBack?: () => void;
}

// Stores catalog segmented by pincodes
const STORES_DATABASE: Record<string, StoreLocation[]> = {
  primary: [
    {
      id: 's1',
      name: 'GroceryMart - Downtown Flagship',
      address: 'Shop 14, Central Market, Connaught Place (10001)',
      distance: '1.2 km away',
      readyTime: 'Ready in 10 mins',
    },
    {
      id: 's2',
      name: 'GroceryMart - Green Park Express',
      address: 'Plot 22, Main Market, Green Park (10016)',
      distance: '2.8 km away',
      readyTime: 'Ready in 15 mins',
    },
  ],
  secondary: [
    {
      id: 's3',
      name: 'GroceryMart - West Side Depot',
      address: '88 Ninth Ave, New York (10011)',
      distance: '3.5 km away',
      readyTime: 'Ready in 20 mins',
    },
    {
      id: 's4',
      name: 'GroceryMart - Brooklyn Fresh Hub',
      address: '300 Cadman Plaza, Brooklyn (11201)',
      distance: '6.2 km away',
      readyTime: 'Ready in 25 mins',
    },
  ],
};

export const CartView: React.FC<CartViewProps> = ({ onShopMore, onBack }) => {
  const {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    totalItems,
    pricing,
    fulfillmentMode,
    selectedStore,
    setSelectedStore,
    pincode,
    setPincode,
    selectedAddress,
    setSelectedAddress,
  } = useCart();

  // Wizard steps: 'cart' -> 'address' -> 'payment' -> 'success'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment' | 'success'>('cart');
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'wallet' | 'upi' | 'card'>('cod');
  const [orderId, setOrderId] = useState('');
  const [finalSummary, setFinalSummary] = useState<any>(null);
  
  // Promo state variables to satisfy CartPromoCode props
  const [discountAmount, setDiscountAmount] = useState(35);
  const handleApplyPromo = (code: string) => {
    // Simply sets discount for mock demonstration
    setDiscountAmount(35);
  };

  // Filter stores according to input pincode
  const getStoresForPincode = () => {
    if (!pincode || pincode.trim().startsWith('1')) {
      return STORES_DATABASE.primary;
    }
    return STORES_DATABASE.secondary;
  };

  const activeStores = getStoresForPincode();

  const handleCheckout = () => {
    setCheckoutStep('address');
  };

  const handlePlaceOrder = () => {
    const mockOrderId = 'GM-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(mockOrderId);

    // Freeze details in memory before resetting cart
    setFinalSummary({
      items: [...cart],
      pricing: { ...pricing },
      fulfillmentMode,
      selectedStore: { ...selectedStore },
      address:
        selectedAddress === 'home'
          ? 'Home - Flat 402, Stellar Park, Sector 62, Noida, UP (201301)'
          : selectedAddress === 'office'
          ? 'Office - Stellar IT Park, Tower A, Sector 62, Noida, UP (201301)'
          : 'Custom Address Location Selected',
      paymentMethod:
        selectedPayment === 'cod'
          ? 'Cash on Delivery (COD)'
          : selectedPayment === 'wallet'
          ? 'Wallet Balance (Paid)'
          : selectedPayment === 'upi'
          ? 'UPI / PhonePe Wallet'
          : 'Credit Card',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    clearCart();
    setCheckoutStep('success');
  };

  const handleContinueShopping = () => {
    setCheckoutStep('cart');
    if (onShopMore) onShopMore();
  };

  // Render a clean customized Header for checkout sub-wizard steps
  const renderCheckoutHeader = (title: string, showBack = true, backStep: typeof checkoutStep = 'cart') => (
    <View style={tw`pt-14 pb-4 px-5 bg-white border-b border-slate-100 flex-row items-center shadow-sm`}>
      {showBack && (
        <TouchableOpacity
          onPress={() => setCheckoutStep(backStep)}
          style={tw`w-10 h-10 rounded-full bg-slate-50 border border-slate-100 justify-center items-center mr-3`}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#1E293B" />
        </TouchableOpacity>
      )}
      <Text style={tw`text-lg font-black text-slate-800`}>{title}</Text>
    </View>
  );

  // ── STEP A: Main Cart Basket View ──
  if (checkoutStep === 'cart') {
    if (totalItems === 0) {
      return <CartEmptyState onShopMore={onShopMore} />;
    }

    return (
      <View style={tw`flex-1 bg-slate-50`}>
        <StatusBar style="dark" />
        <CartHeader totalItems={totalItems} onClear={clearCart} onBack={onBack} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-72`}>
          <CartDeliveryBanner subtotal={pricing.subtotal} onChangeLocation={() => setCheckoutStep('address')} />

          {/* ── Dynamic Address & Store Location Change Card ── */}
          <TouchableOpacity
            onPress={() => setCheckoutStep('address')}
            activeOpacity={0.9}
            style={tw`mx-4 mb-4 bg-white rounded-3xl p-4.5 border border-slate-100/80 shadow-sm flex-row justify-between items-center`}
          >
            <View style={tw`flex-row items-center gap-3.5 flex-1 pr-4`}>
              <View style={tw`w-11 h-11 bg-emerald-50 rounded-2xl items-center justify-center`}>
                <Ionicons
                  name={fulfillmentMode === 'delivery' ? 'location' : 'storefront'}
                  size={20}
                  color="#059669"
                />
              </View>
              <View style={tw`flex-1`}>
                <Text style={tw`text-[10px] font-black text-slate-400 uppercase tracking-wider`}>
                  {fulfillmentMode === 'delivery' ? 'Delivering to Address' : 'Takeaway Counter Store'}
                </Text>
                <Text style={tw`text-xs font-black text-slate-800 mt-0.5`} numberOfLines={1}>
                  {fulfillmentMode === 'delivery'
                    ? (selectedAddress || (pincode ? `Delivery Area (PIN: ${pincode})` : 'Location not detected'))
                    : selectedStore.name}
                </Text>
                <Text style={tw`text-[10px] text-slate-400 font-bold mt-0.5`} numberOfLines={1}>
                  {fulfillmentMode === 'delivery'
                    ? (selectedAddress
                      ? selectedAddress
                      : (pincode ? `PIN: ${pincode} • Tap to choose delivery address` : 'Tap to select or detect delivery address'))
                    : selectedStore.address}
                </Text>
              </View>
            </View>
            <View style={tw`px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100`}>
              <Text style={tw`text-[9px] font-black text-emerald-700 uppercase tracking-wider`}>Change</Text>
            </View>
          </TouchableOpacity>

          <CartItemList items={cart} onAdd={addToCart} onRemove={removeFromCart} />
          <CartPromoCode discountAmount={discountAmount} onApplyPromo={handleApplyPromo} />
          <CartDeliveryNotes />
          <CartBillSummary pricing={pricing} />
        </ScrollView>

        <CartCheckoutFooter
          grandTotal={pricing.grandTotal}
          totalItems={totalItems}
          onCheckout={handleCheckout}
        />
      </View>
    );
  }

  // ── STEP B: Address / Store Location Picker Selection ──
  if (checkoutStep === 'address') {
    return (
      <View style={tw`flex-1 bg-slate-50`}>
        <StatusBar style="dark" />
        {renderCheckoutHeader('Select Delivery/Store', true, 'cart')}
        <CheckoutAddressSection
          fulfillmentMode={fulfillmentMode}
          selectedAddress={selectedAddress}
          setSelectedAddress={setSelectedAddress}
          pincode={pincode}
          setPincode={setPincode}
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
          activeStores={activeStores}
          onContinue={() => setCheckoutStep('payment')}
          totalAmount={pricing.grandTotal}
        />
      </View>
    );
  }

  // ── STEP C: Select Payment Option Page ──
  if (checkoutStep === 'payment') {
    return (
      <View style={tw`flex-1 bg-slate-50`}>
        <StatusBar style="dark" />
        {renderCheckoutHeader('Choose Payment', true, 'address')}
        <CheckoutPaymentSection
          fulfillmentMode={fulfillmentMode}
          selectedAddress={selectedAddress}
          selectedStore={selectedStore}
          selectedPayment={selectedPayment}
          setSelectedPayment={setSelectedPayment}
          totalAmount={pricing.grandTotal}
          onPlaceOrder={handlePlaceOrder}
        />
      </View>
    );
  }

  // ── STEP D: Fully Detailed Checkout Success Dashboard ──
  if (checkoutStep === 'success' && finalSummary) {
    return (
      <View style={tw`flex-1 bg-slate-50`}>
        <StatusBar style="dark" />
        {renderCheckoutHeader('Order Confirmed!', false)}
        <CheckoutSuccessSection
          orderId={orderId}
          finalSummary={finalSummary}
          onContinueShopping={handleContinueShopping}
        />
      </View>
    );
  }

  return null;
};
