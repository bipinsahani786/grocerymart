import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculatePricing, PricingSummary, PricingConfig, DEFAULT_PRICING_CONFIG } from '../utils/pricing';
import { productService, Coupon, DeliveryConfig } from '../services/product.service';

export type FulfillmentMode = 'delivery' | 'pickup';

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  distance: string;
  readyTime: string;
  distanceKm?: number;
  lat?: number;
  long?: number;
  deliveryChargePerKm?: number;
  freeDeliveryKmRadius?: number;
  minDeliveryCharge?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  weight: string;
  emoji: string;
  quantity: number;
}

export interface CartContextType {
  cart: CartItem[];
  addToCart: (product: { id: string; name: string; price: number; weight: string; emoji: string }) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  pricing: PricingSummary;
  fulfillmentMode: FulfillmentMode;
  setFulfillmentMode: (mode: FulfillmentMode) => void;
  selectedStore: StoreLocation | null;
  setSelectedStore: (store: StoreLocation | null) => void;
  pincode: string;
  setPincode: (pin: string) => void;
  selectedAddress: string;
  setSelectedAddress: (addr: string) => void;
  // Delivery & Coupon backend state
  deliveryConfig: DeliveryConfig;
  appliedCoupon: Coupon | null;
  appliedDiscount: number;
  applyCoupon: (coupon: Coupon, discountAmount: number) => void;
  removeCoupon: () => void;
  selectedTip: number;
  setSelectedTip: (tip: number) => void;
  refreshDeliveryConfig: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>('delivery');
  const [selectedStore, setSelectedStoreState] = useState<StoreLocation | null>(null);
  const [pincode, setPincodeState] = useState('');
  const [selectedAddress, setSelectedAddressState] = useState<string>('');
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [deliveryConfig, setDeliveryConfig] = useState<DeliveryConfig>({
    storeId: null,
    storeName: 'GroceryMart Central',
    standardDeliveryFee: DEFAULT_PRICING_CONFIG.standardDeliveryFee,
    freeDeliveryThreshold: DEFAULT_PRICING_CONFIG.freeDeliveryThreshold,
    taxRatePercent: DEFAULT_PRICING_CONFIG.taxRatePercent,
    deliveryChargePerKm: 20,
    freeDeliveryKmRadius: 3,
    minDeliveryCharge: DEFAULT_PRICING_CONFIG.standardDeliveryFee,
    deliveryEnabled: true,
    clickCollectEnabled: true,
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);

  // Parse estimated distance to active store in KM
  const parsedDistance = useMemo(() => {
    if (selectedStore?.distanceKm && typeof selectedStore.distanceKm === 'number') {
      return selectedStore.distanceKm;
    }
    if (selectedStore?.distance) {
      const match = String(selectedStore.distance).match(/([0-9.]+)\s*km/i);
      if (match) return parseFloat(match[1]);
    }
    return 1.2;
  }, [selectedStore]);

  // Fetch dynamic delivery rate and KM rules from backend in real-time
  const refreshDeliveryConfig = useCallback(async () => {
    try {
      const rawSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const config = await productService.fetchDeliveryConfig({
        storeId: selectedStore?.id,
        pincode,
        distanceKm: parsedDistance,
        subtotal: rawSubtotal,
      });
      if (config) {
        setDeliveryConfig(config);
        // Automatically sync latest store name and address from backend into selectedStore
        if (config.storeName) {
          setSelectedStoreState((prev) => {
            if (!prev) {
              return {
                id: config.storeId || 'default-store',
                name: config.storeName || 'GroceryMart Outlet',
                address: config.storeAddress || '',
                distance: `${config.distanceKm || 1.2} km away`,
                readyTime: 'Ready in 10 mins',
                distanceKm: config.distanceKm,
                deliveryChargePerKm: config.deliveryChargePerKm,
                freeDeliveryKmRadius: config.freeDeliveryKmRadius,
                minDeliveryCharge: config.minDeliveryCharge,
              };
            }
            if (prev.name !== config.storeName || (config.storeAddress && prev.address !== config.storeAddress)) {
              return {
                ...prev,
                name: config.storeName || prev.name,
                address: config.storeAddress || prev.address,
                distanceKm: config.distanceKm ?? prev.distanceKm,
                deliveryChargePerKm: config.deliveryChargePerKm ?? prev.deliveryChargePerKm,
                freeDeliveryKmRadius: config.freeDeliveryKmRadius ?? prev.freeDeliveryKmRadius,
                minDeliveryCharge: config.minDeliveryCharge ?? prev.minDeliveryCharge,
              };
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch backend delivery config:', err);
    }
  }, [selectedStore?.id, pincode, parsedDistance, cart]);

  // Load previously chosen delivery address, pincode, and outlet on app start & sync fresh store data
  useEffect(() => {
    const restorePersistedLocation = async () => {
      try {
        const [savedAddr, savedPin, savedStore] = await Promise.all([
          AsyncStorage.getItem('@gm_selected_address'),
          AsyncStorage.getItem('@gm_pincode'),
          AsyncStorage.getItem('@gm_selected_store'),
        ]);

        if (savedAddr) setSelectedAddressState(savedAddr);
        if (savedPin) setPincodeState(savedPin);
        let parsedSaved: StoreLocation | null = null;
        if (savedStore) {
          try {
            parsedSaved = JSON.parse(savedStore);
            if (parsedSaved) setSelectedStoreState(parsedSaved);
          } catch (_) {}
        }

        // Fetch fresh stores from backend and update store name/details live
        const freshStores = await productService.fetchStores(savedPin || undefined);
        if (freshStores && freshStores.length > 0) {
          const matched = parsedSaved ? freshStores.find((s) => s.id === parsedSaved.id) : null;
          const fresh = matched || freshStores[0];
          setSelectedStoreState(fresh);
          AsyncStorage.setItem('@gm_selected_store', JSON.stringify(fresh)).catch(() => {});
        }
      } catch (err) {
        console.error('Failed to restore and sync location state:', err);
      }
    };

    restorePersistedLocation();
  }, []);

  // Whenever selectedStore or pincode changes, re-fetch backend delivery configuration
  useEffect(() => {
    refreshDeliveryConfig();
  }, [refreshDeliveryConfig]);

  const setPincode = async (pin: string) => {
    const cleanPin = pin ? pin.trim() : '';
    setPincodeState(cleanPin);
    if (cleanPin) {
      AsyncStorage.setItem('@gm_pincode', cleanPin).catch(() => {});
      try {
        const freshStores = await productService.fetchStores(cleanPin);
        if (freshStores && freshStores.length > 0) {
          const nearestStore = freshStores[0];
          setSelectedStoreState(nearestStore);
          AsyncStorage.setItem('@gm_selected_store', JSON.stringify(nearestStore)).catch(() => {});
        }
      } catch (err) {
        console.warn('Failed to auto-select nearest store for pincode:', err);
      }
    } else {
      AsyncStorage.removeItem('@gm_pincode').catch(() => {});
    }
  };

  const setSelectedAddress = (addr: string) => {
    setSelectedAddressState(addr);
    if (addr) {
      AsyncStorage.setItem('@gm_selected_address', addr).catch(() => {});
      const pinMatch = addr.match(/\b\d{6}\b/);
      if (pinMatch && pinMatch[0]) {
        setPincode(pinMatch[0]);
      }
    } else {
      AsyncStorage.removeItem('@gm_selected_address').catch(() => {});
    }
  };

  const setSelectedStore = (store: StoreLocation | null) => {
    setSelectedStoreState(store);
    if (store) {
      AsyncStorage.setItem('@gm_selected_store', JSON.stringify(store)).catch(() => {});
    } else {
      AsyncStorage.removeItem('@gm_selected_store').catch(() => {});
    }
  };

  const addToCart = (product: { id: string; name: string; price: number; weight: string; emoji: string }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem) {
        if (existingItem.quantity === 1) {
          return prevCart.filter((item) => item.id !== productId);
        }
        return prevCart.map((item) =>
          item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prevCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setAppliedDiscount(0);
    setSelectedTip(0);
  };

  const applyCoupon = (coupon: Coupon, discountAmount: number) => {
    setAppliedCoupon(coupon);
    setAppliedDiscount(discountAmount);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setAppliedDiscount(0);
  };

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  // Dynamic pricing calculation using backend delivery rate, applied coupon, and tip
  const pricing = useMemo(() => {
    const activePricingConfig: PricingConfig = {
      standardDeliveryFee: deliveryConfig.standardDeliveryFee,
      freeDeliveryThreshold: deliveryConfig.freeDeliveryThreshold,
      taxRatePercent: deliveryConfig.taxRatePercent,
      freeDeliveryKmRadius: deliveryConfig.freeDeliveryKmRadius,
      deliveryChargePerKm: deliveryConfig.deliveryChargePerKm,
      minDeliveryCharge: deliveryConfig.minDeliveryCharge,
      distanceKm: deliveryConfig.distanceKm || parsedDistance,
    };

    // Calculate with applied discount amount and optional tip
    const activeTip = fulfillmentMode === 'pickup' ? 0 : selectedTip;
    const rawPricing = calculatePricing(cart, appliedDiscount, false, activePricingConfig, activeTip);

    if (fulfillmentMode === 'pickup') {
      const grandTotalWithoutDelivery = Math.max(
        0,
        rawPricing.subtotal - rawPricing.discount + rawPricing.tax
      );
      return {
        ...rawPricing,
        deliveryFee: 0,
        tip: 0,
        isFreeDelivery: true,
        deliveryRuleReason: 'Free Store Pickup',
        grandTotal: grandTotalWithoutDelivery,
      };
    }
    return rawPricing;
  }, [cart, fulfillmentMode, appliedDiscount, deliveryConfig, selectedTip, parsedDistance]);

  const totalAmount = pricing.subtotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalAmount,
        pricing,
        fulfillmentMode,
        setFulfillmentMode,
        selectedStore,
        setSelectedStore,
        pincode,
        setPincode,
        selectedAddress,
        setSelectedAddress,
        deliveryConfig,
        appliedCoupon,
        appliedDiscount,
        applyCoupon,
        removeCoupon,
        selectedTip,
        setSelectedTip,
        refreshDeliveryConfig,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

