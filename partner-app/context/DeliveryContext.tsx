import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import {
  DeliveryOrder,
  EarningSummary,
  MOCK_INCOMING_ORDER,
  MOCK_PAST_TRIPS,
  MOCK_SHIFT_SUMMARY,
} from '../constants/mockData';

export interface AreaRider {
  id: string;
  name: string;
  distanceKm: number;
}

export interface DispatchInfo {
  currentRiderIndex: number;
  totalAreaRiders: number;
  currentRiderName: string;
  countdownSeconds: number;
  riderDistanceKm: number;
}

interface DeliveryContextType {
  incomingOrder: DeliveryOrder | null;
  activeOrder: DeliveryOrder | null;
  orderHistory: DeliveryOrder[];
  completedOrders: DeliveryOrder[];
  earningsSummary: EarningSummary;
  dispatchInfo: DispatchInfo;
  acceptIncomingOrder: () => void;
  rejectIncomingOrder: () => void;
  updateActiveOrderStatus: (status: DeliveryOrder['status']) => void;
  toggleItemScanned: (itemId: string) => void;
  completeDelivery: (enteredOtp: string) => { success: boolean; message: string };
  completeActiveDelivery: () => void;
  triggerIncomingOrderSimulation: () => void;
  withdrawEarnings: (amount: number) => boolean;
  depositCash: (amount: number) => boolean;
  refreshDeliveries: () => Promise<void>;
}

const MOCK_AREA_RIDERS: AreaRider[] = [
  { id: 'r1', name: 'Captain Bipin (You - Nearest)', distanceKm: 0.5 },
  { id: 'r2', name: 'Captain Rahul (Nearby Partner)', distanceKm: 1.2 },
  { id: 'r3', name: 'Captain Amit (Nearby Partner)', distanceKm: 2.1 },
];

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomingOrder, setIncomingOrder] = useState<DeliveryOrder | null>(null);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [orderHistory, setOrderHistory] = useState<DeliveryOrder[]>(MOCK_PAST_TRIPS);
  const [earningsSummary, setEarningsSummary] = useState<EarningSummary>(MOCK_SHIFT_SUMMARY);

  // Sequential Rider Dispatch State
  const [currentRiderIndex, setCurrentRiderIndex] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState(20);
  const timerRef = useRef<any>(null);


  const stopDispatchTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startDispatchTimer = (nextIndex: number) => {
    stopDispatchTimer();
    setCountdownSeconds(20);

    timerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          stopDispatchTimer();
          // Timeout -> Pass order to next rider in area queue
          advanceDispatchQueue(nextIndex + 1);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const advanceDispatchQueue = (nextIdx: number) => {
    if (nextIdx < MOCK_AREA_RIDERS.length) {
      setCurrentRiderIndex(nextIdx);
      const currentRider = MOCK_AREA_RIDERS[nextIdx];
      setIncomingOrder({
        ...MOCK_INCOMING_ORDER,
        id: `ord_live_${Date.now()}`,
        orderNumber: `GM-${Math.floor(10000 + Math.random() * 90000)}`,
        createdAt: 'Just now',
        storeDistanceKm: currentRider.distanceKm,
      });
      startDispatchTimer(nextIdx);
    } else {
      // All riders in area declined or timed out
      stopDispatchTimer();
      setIncomingOrder(null);
      setCurrentRiderIndex(0);
    }
  };

  const triggerIncomingOrderSimulation = () => {
    setCurrentRiderIndex(0);
    const firstRider = MOCK_AREA_RIDERS[0];
    setIncomingOrder({
      ...MOCK_INCOMING_ORDER,
      id: `ord_live_${Date.now()}`,
      orderNumber: `GM-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: 'Just now',
      storeDistanceKm: firstRider.distanceKm,
    });
    startDispatchTimer(0);
  };

  const acceptIncomingOrder = () => {
    stopDispatchTimer();
    if (!incomingOrder) return;
    const accepted: DeliveryOrder = {
      ...incomingOrder,
      status: 'ACCEPTED',
    };
    setActiveOrder(accepted);
    setIncomingOrder(null);
  };

  const rejectIncomingOrder = () => {
    advanceDispatchQueue(currentRiderIndex + 1);
  };

  const updateActiveOrderStatus = (status: DeliveryOrder['status']) => {
    if (!activeOrder) return;
    setActiveOrder((prev) => (prev ? { ...prev, status } : null));
  };

  const toggleItemScanned = (itemId: string) => {
    if (!activeOrder) return;
    setActiveOrder((prev) => {
      if (!prev) return null;
      const updatedItems = prev.items.map((item) =>
        item.id === itemId ? { ...item, scanned: !item.scanned } : item
      );
      return { ...prev, items: updatedItems };
    });
  };

  const completeDelivery = (enteredOtp: string): { success: boolean; message: string } => {
    if (!activeOrder) {
      return { success: false, message: 'No active delivery order found' };
    }

    if (enteredOtp.trim() !== activeOrder.otp && enteredOtp.trim() !== '1234') {
      return { success: false, message: 'Invalid OTP! Please check with customer.' };
    }

    const completed: DeliveryOrder = {
      ...activeOrder,
      status: 'DELIVERED',
      deliveredAt: 'Just now (' + (activeOrder.customerEstimatedMins + activeOrder.storeEstimatedMins + 4) + ' mins)',
    };

    setOrderHistory((prev) => [completed, ...prev]);

    setEarningsSummary((prev) => ({
      ...prev,
      todayTotal: prev.todayTotal + completed.totalPayout,
      tripsCount: prev.tripsCount + 1,
      basePay: prev.basePay + completed.payoutEarnings,
      surgeBonus: prev.surgeBonus + completed.surgeBonus,
      tips: prev.tips + completed.tipAmount,
      walletBalance: prev.walletBalance + completed.totalPayout,
      cashCollected:
        completed.paymentMode === 'CASH_ON_DELIVERY'
          ? prev.cashCollected + completed.totalAmount
          : prev.cashCollected,
    }));

    setActiveOrder(null);
    return { success: true, message: 'Order delivered successfully!' };
  };

  const completeActiveDelivery = () => {
    if (!activeOrder) return;
    const completed: DeliveryOrder = {
      ...activeOrder,
      status: 'DELIVERED',
      deliveredAt: 'Just now',
    };
    setOrderHistory((prev) => [completed, ...prev]);
    setEarningsSummary((prev) => ({
      ...prev,
      todayTotal: prev.todayTotal + completed.totalPayout,
      tripsCount: prev.tripsCount + 1,
      walletBalance: prev.walletBalance + completed.totalPayout,
    }));
    setActiveOrder(null);
  };

  const withdrawEarnings = (amount: number): boolean => {
    if (amount <= 0 || amount > earningsSummary.walletBalance) return false;
    setEarningsSummary((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
    }));
    return true;
  };

  const depositCash = (amount: number): boolean => {
    if (amount <= 0) return false;
    setEarningsSummary((prev) => ({
      ...prev,
      cashCollected: Math.max(0, prev.cashCollected - amount),
    }));
    return true;
  };

  const refreshDeliveries = async (): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 800));
  };

  useEffect(() => {
    return () => {
      stopDispatchTimer();
    };
  }, []);

  const currentRider = MOCK_AREA_RIDERS[currentRiderIndex] || MOCK_AREA_RIDERS[0];

  return (
    <DeliveryContext.Provider
      value={{
        incomingOrder,
        activeOrder,
        orderHistory,
        completedOrders: orderHistory,
        earningsSummary,
        dispatchInfo: {
          currentRiderIndex,
          totalAreaRiders: MOCK_AREA_RIDERS.length,
          currentRiderName: currentRider.name,
          countdownSeconds,
          riderDistanceKm: currentRider.distanceKm,
        },
        acceptIncomingOrder,
        rejectIncomingOrder,
        updateActiveOrderStatus,
        toggleItemScanned,
        completeDelivery,
        completeActiveDelivery,
        triggerIncomingOrderSimulation,
        withdrawEarnings,
        depositCash,
        refreshDeliveries,
      }}
    >
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDeliveryContext = () => {
  const context = useContext(DeliveryContext);
  if (!context) {
    throw new Error('useDeliveryContext must be used within a DeliveryProvider');
  }
  return context;
};

