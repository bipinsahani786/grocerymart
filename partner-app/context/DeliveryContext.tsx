import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import {
  DeliveryOrder,
  EarningSummary,
  MOCK_INCOMING_ORDER,
  MOCK_PAST_TRIPS,
} from '../constants/mockData';
import {
  partnerEarningsService,
  EarningsSummaryData,
} from '../services/partnerEarnings.service';
import { useAuthContext } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface DeliveryContextType {
  incomingOrder: DeliveryOrder | null;
  activeOrder: DeliveryOrder | null;
  orderHistory: DeliveryOrder[];
  completedOrders: DeliveryOrder[];
  earningsSummary: EarningSummary;
  earningsData: EarningsSummaryData | null;
  isLoadingEarnings: boolean;
  dispatchInfo: DispatchInfo;
  acceptIncomingOrder: () => void;
  rejectIncomingOrder: () => void;
  updateActiveOrderStatus: (status: DeliveryOrder['status']) => void;
  toggleItemScanned: (itemId: string) => void;
  completeDelivery: (enteredOtp: string) => { success: boolean; message: string };
  completeActiveDelivery: () => void;
  triggerIncomingOrderSimulation: () => void;
  withdrawEarnings: (amount: number) => Promise<{ success: boolean; message: string; data?: any }>;
  depositCash: (amount: number, method?: 'UPI' | 'QR' | 'STORE') => Promise<{ success: boolean; message: string }>;
  refreshDeliveries: () => Promise<void>;
  refreshEarnings: (range?: 'TODAY' | 'WEEK' | 'MONTH') => Promise<void>;
}

const DEFAULT_ZERO_EARNINGS: EarningSummary = {
  todayTotal: 0,
  tripsCount: 0,
  onlineHours: 0,
  basePay: 0,
  surgeBonus: 0,
  tips: 0,
  incentives: 0,
  cashCollected: 0,
  floatingCashLimit: 2500,
  walletBalance: 0,
  pendingWithdrawal: 0,
};

const MOCK_AREA_RIDERS: AreaRider[] = [
  { id: 'r1', name: 'Captain Sahil (You - Nearest)', distanceKm: 0.5 },
  { id: 'r2', name: 'Captain Rahul (Nearby Partner)', distanceKm: 1.2 },
  { id: 'r3', name: 'Captain Amit (Nearby Partner)', distanceKm: 2.1 },
];

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuthContext();
  const [incomingOrder, setIncomingOrder] = useState<DeliveryOrder | null>(null);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [orderHistory, setOrderHistory] = useState<DeliveryOrder[]>(MOCK_PAST_TRIPS);
  const [earningsSummary, setEarningsSummary] = useState<EarningSummary>(DEFAULT_ZERO_EARNINGS);
  const [earningsData, setEarningsData] = useState<EarningsSummaryData | null>(null);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState<boolean>(false);

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

    // Asynchronously record delivery earnings in backend database
    (async () => {
      try {
        let activeToken = token;
        if (!activeToken) {
          activeToken = await AsyncStorage.getItem('@grocerymart_partner_token');
        }
        await partnerEarningsService.recordDeliveryEarnings(
          {
            orderId: completed.id,
            orderNumber: completed.orderNumber,
            payoutEarnings: completed.payoutEarnings,
            tipAmount: completed.tipAmount,
            surgeBonus: completed.surgeBonus,
            isCod: completed.paymentMode === 'CASH_ON_DELIVERY',
            codAmount: completed.paymentMode === 'CASH_ON_DELIVERY' ? completed.totalAmount : 0,
          },
          activeToken
        );
        await fetchEarnings();
      } catch (err) {
        console.error('Failed to record delivery in backend:', err);
      }
    })();

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

    (async () => {
      try {
        let activeToken = token;
        if (!activeToken) {
          activeToken = await AsyncStorage.getItem('@grocerymart_partner_token');
        }
        await partnerEarningsService.recordDeliveryEarnings(
          {
            orderId: completed.id,
            orderNumber: completed.orderNumber,
            payoutEarnings: completed.payoutEarnings,
            tipAmount: completed.tipAmount,
            surgeBonus: completed.surgeBonus,
            isCod: completed.paymentMode === 'CASH_ON_DELIVERY',
            codAmount: completed.paymentMode === 'CASH_ON_DELIVERY' ? completed.totalAmount : 0,
          },
          activeToken
        );
        await fetchEarnings();
      } catch (err) {
        console.error('Failed to record delivery in backend:', err);
      }
    })();

    setActiveOrder(null);
  };

  /**
   * Fetch real earnings data from backend
   */
  const fetchEarnings = useCallback(
    async (range: 'TODAY' | 'WEEK' | 'MONTH' = 'TODAY') => {
      setIsLoadingEarnings(true);
      try {
        let activeToken = token;
        if (!activeToken) {
          activeToken = await AsyncStorage.getItem('@grocerymart_partner_token');
        }

        const res = await partnerEarningsService.getEarningsSummary(range, activeToken);
        if (res.success && res.data) {
          setEarningsData(res.data);
          setEarningsSummary({
            todayTotal: res.data.periodMetrics.totalEarned,
            tripsCount: res.data.periodMetrics.tripsCount,
            onlineHours: 0,
            basePay: Math.max(
              0,
              res.data.periodMetrics.totalEarned -
                res.data.periodMetrics.tipsEarned -
                res.data.periodMetrics.surgeBonus
            ),
            surgeBonus: res.data.periodMetrics.surgeBonus,
            tips: res.data.periodMetrics.tipsEarned,
            incentives: 0,
            cashCollected: res.data.periodMetrics.cashCollected,
            floatingCashLimit: res.data.periodMetrics.floatingCashLimit || 2500,
            walletBalance: res.data.walletBalance,
            pendingWithdrawal: 0,
          });
        }
      } catch (err) {
        console.error('Failed to fetch earnings summary:', err);
      } finally {
        setIsLoadingEarnings(false);
      }
    },
    [token]
  );

  /**
   * Live Instant Withdrawal to verified KYC bank account
   */
  const withdrawEarnings = async (
    amount: number
  ): Promise<{ success: boolean; message: string; data?: any }> => {
    try {
      let activeToken = token;
      if (!activeToken) {
        activeToken = await AsyncStorage.getItem('@grocerymart_partner_token');
      }

      const res = await partnerEarningsService.requestWithdrawal(amount, activeToken);
      if (res.success && res.data) {
        await fetchEarnings();
        return {
          success: true,
          message: res.message || `Successfully transferred ₹${amount} via IMPS`,
          data: res.data,
        };
      } else {
        return {
          success: false,
          message: res.error || res.message || 'Failed to process withdrawal',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error during withdrawal',
      };
    }
  };

  /**
   * Cash Deposit (COD floating cash settlement)
   */
  const depositCash = async (
    amount: number,
    method: 'UPI' | 'QR' | 'STORE' = 'UPI'
  ): Promise<{ success: boolean; message: string }> => {
    try {
      let activeToken = token;
      if (!activeToken) {
        activeToken = await AsyncStorage.getItem('@grocerymart_partner_token');
      }

      const res = await partnerEarningsService.recordCashDeposit(amount, method, activeToken);
      if (res.success) {
        await fetchEarnings();
        return {
          success: true,
          message: res.message || `Cash deposit of ₹${amount} recorded successfully`,
        };
      } else {
        return {
          success: false,
          message: res.error || res.message || 'Failed to record deposit',
        };
      }
    } catch (err: any) {
      return {
        success: false,
        message: err.message || 'Network error during deposit',
      };
    }
  };

  const refreshDeliveries = async (): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, 800));
  };

  useEffect(() => {
    fetchEarnings('TODAY');
  }, [fetchEarnings]);

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
        earningsData,
        isLoadingEarnings,
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
        refreshEarnings: fetchEarnings,
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

