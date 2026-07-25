import express from "express";
import { managersController } from "./managers.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createManagerSchema, updateManagerStatusSchema, updateManagerPasswordSchema, updateManagerProfileSchema } from "./managers.schema.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/managers:
 *   get:
 *     summary: Super Admin - List All Store Managers
 *     description: Retrieve all store manager accounts across all franchise stores.
 *     tags: [Admin Manager Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Managers list retrieved successfully
 */
router.get("/", managersController.getManagers);

/**
 * @openapi
 * /api/admin/managers:
 *   post:
 *     summary: Super Admin - Create Store Manager
 *     description: Create a new store manager user and assign them to a store.
 *     tags: [Admin Manager Management]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, phone, password, storeId]
 *             properties:
 *               name: { type: string, example: "Amit Sharma" }
 *               email: { type: string, example: "amit@quickkart.in" }
 *               phone: { type: string, example: "9876543210" }
 *               password: { type: string, example: "securePass123" }
 *               storeId: { type: string, format: uuid }
 *     responses:
 *       201:
 *         description: Manager created successfully
 */
router.post("/", validate(createManagerSchema), managersController.createManager);

/**
 * @openapi
 * /api/admin/managers/{id}/status:
 *   patch:
 *     summary: Super Admin - Toggle Manager Status
 *     description: Activate or suspend a store manager account.
 *     tags: [Admin Manager Management]
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
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [active, suspended], example: "suspended" }
 *     responses:
 *       200:
 *         description: Manager status updated successfully
 */
router.patch("/:id/status", validate(updateManagerStatusSchema), managersController.updateManagerStatus);

/**
 * @openapi
 * /api/admin/managers/{id}:
 *   put:
 *     summary: Super Admin - Update Store Manager Profile
 *     description: Update manager's basic profile details and store assignment.
 *     tags: [Admin Manager Management]
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
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               storeId: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Manager profile updated successfully
 *       400:
 *         description: Validation error or email exists
 */
router.put("/:id", validate(updateManagerProfileSchema), managersController.updateManagerProfile);

/**
 * @openapi
 * /api/admin/managers/{id}/password:
 *   patch:
 *     summary: Super Admin - Reset Manager Password
 *     description: Reset the password for a store manager account.
 *     tags: [Admin Manager Management]
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
 *             required: [newPassword]
 *             properties:
 *               newPassword: { type: string, example: "newSecurePass456" }
 *     responses:
 *       200:
 *         description: Manager password updated successfully
 */
router.patch("/:id/password", validate(updateManagerPasswordSchema), managersController.updateManagerPassword);

export default router;
