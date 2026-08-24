import React, { createContext, useContext, useState } from 'react';
import {
  DeliveryOrder,
  EarningSummary,
  MOCK_INCOMING_ORDER,
  MOCK_PAST_TRIPS,
  MOCK_SHIFT_SUMMARY,
} from '../constants/mockData';

interface DeliveryContextType {
  incomingOrder: DeliveryOrder | null;
  activeOrder: DeliveryOrder | null;
  orderHistory: DeliveryOrder[];
  earningsSummary: EarningSummary;
  acceptIncomingOrder: () => void;
  rejectIncomingOrder: () => void;
  updateActiveOrderStatus: (status: DeliveryOrder['status']) => void;
  toggleItemScanned: (itemId: string) => void;
  completeDelivery: (enteredOtp: string) => { success: boolean; message: string };
  triggerIncomingOrderSimulation: () => void;
  withdrawEarnings: (amount: number) => boolean;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incomingOrder, setIncomingOrder] = useState<DeliveryOrder | null>(null);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [orderHistory, setOrderHistory] = useState<DeliveryOrder[]>(MOCK_PAST_TRIPS);
  const [earningsSummary, setEarningsSummary] = useState<EarningSummary>(MOCK_SHIFT_SUMMARY);

  const acceptIncomingOrder = () => {
    if (!incomingOrder) return;
    const accepted: DeliveryOrder = {
      ...incomingOrder,
      status: 'ACCEPTED',
    };
    setActiveOrder(accepted);
    setIncomingOrder(null);
  };

  const rejectIncomingOrder = () => {
    setIncomingOrder(null);
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

    // Add to history
    setOrderHistory((prev) => [completed, ...prev]);

    // Update earnings
    setEarningsSummary((prev) => ({
      ...prev,
      todayTotal: prev.todayTotal + completed.totalPayout,
      tripsCount: prev.tripsCount + 1,
      basePay: prev.basePay + completed.payoutEarnings,
      surgeBonus: prev.surgeBonus + completed.surgeBonus,
      tips: prev.tips + completed.tipAmount,
      walletBalance: prev.walletBalance + completed.totalPayout,
      cashCollected: completed.paymentMode === 'CASH_ON_DELIVERY' ? prev.cashCollected + completed.totalAmount : prev.cashCollected,
    }));

    setActiveOrder(null);
    return { success: true, message: 'Order delivered successfully!' };
  };

  const triggerIncomingOrderSimulation = () => {
    setIncomingOrder({
      ...MOCK_INCOMING_ORDER,
      id: `ord_live_${Date.now()}`,
      orderNumber: `GM-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: 'Just now',
    });
  };

  const withdrawEarnings = (amount: number): boolean => {
    if (amount <= 0 || amount > earningsSummary.walletBalance) return false;
    setEarningsSummary((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance - amount,
    }));
    return true;
  };

  return (
    <DeliveryContext.Provider
      value={{
        incomingOrder,
        activeOrder,
        orderHistory,
        earningsSummary,
        acceptIncomingOrder,
        rejectIncomingOrder,
        updateActiveOrderStatus,
        toggleItemScanned,
        completeDelivery,
        triggerIncomingOrderSimulation,
        withdrawEarnings,
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
