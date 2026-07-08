import express from "express";
import { settingsController } from "./settings.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { updatePlatformSettingsSchema } from "./settings.schema.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/settings:
 *   get:
 *     summary: Admin - Get Global Platform Settings
 *     description: Retrieve global commission, cancellation fee, and penalty rates.
 *     tags: [Admin Platform Settings]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Platform settings retrieved successfully
 *   put:
 *     summary: Admin - Update Global Platform Settings
 *     description: Modify global commission rates, cancellation percentages, and overstay multipliers.
 *     tags: [Admin Platform Settings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [platformCommissionRate, cancellationFeeRate, overstayPenaltyRate]
 *             properties:
 *               platformCommissionRate: { type: number, example: 0.15 }
 *               cancellationFeeRate: { type: number, example: 0.05 }
 *               overstayPenaltyRate: { type: number, example: 1.5 }
 *     responses:
 *       200:
 *         description: Settings updated successfully
 */
router.get("/", settingsController.getPlatformSettings);
router.put("/", validate(updatePlatformSettingsSchema), settingsController.updatePlatformSettings);

export default router;
