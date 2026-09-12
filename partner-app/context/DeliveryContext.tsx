import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import {
  DeliveryOrder,
  EarningSummary,
} from '../constants/mockData';
import {
  partnerEarningsService,
  EarningsSummaryData,
} from '../services/partnerEarnings.service';
import { partnerOrdersService } from '../services/partnerOrders.service';
import { useAuthContext } from './AuthContext';
import { useDutyContext } from './DutyContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  rejectIncomingOrder: (overrideId?: string, reason?: string) => void;
  updateActiveOrderStatus: (status: DeliveryOrder['status']) => void;
  toggleItemScanned: (itemId: string) => void;
  completeDelivery: (enteredOtp: string) => Promise<{ success: boolean; message: string }>;
  completeActiveDelivery: () => void;
  clearActiveDelivery: () => void;
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

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export const DeliveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuthContext();
  const { isOnline, liveCoords } = useDutyContext();

  const [incomingOrder, setIncomingOrder] = useState<DeliveryOrder | null>(null);
  const [activeOrder, setActiveOrder] = useState<DeliveryOrder | null>(null);
  const [completedOrders, setCompletedOrders] = useState<DeliveryOrder[]>([]);
  const [earningsSummary, setEarningsSummary] = useState<EarningSummary>(DEFAULT_ZERO_EARNINGS);
  const [earningsData, setEarningsData] = useState<EarningsSummaryData | null>(null);
  const [isLoadingEarnings, setIsLoadingEarnings] = useState<boolean>(false);

  // Countdown timer for incoming order dispatch offer (30s)
  const [countdownSeconds, setCountdownSeconds] = useState(30);
  const timerRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      stopDispatchTimer();
    };
  }, []);

  const stopDispatchTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startDispatchTimer = (orderId: string) => {
    stopDispatchTimer();
    setCountdownSeconds(30);

    timerRef.current = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          stopDispatchTimer();
          // Timeout -> Automatically reject and pass order to next rider
          rejectIncomingOrder(orderId, 'Offer timed out');
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Reject / Pass incoming order to next online rider
   */
  const rejectIncomingOrder = async (overrideId?: string, reason = 'Rider passed order') => {
    stopDispatchTimer();
    const targetOrderId = overrideId || incomingOrder?.id;
    setIncomingOrder(null);

    if (targetOrderId) {
      try {
        const activeToken = token || (await AsyncStorage.getItem('@grocerymart_partner_token'));
        await partnerOrdersService.rejectOrder(targetOrderId, reason, activeToken);
      } catch (err) {
        console.error('Failed to reject order on backend:', err);
      }
    }
  };

  /**
   * Accept incoming order
   */
  const acceptIncomingOrder = async () => {
    stopDispatchTimer();
    if (!incomingOrder || !incomingOrder.id) {
      setIncomingOrder(null);
      return;
    }
    const targetOrderId = incomingOrder.id;

    try {
      const activeToken = token || (await AsyncStorage.getItem('@grocerymart_partner_token'));
      const res = await partnerOrdersService.acceptOrder(targetOrderId, activeToken);
      if (res.success && res.data && res.data.id) {
        const orderData = res.data;
        orderData.items = orderData.items || [];
        setActiveOrder(orderData);
      } else {
        setIncomingOrder(null);
      }
    } catch (err) {
      console.error('Failed to accept order on backend:', err);
      setIncomingOrder(null);
    } finally {
      setIncomingOrder(null);
    }
  };

  /**
   * Update active order status
   */
  const updateActiveOrderStatus = async (status: DeliveryOrder['status']) => {
    if (!activeOrder) return;
    setActiveOrder((prev) => (prev ? { ...prev, status } : null));

    try {
      const activeToken = token || (await AsyncStorage.getItem('@grocerymart_partner_token'));
      const res = await partnerOrdersService.updateOrderStatus(activeOrder.id, status, activeToken);
      if (res.success && res.data) {
        setActiveOrder(res.data);
      }
    } catch (err) {
      console.error('Failed to sync status to backend:', err);
    }
  };

  const toggleItemScanned = (itemId: string) => {
    if (!activeOrder) return;
    setActiveOrder((prev) => {
      if (!prev) return null;
      const currentItems = prev.items || [];
      const updatedItems = currentItems.map((item) =>
        item.id === itemId ? { ...item, scanned: !item.scanned } : item
      );
      return { ...prev, items: updatedItems };
    });
  };

  /**
   * Verify delivery OTP and complete order
   */
  const completeDelivery = async (
    enteredOtp: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!activeOrder) {
      return { success: false, message: 'No active delivery order found' };
    }

    try {
      const activeToken = token || (await AsyncStorage.getItem('@grocerymart_partner_token'));
      const res = await partnerOrdersService.completeDelivery(
        activeOrder.id,
        enteredOtp,
        activeToken
      );

      if (res.success && res.data) {
        const delivered = res.data;
        setCompletedOrders((prev) => [delivered, ...prev.filter((o) => o.id !== delivered.id)]);
        setActiveOrder(null);
        await fetchEarnings();
        return { success: true, message: 'Order delivered successfully!' };
      } else {
        const errMsg = String(res.error || res.message || '');
        if (errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('already')) {
          setActiveOrder(null);
          return { success: true, message: 'Order cleared from dashboard.' };
        }
        return {
          success: false,
          message: errMsg || 'Invalid OTP! Please check with customer.',
        };
      }
    } catch (err: any) {
      const errMsg = String(err.message || '');
      if (errMsg.toLowerCase().includes('not found') || errMsg.toLowerCase().includes('already')) {
        setActiveOrder(null);
        return { success: true, message: 'Order cleared from dashboard.' };
      }
      return {
        success: false,
        message: errMsg || 'Verification error',
      };
    }
  };

  const completeActiveDelivery = async () => {
    if (!activeOrder) return;
    await completeDelivery(activeOrder.otp || '1234');
  };

  const clearActiveDelivery = () => {
    setActiveOrder(null);
  };

  /**
   * Fetch active orders and completed trips from backend
   */
  const refreshDeliveries = useCallback(async (): Promise<void> => {
    try {
      const activeToken = token || (await AsyncStorage.getItem('@grocerymart_partner_token'));
      if (!activeToken) return;

      // 1. Fetch active ongoing order
      const activeRes = await partnerOrdersService.getActiveOrder(activeToken);
      if (isMountedRef.current) {
        if (activeRes.success && activeRes.data && activeRes.data.id) {
          const orderData = activeRes.data;
          orderData.items = orderData.items || [];
          setActiveOrder(orderData);
        } else {
          setActiveOrder(null);
        }
      }

      // 2. Fetch completed trips history
      const tripsRes = await partnerOrdersService.getCompletedTrips(activeToken);
      if (isMountedRef.current && tripsRes.success && tripsRes.data) {
        setCompletedOrders(tripsRes.data);
      }
    } catch (err) {
      console.error('Failed to refresh deliveries:', err);
    }
  }, [token]);

  /**
   * Real-Time Incoming Order Polling:
   * When rider is online, not on an active delivery, and no popup is active,
   * poll backend for incoming orders matching rider's location.
   */
  useEffect(() => {
    if (!isOnline || activeOrder || incomingOrder) {
      return;
    }

    let isSubscribed = true;

    const pollIncoming = async () => {
      try {
        const activeToken = token || (await AsyncStorage.getItem('@grocerymart_partner_token'));
        if (!activeToken) return;

        const res = await partnerOrdersService.getIncomingOrder(liveCoords, activeToken);
        if (isSubscribed && isMountedRef.current && res.success && res.data && res.data.id) {
          setIncomingOrder(res.data);
          startDispatchTimer(res.data.id);
        } else if (isSubscribed && isMountedRef.current) {
          setIncomingOrder(null);
        }
      } catch (err) {
        // Silent catch for background polling
      }
    };

    // Immediate check
    pollIncoming();

    // Poll every 5 seconds
    const interval = setInterval(pollIncoming, 5000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [isOnline, activeOrder, incomingOrder, token, liveCoords?.lat, liveCoords?.lng]);

  /**
   * Fetch real earnings data from backend
   */
  const fetchEarnings = useCallback(
    async (range: 'TODAY' | 'WEEK' | 'MONTH' = 'TODAY') => {
      if (isMountedRef.current) setIsLoadingEarnings(true);
      try {
        let activeToken = token;
        if (!activeToken) {
          activeToken = await AsyncStorage.getItem('@grocerymart_partner_token');
        }

        const res = await partnerEarningsService.getEarningsSummary(range, activeToken);
        if (isMountedRef.current && res.success && res.data) {
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
        if (isMountedRef.current) setIsLoadingEarnings(false);
      }
    },
    [token]
  );

  /**
   * Instant Withdrawal
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

  // Immediate poll trigger (replaces mock simulation trigger)
  const triggerIncomingOrderSimulation = () => {
    refreshDeliveries();
  };

  useEffect(() => {
    fetchEarnings('TODAY');
    refreshDeliveries();
  }, [fetchEarnings, refreshDeliveries]);

  useEffect(() => {
    return () => {
      stopDispatchTimer();
    };
  }, []);

  return (
    <DeliveryContext.Provider
      value={{
        incomingOrder,
        activeOrder,
        orderHistory: completedOrders,
        completedOrders,
        earningsSummary,
        earningsData,
        isLoadingEarnings,
        dispatchInfo: {
          currentRiderIndex: 0,
          totalAreaRiders: 1,
          currentRiderName: user?.name ? `Captain ${user.name} (You)` : 'You (Nearest Captain)',
          countdownSeconds,
          riderDistanceKm: incomingOrder?.storeDistanceKm || 0.8,
        },
        acceptIncomingOrder,
        rejectIncomingOrder,
        updateActiveOrderStatus,
        toggleItemScanned,
        completeDelivery,
        completeActiveDelivery,
        clearActiveDelivery,
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
