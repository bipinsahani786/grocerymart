import express from "express";
import { dbController } from "./db.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/db/addon-bookings:
 *   get:
 *     summary: Admin - List Add-on Service Bookings
 *     description: Retrieve a global paginated list of add-on service bookings across all parking locations.
 *     tags: [Admin Database Views]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by add-on name, service level, or driver name.
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, in_progress, completed] }
 *     responses:
 *       200:
 *         description: Add-on service bookings retrieved successfully
 */
router.get("/addon-bookings", dbController.getAddonBookings);

/**
 * @openapi
 * /api/admin/db/custom-addons:
 *   get:
 *     summary: Admin - List Custom Add-on Services
 *     description: Retrieve a global paginated list of custom add-on services configured by parking owners.
 *     tags: [Admin Database Views]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by add-on name or description.
 *     responses:
 *       200:
 *         description: Custom add-on services retrieved successfully
 */
router.get("/custom-addons", dbController.getCustomAddons);

/**
 * @openapi
 * /api/admin/db/pricing-rules:
 *   get:
 *     summary: Admin - List Pricing Rules
 *     description: Retrieve a global paginated list of parking pricing rules and peak-hour tariff configuration.
 *     tags: [Admin Database Views]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by parking facility name.
 *     responses:
 *       200:
 *         description: Pricing rules retrieved successfully
 */
router.get("/pricing-rules", dbController.getPricingRules);

/**
 * @openapi
 * /api/admin/db/vehicles:
 *   get:
 *     summary: Admin - List Registered Vehicles
 *     description: Retrieve a global paginated list of driver vehicles with owner account details.
 *     tags: [Admin Database Views]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by registration number, vehicle type, or driver name.
 *     responses:
 *       200:
 *         description: Registered vehicles retrieved successfully
 */
router.get("/vehicles", dbController.getVehicles);

/**
 * @openapi
 * /api/admin/db/payouts:
 *   get:
 *     summary: Admin - List Owner Payouts
 *     description: Retrieve a global paginated list of owner payout records with partner account details.
 *     tags: [Admin Database Views]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by owner name.
 *     responses:
 *       200:
 *         description: Owner payouts retrieved successfully
 */
router.get("/payouts", dbController.getPayouts);

/**
 * @openapi
 * /api/admin/db/parking-slots:
 *   get:
 *     summary: Admin - List Parking Slots
 *     description: Retrieve a global paginated list of parking slots across all parking locations.
 *     tags: [Admin Database Views]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by parking facility name.
 *     responses:
 *       200:
 *         description: Parking slots retrieved successfully
 */
router.get("/parking-slots", dbController.getParkingSlots);

export default router;
