import express from "express";
import { disputesController } from "./disputes.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { resolveDisputeSchema } from "./disputes.schema.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/disputes:
 *   get:
 *     summary: Admin - List Dispute Tickets
 *     description: Retrieve all dispute tickets raised by drivers or owners with booking and parking details.
 *     tags: [Admin Dispute Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: List of disputes retrieved successfully
 */
router.get("/", disputesController.getDisputes);

/**
 * @openapi
 * /api/admin/disputes/{id}/resolve:
 *   put:
 *     summary: Admin - Resolve Dispute Ticket
 *     description: Resolve an open dispute ticket. If a refund is authorized, it automatically credits the driver's wallet balance and creates a refund transaction log.
 *     tags: [Admin Dispute Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [resolution, adminNote]
 *             properties:
 *               resolution: { type: string, enum: [full_refund, partial_refund, no_refund, owner_penalty], example: "full_refund" }
 *               refundAmount: { type: number, example: 100.00 }
 *               adminNote: { type: string, example: "Approved full refund due to parking gate being locked." }
 *     responses:
 *       200:
 *         description: Dispute resolved successfully
 */
router.put("/:id/resolve", validate(resolveDisputeSchema), disputesController.resolveDispute);

export default router;
