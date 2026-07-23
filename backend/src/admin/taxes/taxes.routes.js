import express from "express";
import { taxesController } from "./taxes.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createTaxClassSchema, scheduleTaxRateSchema } from "./taxes.schema.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/taxes:
 *   get:
 *     summary: Super Admin - List All Tax Classes
 *     description: Retrieve all tax classes along with their current active rates and linked products count.
 *     tags: [Admin Tax Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Tax classes retrieved successfully
 */
router.get("/", taxesController.getAllTaxClasses);

/**
 * @openapi
 * /api/admin/taxes:
 *   post:
 *     summary: Super Admin - Create Tax Class
 *     description: Create a new tax profile (e.g. Dairy Tax) with an optional initial tax rate.
 *     tags: [Admin Tax Management]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: "Standard GST" }
 *               description: { type: string, example: "Applies to electronics" }
 *               initialRate:
 *                 type: object
 *                 properties:
 *                   effectiveFrom: { type: string, format: "date-time" }
 *                   components:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         name: { type: string, example: "CGST" }
 *                         rate: { type: number, example: 9 }
 *     responses:
 *       201:
 *         description: Tax class created successfully
 */
router.post("/", validate(createTaxClassSchema), taxesController.createTaxClass);

/**
 * @openapi
 * /api/admin/taxes/{id}/rates:
 *   post:
 *     summary: Super Admin - Schedule Tax Rate
 *     description: Schedule a new tax rate for an existing tax class to be effective from a future date.
 *     tags: [Admin Tax Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: "uuid" }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [effectiveFrom, components]
 *             properties:
 *               effectiveFrom: { type: string, format: "date-time" }
 *               components:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string, example: "CGST" }
 *                     rate: { type: number, example: 14 }
 *     responses:
 *       201:
 *         description: Tax rate scheduled successfully
 */
router.post("/:id/rates", validate(scheduleTaxRateSchema), taxesController.scheduleTaxRate);

export default router;
