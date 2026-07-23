import express from "express";
import { storesController } from "./stores.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { storeValidation } from "./stores.schema.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/stores:
 *   get:
 *     summary: Super Admin - List All Stores
 *     description: Retrieve all franchise stores with optional filtering by status, module, and search.
 *     tags: [Admin Store Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by store name or address
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [all, active, inactive] }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Stores list retrieved successfully
 */
router.get("/", validate(storeValidation.getStores), storesController.getStores);

/**
 * @openapi
 * /api/admin/stores:
 *   post:
 *     summary: Super Admin - Create New Franchise Store
 *     description: Create a new franchise store along with its manager account in a single transaction.
 *     tags: [Admin Store Management]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, address, lat, long, managerName, managerEmail, managerPhone, managerPassword]
 *             properties:
 *               name: { type: string, example: "QuickKart MG Road" }
 *               address: { type: string, example: "123 MG Road, Bangalore" }
 *               lat: { type: number, example: 12.9716 }
 *               long: { type: number, example: 77.5946 }
 *               radiusKm: { type: number, example: 3 }
 *               phone: { type: string, example: "+919876543210" }
 *               gstin: { type: string, example: "29ABCDE1234F1Z5" }
 *               openingTime: { type: string, example: "08:00" }
 *               closingTime: { type: string, example: "22:00" }
 *               managerName: { type: string, example: "Rajesh Kumar" }
 *               managerEmail: { type: string, example: "rajesh@quickkart.in" }
 *               managerPhone: { type: string, example: "9876543210" }
 *               managerPassword: { type: string, example: "securePass123" }
 *     responses:
 *       201:
 *         description: Store and manager created successfully
 */
router.post("/", validate(storeValidation.createStore), storesController.createStore);

/**
 * @openapi
 * /api/admin/stores/{id}:
 *   put:
 *     summary: Super Admin - Update Store Details
 *     description: Update basic details of a franchise store such as name, address, timings etc.
 *     tags: [Admin Store Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Store updated successfully
 */
router.put("/:id", validate(storeValidation.updateStore), storesController.updateStore);

/**
 * @openapi
 * /api/admin/stores/{id}/status:
 *   patch:
 *     summary: Super Admin - Toggle Store Active Status
 *     description: Activate or deactivate a franchise store.
 *     tags: [Admin Store Management]
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
 *             required: [isActive]
 *             properties:
 *               isActive: { type: boolean, example: false }
 *     responses:
 *       200:
 *         description: Store status updated successfully
 */
router.patch("/:id/status", validate(storeValidation.updateStatus), storesController.updateStoreStatus);

export default router;
