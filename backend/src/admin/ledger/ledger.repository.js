import { prisma } from "../../../config/prisma.js";

export class LedgerRepository {
  async getTransactionAuditLedger(filters, options = {}) {
    const { skip, take } = options;
    return await prisma.walletTxn.findMany({
      where: filters,
      include: {
        user: {
          select: { name: true, phone: true, email: true, userType: true },
        },
      },
      orderBy: { createdAt: "desc" },
      ...(skip !== undefined && { skip }),
      ...(take !== undefined && { take }),
    });
  }

  async countTransactions(filters) {
    return await prisma.walletTxn.count({
      where: filters,
    });
  }

  async deleteTransaction(id) {
    return await prisma.walletTxn.delete({
      where: { id },
    });
  }
}

export const ledgerRepository = new LedgerRepository();
