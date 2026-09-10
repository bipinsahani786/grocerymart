import { prisma } from "../../../config/prisma.js";

export class EarningsRepository {
  /**
   * Find user wallet balance
   */
  async findUserWallet(userId) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, walletBalance: true },
    });
  }

  /**
   * Find partner rider record with bank details and metrics
   */
  async findRiderByUserId(userId) {
    return await prisma.rider.findUnique({
      where: { userId },
    });
  }

  /**
   * Ensure rider record exists for user
   */
  async ensureRiderRecord(userId) {
    let rider = await prisma.rider.findUnique({ where: { userId } });
    if (!rider) {
      rider = await prisma.rider.create({
        data: {
          userId,
          kycStatus: "PENDING",
          isActive: true,
        },
      });
    }
    return rider;
  }

  /**
   * Get ledger entries within date boundary
   */
  async findRangeLedgers(userId, startDate, endDate) {
    return await prisma.creditLedger.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get all cash collected and deposited ledgers to compute floating cash
   */
  async findCashLedgers(userId) {
    return await prisma.creditLedger.findMany({
      where: {
        userId,
        type: { in: ["CASH_COLLECTED", "CASH_DEPOSIT"] },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Get credits for weekly trend
   */
  async findWeeklyLedgers(userId, monday, sunday) {
    return await prisma.creditLedger.findMany({
      where: {
        userId,
        type: { in: ["EARNING", "TIP", "BONUS", "CREDIT"] },
        createdAt: {
          gte: monday,
          lte: sunday,
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * Get recent transaction ledger records
   */
  async findRecentLedgers(userId, limit = 25) {
    return await prisma.creditLedger.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * Atomic withdrawal execution
   */
  async executeWithdrawal(userId, amount, description) {
    return await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            decrement: amount,
          },
        },
        select: { walletBalance: true },
      });

      const ledger = await tx.creditLedger.create({
        data: {
          userId,
          amount: -amount,
          type: "WITHDRAWAL",
          description,
        },
      });

      return { updatedUser, ledger };
    });
  }

  /**
   * Create generic credit ledger entry
   */
  async createLedgerEntry({ userId, amount, type, description }) {
    return await prisma.creditLedger.create({
      data: {
        userId,
        amount,
        type,
        description,
      },
    });
  }

  /**
   * Atomic delivery earnings crediting
   */
  async executeDeliveryEarnings(userId, { payout, tip, surge, isCod, codAmount, orderTag }) {
    const totalCredits = payout + tip + surge;

    return await prisma.$transaction(async (tx) => {
      // 1. Update wallet
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          walletBalance: {
            increment: totalCredits,
          },
        },
        select: { walletBalance: true },
      });

      // 2. Update rider lifetime totals
      await tx.rider.update({
        where: { userId },
        data: {
          totalEarnings: { increment: totalCredits },
          totalDeliveries: { increment: 1 },
        },
      });

      // 3. Base payout ledger
      if (payout > 0) {
        await tx.creditLedger.create({
          data: {
            userId,
            amount: payout,
            type: "EARNING",
            description: `Trip Earnings (Order #${orderTag})`,
          },
        });
      }

      // 4. Tip ledger
      if (tip > 0) {
        await tx.creditLedger.create({
          data: {
            userId,
            amount: tip,
            type: "TIP",
            description: `Customer Tip (Order #${orderTag})`,
          },
        });
      }

      // 5. Surge bonus ledger
      if (surge > 0) {
        await tx.creditLedger.create({
          data: {
            userId,
            amount: surge,
            type: "BONUS",
            description: `Surge Bonus (Order #${orderTag})`,
          },
        });
      }

      // 6. Cash collected ledger
      if (isCod && codAmount > 0) {
        await tx.creditLedger.create({
          data: {
            userId,
            amount: codAmount,
            type: "CASH_COLLECTED",
            description: `COD Cash Collected (Order #${orderTag})`,
          },
        });
      }

      return updatedUser;
    });
  }
}

export const earningsRepository = new EarningsRepository();
