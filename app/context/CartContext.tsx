import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculatePricing, PricingSummary } from '../utils/pricing';

export type FulfillmentMode = 'delivery' | 'pickup';

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  distance: string;
  readyTime: string;
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>('delivery');
  const [selectedStore, setSelectedStoreState] = useState<StoreLocation | null>(null);
  const [pincode, setPincodeState] = useState('');
  const [selectedAddress, setSelectedAddressState] = useState<string>('');

  // Load previously chosen delivery address, pincode, and outlet on app start
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
        if (savedStore) {
          try {
            setSelectedStoreState(JSON.parse(savedStore));
          } catch (_) {}
        }
      } catch (err) {
        console.error('Failed to restore location state:', err);
      }
    };

    restorePersistedLocation();
  }, []);

  const setSelectedAddress = (addr: string) => {
    setSelectedAddressState(addr);
    if (addr) {
      AsyncStorage.setItem('@gm_selected_address', addr).catch(() => {});
    } else {
      AsyncStorage.removeItem('@gm_selected_address').catch(() => {});
    }
  };

  const setPincode = (pin: string) => {
    setPincodeState(pin);
    if (pin) {
      AsyncStorage.setItem('@gm_pincode', pin).catch(() => {});
    } else {
      AsyncStorage.removeItem('@gm_pincode').catch(() => {});
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
  };

  const totalItems = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const pricing = useMemo(() => {
    const rawPricing = calculatePricing(cart);
    if (fulfillmentMode === 'pickup') {
      const grandTotalWithoutDelivery = Math.max(
        0,
        rawPricing.subtotal - rawPricing.discount + rawPricing.tax
      );
      return {
        ...rawPricing,
        deliveryFee: 0,
        isFreeDelivery: true,
        grandTotal: grandTotalWithoutDelivery,
      };
    }
    return rawPricing;
  }, [cart, fulfillmentMode]);

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
