import { earningsRepository } from "./earnings.repository.js";
import { AppError } from "../../utils/AppError.js";

export class EarningsService {
  /**
   * Helper to compute start & end timestamps for time ranges
   */
  getRangeDateBoundaries(range = "TODAY") {
    const now = new Date();
    let startDate = new Date(now);

    if (range === "WEEK") {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "MONTH") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    } else {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    }

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }

  /**
   * Format friendly timestamp for display
   */
  formatLedgerTime(date) {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    const timeStr = d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    if (isToday) return `Today • ${timeStr}`;
    if (isYesterday) return `Yesterday • ${timeStr}`;

    const dateStr = d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
    return `${dateStr} • ${timeStr}`;
  }

  /**
   * Get complete partner earnings summary, period metrics, weekly trend, and ledger
   */
  async getEarningsSummary(userId, range = "TODAY") {
    // 1. Fetch user & rider profile
    const user = await earningsRepository.findUserWallet(userId);
    if (!user) {
      throw new AppError("Partner user not found", 404);
    }

    let rider = await earningsRepository.findRiderByUserId(userId);
    if (!rider) {
      rider = await earningsRepository.ensureRiderRecord(userId);
    }

    const { startDate, endDate } = this.getRangeDateBoundaries(range);

    // 2. Fetch all ledgers for this user within range
    const rangeLedgers = await earningsRepository.findRangeLedgers(userId, startDate, endDate);

    let periodEarned = 0;
    let periodTrips = 0;
    let periodTips = 0;
    let periodSurge = 0;

    for (const entry of rangeLedgers) {
      if (entry.type === "EARNING" || entry.type === "CREDIT") {
        periodEarned += Math.max(0, entry.amount);
        periodTrips += 1;
      } else if (entry.type === "TIP") {
        periodEarned += Math.max(0, entry.amount);
        periodTips += Math.max(0, entry.amount);
      } else if (entry.type === "BONUS") {
        periodEarned += Math.max(0, entry.amount);
        periodSurge += Math.max(0, entry.amount);
      }
    }

    // 3. Floating COD Cash Calculation
    const allCashLedgers = await earningsRepository.findCashLedgers(userId);

    let netCashCollected = 0;
    for (const entry of allCashLedgers) {
      if (entry.type === "CASH_COLLECTED") {
        netCashCollected += Math.max(0, entry.amount);
      } else if (entry.type === "CASH_DEPOSIT") {
        netCashCollected = Math.max(0, netCashCollected - Math.abs(entry.amount));
      }
    }

    // 4. Weekly Trend (Monday to Sunday of current week)
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekLedgers = await earningsRepository.findWeeklyLedgers(userId, monday, sunday);

    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyTrend = dayLabels.map((label, index) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + index);

      const dayTotal = weekLedgers
        .filter((entry) => {
          const entryDate = new Date(entry.createdAt);
          return (
            entryDate.getDate() === dayDate.getDate() &&
            entryDate.getMonth() === dayDate.getMonth() &&
            entryDate.getFullYear() === dayDate.getFullYear()
          );
        })
        .reduce((sum, entry) => sum + Math.max(0, entry.amount), 0);

      return {
        day: label,
        date: dayDate.toISOString().split("T")[0],
        amount: Math.round(dayTotal),
      };
    });

    // 5. Recent Transaction History (Ledger)
    const recentLedgers = await earningsRepository.findRecentLedgers(userId, 25);

    const formattedLedger = recentLedgers.map((item) => {
      const isDebit = item.type === "WITHDRAWAL" || item.amount < 0;
      const absAmount = Math.abs(item.amount);

      let title = item.description || "Partner Transaction";
      if (item.type === "EARNING") {
        title = item.description || "Trip Earnings";
      } else if (item.type === "TIP") {
        title = item.description || "Customer Tip (100% Direct)";
      } else if (item.type === "BONUS") {
        title = item.description || "Surge / Quest Bonus";
      } else if (item.type === "WITHDRAWAL") {
        title = item.description || "IMPS Bank Payout";
      } else if (item.type === "CASH_COLLECTED") {
        title = item.description || "COD Cash Collected";
      } else if (item.type === "CASH_DEPOSIT") {
        title = item.description || "COD Cash Deposit";
      }

      return {
        id: item.id,
        title,
        amount: `${isDebit ? "-" : "+"}₹${absAmount.toFixed(2)}`,
        rawAmount: absAmount,
        type: item.type,
        isDebit,
        time: this.formatLedgerTime(item.createdAt),
        createdAt: item.createdAt,
      };
    });

    // 6. Bank Details Check
    const hasBank = Boolean(rider.bankAccountNumber && rider.bankIfsc);
    const maskedAccountNumber = rider.bankAccountNumber
      ? `••••${rider.bankAccountNumber.slice(-4)}`
      : "";

    return {
      walletBalance: Number((user.walletBalance || 0).toFixed(2)),
      totalLifetimeEarnings: Number((rider.totalEarnings || 0).toFixed(2)),
      totalLifetimeDeliveries: rider.totalDeliveries || 0,
      activeRange: range,
      periodMetrics: {
        totalEarned: Number(periodEarned.toFixed(2)),
        tripsCount: periodTrips,
        tipsEarned: Number(periodTips.toFixed(2)),
        surgeBonus: Number(periodSurge.toFixed(2)),
        cashCollected: Number(netCashCollected.toFixed(2)),
        floatingCashLimit: 2500,
      },
      weeklyTrend,
      ledger: formattedLedger,
      bankDetails: {
        isConfigured: hasBank,
        holderName: rider.bankHolderName || "",
        maskedAccountNumber,
        ifsc: rider.bankIfsc || "",
        panNumber: rider.panNumber || "",
        bankName: rider.bankHolderName ? "Primary Bank A/C" : "Not Linked",
      },
    };
  }

  /**
   * Process Instant Bank Withdrawal
   */
  async processWithdrawal(userId, amount) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new AppError("Please enter a valid withdrawal amount", 400);
    }

    const user = await earningsRepository.findUserWallet(userId);
    if (!user) {
      throw new AppError("Partner user not found", 404);
    }

    const rider = await earningsRepository.findRiderByUserId(userId);
    if (!rider || !rider.bankAccountNumber || !rider.bankIfsc) {
      throw new AppError(
        "Please link and verify your Bank Account in Profile KYC before withdrawing",
        400
      );
    }

    if (user.walletBalance < numAmount) {
      throw new AppError(
        `Insufficient balance. Available withdrawable balance is ₹${user.walletBalance.toFixed(2)}`,
        400
      );
    }

    const maskedAcc = `••••${rider.bankAccountNumber.slice(-4)}`;
    const payoutDesc = `IMPS Payout to ${rider.bankHolderName || "Bank"} (A/C: ${maskedAcc}, IFSC: ${rider.bankIfsc})`;

    const result = await earningsRepository.executeWithdrawal(userId, numAmount, payoutDesc);

    return {
      success: true,
      message: `Successfully transferred ₹${numAmount.toFixed(2)} to ${rider.bankHolderName || "Bank"} (${maskedAcc})!`,
      data: {
        transactionId: result.ledger.id,
        amount: numAmount,
        newWalletBalance: Number(result.updatedUser.walletBalance.toFixed(2)),
        reference: `IMPS${Date.now().toString().slice(-8)}`,
        payoutTo: {
          holderName: rider.bankHolderName,
          maskedAccount: maskedAcc,
          ifsc: rider.bankIfsc,
        },
      },
    };
  }

  /**
   * Process Cash Deposit (COD settlement)
   */
  async processCashDeposit(userId, { amount, method = "UPI", referenceId }) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new AppError("Please enter a valid deposit amount", 400);
    }

    const depositDesc = `COD Cash Deposit via ${method}${referenceId ? ` (Ref: ${referenceId})` : ""}`;

    const ledger = await earningsRepository.createLedgerEntry({
      userId,
      amount: -numAmount,
      type: "CASH_DEPOSIT",
      description: depositDesc,
    });

    return {
      success: true,
      message: `Cash deposit of ₹${numAmount.toFixed(2)} recorded successfully`,
      data: {
        transactionId: ledger.id,
        amount: numAmount,
        method,
      },
    };
  }

  /**
   * Record earnings when a delivery is completed
   */
  async recordDeliveryEarnings(userId, payload) {
    const {
      orderId,
      orderNumber,
      payoutEarnings = 60,
      tipAmount = 0,
      surgeBonus = 0,
      isCod = false,
      codAmount = 0,
    } = payload;

    const payout = Number(payoutEarnings) || 0;
    const tip = Number(tipAmount) || 0;
    const surge = Number(surgeBonus) || 0;
    const orderTag = orderNumber || (orderId ? String(orderId).slice(-6) : "DEL");

    const updatedUser = await earningsRepository.executeDeliveryEarnings(userId, {
      payout,
      tip,
      surge,
      isCod,
      codAmount: Number(codAmount) || 0,
      orderTag,
    });

    const totalCredits = payout + tip + surge;

    return {
      success: true,
      message: `Delivery earnings of ₹${totalCredits.toFixed(2)} credited successfully`,
      newWalletBalance: Number(updatedUser.walletBalance.toFixed(2)),
    };
  }
}

export const earningsService = new EarningsService();
