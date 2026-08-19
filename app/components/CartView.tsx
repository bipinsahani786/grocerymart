import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart, StoreLocation } from '../context/CartContext';
import { productService, Coupon } from '../services/product.service';
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
import { useAuthContext } from '../context/AuthContext';
import tw from 'twrnc';

interface CartViewProps {
  onShopMore?: () => void;
  onBack?: () => void;
}

export const CartView: React.FC<CartViewProps> = ({ onShopMore, onBack }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuthContext();
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
    deliveryConfig,
    appliedCoupon,
    appliedDiscount,
    refreshDeliveryConfig,
  } = useCart();

  // Wizard steps: 'cart' -> 'address' -> 'payment' -> 'success'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'address' | 'payment' | 'success'>('cart');
  const [selectedPayment, setSelectedPayment] = useState<'cod' | 'wallet' | 'upi' | 'card'>('cod');
  const [orderId, setOrderId] = useState('');
  const [finalSummary, setFinalSummary] = useState<any>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Backend fetched coupons and stores
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);
  const [fetchedStores, setFetchedStores] = useState<StoreLocation[]>([]);

  // Fetch available coupons from backend
  useEffect(() => {
    let isMounted = true;
    const loadCoupons = async () => {
      setIsLoadingCoupons(true);
      try {
        const data = await productService.fetchCoupons(selectedStore?.id, pincode);
        if (isMounted) {
          setCoupons(data);
        }
      } catch (err) {
        console.warn('Failed to load coupons:', err);
      } finally {
        if (isMounted) setIsLoadingCoupons(false);
      }
    };

    loadCoupons();
    return () => {
      isMounted = false;
    };
  }, [selectedStore?.id, pincode]);

  // Fetch stores and sync live delivery configuration from backend
  useEffect(() => {
    let isMounted = true;
    const loadStores = async () => {
      try {
        const stores = await productService.fetchStores(pincode);
        if (isMounted && stores.length > 0) {
          setFetchedStores(stores);
          if (!selectedStore) {
            setSelectedStore(stores[0]);
          } else {
            const matched = stores.find((s) => s.id === selectedStore.id);
            if (matched) {
              setSelectedStore(matched);
            }
          }
        }
        await refreshDeliveryConfig();
      } catch (err) {
        console.warn('Failed to load backend stores / delivery config:', err);
      }
    };

    loadStores();
    return () => {
      isMounted = false;
    };
  }, [pincode, selectedStore?.id]);

  // Filter stores according to input pincode
  const getStoresForPincode = () => {
    if (fetchedStores.length > 0) {
      return fetchedStores;
    }
    if (selectedStore) {
      return [selectedStore];
    }
    return [];
  };

  const activeStores = getStoresForPincode();

  const handleCheckout = () => {
    setCheckoutStep('address');
  };

  const handlePlaceOrder = async () => {
    setIsPlacingOrder(true);
    let finalOrderId = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(100000 + Math.random() * 900000);

    try {
      // Connect and save each & every detail directly into backend Order table with User ID
      const orderPayload = {
        customerId: user?.id,
        userPhone: user?.phone,
        userEmail: user?.email,
        storeId: selectedStore?.id,
        deliveryAddress: selectedAddress || (pincode ? `PIN: ${pincode}` : 'Store pickup point'),
        fulfillmentMode,
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          weight: item.weight,
        })),
        subtotal: pricing.subtotal,
        discount: appliedDiscount,
        discountReason: appliedCoupon?.code || '',
        taxAmount: pricing.tax,
        deliveryFee: fulfillmentMode === 'pickup' ? 0 : pricing.deliveryFee,
        totalAmount: pricing.grandTotal,
        paymentMethod: selectedPayment,
      };

      const response = await productService.createOrder(orderPayload);
      if (response && response.data) {
        finalOrderId = response.data.orderNumber || response.data.id || finalOrderId;
      }
    } catch (err) {
      console.warn('Backend order placement sync notice:', err);
    } finally {
      setIsPlacingOrder(false);
    }

    setOrderId(finalOrderId);

    // Freeze details in memory before resetting cart
    setFinalSummary({
      items: [...cart],
      pricing: { ...pricing },
      fulfillmentMode,
      selectedStore: selectedStore ? { ...selectedStore } : null,
      address:
        fulfillmentMode === 'delivery'
          ? (selectedAddress || (pincode ? `PIN: ${pincode}` : 'Location not set'))
          : (selectedStore?.address || 'Pickup Outlet'),
      paymentMethod:
        selectedPayment === 'cod'
          ? (fulfillmentMode === 'delivery' ? 'Cash on Delivery (COD)' : 'Pay at Counter')
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

  // Render a clean customized Header for checkout sub-wizard steps with rich green theme
  const renderCheckoutHeader = (
    title: string,
    subtitle?: string,
    showBack = true,
    backStep: typeof checkoutStep = 'cart'
  ) => (
    <LinearGradient
      colors={['#064E3B', '#047857', '#059669']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        tw`pb-4.5 px-5 flex-row items-center`,
        { paddingTop: Math.max(insets.top, 14) + 8 },
      ]}
    >
      {showBack && (
        <TouchableOpacity
          onPress={() => setCheckoutStep(backStep)}
          style={tw`w-9 h-9 rounded-full bg-white/20 border border-white/20 justify-center items-center mr-3`}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={19} color="#FFFFFF" />
        </TouchableOpacity>
      )}
      <View style={tw`flex-1`}>
        <Text style={tw`text-lg font-black text-white tracking-tight`}>{title}</Text>
        {subtitle ? (
          <Text style={tw`text-[11px] font-bold text-emerald-100 mt-0.5`}>{subtitle}</Text>
        ) : null}
      </View>
    </LinearGradient>
  );

  // ── STEP A: Main Cart Basket View ──
  if (checkoutStep === 'cart') {
    if (totalItems === 0) {
      return <CartEmptyState onShopMore={onShopMore} />;
    }

    return (
      <View style={tw`flex-1 bg-slate-100/60`}>
        <StatusBar style="light" translucent />
        <CartHeader totalItems={totalItems} onClear={clearCart} onBack={onBack} />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={tw`pb-72`}>
          {/* 1. Fulfillment Mode & Destination Strip + Free Delivery Meter */}
          <CartDeliveryBanner subtotal={pricing.subtotal} onChangeLocation={() => setCheckoutStep('address')} />

          <View style={tw`h-2.5 bg-slate-100/80`} />

          {/* 2. Items List on Unified Clean Surface */}
          <CartItemList
            items={cart}
            onAdd={addToCart}
            onRemove={removeFromCart}
            onAddMore={onShopMore}
          />

          <View style={tw`h-2.5 bg-slate-100/80`} />

          {/* 3. Offers & Coupons 1-Tap Strip */}
          <CartPromoCode coupons={coupons} isLoadingCoupons={isLoadingCoupons} />

          <View style={tw`h-2.5 bg-slate-100/80`} />

          {/* 4. Delivery Preferences / Pickup Guidance */}
          <CartDeliveryNotes />

          <View style={tw`h-2.5 bg-slate-100/80`} />

          {/* 5. Bill Summary Receipt Breakdown */}
          <CartBillSummary pricing={pricing} />

          {/* 6. Trust & Cancellation Reassurance */}
          <View style={tw`p-4 py-5 items-center justify-center bg-slate-50`}>
            <View style={tw`flex-row items-center gap-1.5 mb-1`}>
              <Ionicons name="shield-checkmark" size={14} color="#059669" />
              <Text style={tw`text-[11px] font-black text-slate-700`}>100% Genuine & Fresh Products</Text>
            </View>
            <Text style={tw`text-[10px] text-slate-400 text-center font-medium px-4`}>
              Cancellation policy: Orders can be cancelled until the store starts packing.
            </Text>
          </View>
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
        <StatusBar style="light" translucent />
        {renderCheckoutHeader('Select Store / Address', 'Choose delivery location or pickup outlet', true, 'cart')}
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
        <StatusBar style="light" translucent />
        {renderCheckoutHeader('Choose Payment', 'Select your preferred payment method', true, 'address')}
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
        <StatusBar style="light" translucent />
        {renderCheckoutHeader('Order Confirmed!', 'Receipt & delivery tracking', false)}
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
