import { ledgerRepository } from "./ledger.repository.js";

export class LedgerService {
  async getTransactionLedger(query) {
    const filters = {};
    if (query.userId) filters.userId = query.userId;
    if (query.type) filters.type = query.type;
    if (query.referenceType) filters.referenceType = query.referenceType;

    const search = query.search || "";
    if (search) {
      filters.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
        { referenceId: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    const page = parseInt(query.page, 10) || 1;
    const limit = parseInt(query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [ledger, total] = await Promise.all([
      ledgerRepository.getTransactionAuditLedger(filters, { skip, take: limit }),
      ledgerRepository.countTransactions(filters),
    ]);

    return {
      success: true,
      data: ledger,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      message: "Transaction audit ledger retrieved successfully",
    };
  }

  async deleteTransaction(id) {
    const deleted = await ledgerRepository.deleteTransaction(id);
    return {
      success: true,
      data: deleted,
      message: "Transaction record deleted successfully",
    };
  }
}

export const ledgerService = new LedgerService();
