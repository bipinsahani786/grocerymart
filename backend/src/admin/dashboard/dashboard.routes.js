import express from "express";
import { dashboardController } from "./dashboard.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Super Admin - Dashboard Overview Stats
 *     description: Retrieve high-level platform statistics including total user counts and recently registered accounts.
 *     tags: [Admin Dashboard]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 */
router.get("/stats", dashboardController.getStats);


export default router;
