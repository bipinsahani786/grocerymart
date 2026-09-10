import express from "express";
import { earningsController } from "./earnings.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @openapi
 * /api/partner/earnings/summary:
 *   get:
 *     summary: Get Delivery Partner Earnings Summary
 *     tags: [Delivery Partner - Earnings]
 *     security:
 *       - BearerAuth: []
 */
router.get("/summary", verifyToken, earningsController.getEarningsSummary);

/**
 * @openapi
 * /api/partner/earnings/withdraw:
 *   post:
 *     summary: Request Instant Bank Payout via IMPS
 *     tags: [Delivery Partner - Earnings]
 *     security:
 *       - BearerAuth: []
 */
router.post("/withdraw", verifyToken, earningsController.withdrawEarnings);

/**
 * @openapi
 * /api/partner/earnings/deposit:
 *   post:
 *     summary: Record COD Cash Settlement Deposit
 *     tags: [Delivery Partner - Earnings]
 *     security:
 *       - BearerAuth: []
 */
router.post("/deposit", verifyToken, earningsController.depositCash);

/**
 * @openapi
 * /api/partner/earnings/record-delivery:
 *   post:
 *     summary: Credit Delivery Earnings to Partner Wallet
 *     tags: [Delivery Partner - Earnings]
 *     security:
 *       - BearerAuth: []
 */
router.post("/record-delivery", verifyToken, earningsController.recordDeliveryEarnings);

export default router;
