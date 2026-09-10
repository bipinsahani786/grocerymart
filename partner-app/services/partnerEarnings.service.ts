import { apiClient, ApiResponse } from './apiClient';
import { API_CONFIG } from '../config/api';

export interface WeeklyTrendItem {
  day: string;
  date: string;
  amount: number;
}

export interface LedgerItem {
  id: string;
  title: string;
  amount: string;
  rawAmount: number;
  type: string;
  isDebit: boolean;
  time: string;
  createdAt: string;
}

export interface BankDetails {
  isConfigured: boolean;
  holderName: string;
  maskedAccountNumber: string;
  ifsc: string;
  panNumber: string;
  bankName: string;
}

export interface EarningsPeriodMetrics {
  totalEarned: number;
  tripsCount: number;
  tipsEarned: number;
  surgeBonus: number;
  cashCollected: number;
  floatingCashLimit: number;
}

export interface EarningsSummaryData {
  walletBalance: number;
  totalLifetimeEarnings: number;
  totalLifetimeDeliveries: number;
  activeRange: 'TODAY' | 'WEEK' | 'MONTH';
  periodMetrics: EarningsPeriodMetrics;
  weeklyTrend: WeeklyTrendItem[];
  ledger: LedgerItem[];
  bankDetails: BankDetails;
}

export interface WithdrawalResult {
  transactionId: string;
  amount: number;
  newWalletBalance: number;
  reference: string;
  payoutTo: {
    holderName: string;
    maskedAccount: string;
    ifsc: string;
  };
}

class PartnerEarningsService {
  /**
   * Fetch complete earnings summary, time-range telemetry, weekly trend, and ledger
   */
  async getEarningsSummary(
    range: 'TODAY' | 'WEEK' | 'MONTH' = 'TODAY',
    token?: string | null
  ): Promise<ApiResponse<EarningsSummaryData>> {
    return await apiClient.get<EarningsSummaryData>(API_CONFIG.ENDPOINTS.PARTNER.EARNINGS_SUMMARY, {
      token,
      params: { range },
    });
  }

  /**
   * Request instant payout to registered bank account
   */
  async requestWithdrawal(
    amount: number,
    token?: string | null
  ): Promise<ApiResponse<WithdrawalResult>> {
    return await apiClient.post<WithdrawalResult>(
      API_CONFIG.ENDPOINTS.PARTNER.EARNINGS_WITHDRAW,
      { amount },
      { token }
    );
  }

  /**
   * Deposit floating COD cash (settlement)
   */
  async recordCashDeposit(
    amount: number,
    method: 'UPI' | 'QR' | 'STORE' = 'UPI',
    token?: string | null
  ): Promise<ApiResponse<any>> {
    return await apiClient.post(
      API_CONFIG.ENDPOINTS.PARTNER.EARNINGS_DEPOSIT,
      { amount, method },
      { token }
    );
  }

  /**
   * Record earnings upon delivery completion in backend database
   */
  async recordDeliveryEarnings(
    payload: {
      orderId?: string;
      orderNumber?: string;
      payoutEarnings: number;
      tipAmount: number;
      surgeBonus: number;
      isCod?: boolean;
      codAmount?: number;
    },
    token?: string | null
  ): Promise<ApiResponse<{ newWalletBalance: number }>> {
    return await apiClient.post(
      API_CONFIG.ENDPOINTS.PARTNER.EARNINGS_RECORD_DELIVERY,
      payload,
      { token }
    );
  }
}

export const partnerEarningsService = new PartnerEarningsService();
