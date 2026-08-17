import React, { createContext, useContext, useState, useMemo } from 'react';
import { calculatePricing, PricingSummary } from '../utils/pricing';

export type FulfillmentMode = 'delivery' | 'pickup';

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  distance: string;
  readyTime: string;
}

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    id: 's1',
    name: 'GroceryMart - Noida Sector 62 Outlet',
    address: 'Sector 62, Noida, UP - 201301',
    distance: '1.2 km away',
    readyTime: 'Ready in 10 mins',
  },
  {
    id: 's2',
    name: 'GroceryMart - Indirapuram Depot',
    address: 'Niti Khand 1, Indirapuram, Ghaziabad - 201014',
    distance: '3.5 km away',
    readyTime: 'Ready in 15 mins',
  },
];

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
  selectedStore: StoreLocation;
  setSelectedStore: (store: StoreLocation) => void;
  pincode: string;
  setPincode: (pin: string) => void;
  selectedAddress: string;
  setSelectedAddress: (addr: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [fulfillmentMode, setFulfillmentMode] = useState<FulfillmentMode>('delivery');
  const [selectedStore, setSelectedStore] = useState<StoreLocation>(STORE_LOCATIONS[0]);
  const [pincode, setPincode] = useState('201301');
  const [selectedAddress, setSelectedAddress] = useState<string>('home');

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
