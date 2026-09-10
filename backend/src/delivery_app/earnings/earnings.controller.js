import { earningsService } from "./earnings.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class EarningsController {
  /**
   * Get full partner earnings summary, period metrics, weekly trend, and ledger
   */
  getEarningsSummary = catchAsync(async (req, res) => {
    const range = (req.query.range || "TODAY").toUpperCase();
    const summary = await earningsService.getEarningsSummary(req.user.id, range);
    res.status(200).json({
      success: true,
      message: "Earnings summary fetched successfully",
      data: summary,
    });
  });

  /**
   * Instant withdrawal to partner's verified KYC bank account
   */
  withdrawEarnings = catchAsync(async (req, res) => {
    const { amount } = req.body;
    const result = await earningsService.processWithdrawal(req.user.id, amount);
    res.status(200).json(result);
  });

  /**
   * Record partner cash deposit (COD settlement)
   */
  depositCash = catchAsync(async (req, res) => {
    const result = await earningsService.processCashDeposit(req.user.id, req.body);
    res.status(200).json(result);
  });

  /**
   * Record earnings when a delivery is completed
   */
  recordDeliveryEarnings = catchAsync(async (req, res) => {
    const result = await earningsService.recordDeliveryEarnings(req.user.id, req.body);
    res.status(200).json(result);
  });
}

export const earningsController = new EarningsController();
