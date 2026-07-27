import express from "express";
import { taxesController } from "./taxes.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  createTaxClassSchema,
  updateTaxClassSchema,
  deleteTaxClassSchema,
  scheduleTaxRateSchema,
} from "./taxes.schema.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/taxes:
 *   get:
 *     summary: Super Admin - List All Tax Classes
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
 *     tags: [Admin Tax Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Tax class created successfully
 */
router.post("/", validate(createTaxClassSchema), taxesController.createTaxClass);

/**
 * @openapi
 * /api/admin/taxes/{id}:
 *   put:
 *     summary: Super Admin - Update Tax Class
 *     tags: [Admin Tax Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Tax class updated successfully
 */
router.put("/:id", validate(updateTaxClassSchema), taxesController.updateTaxClass);

/**
 * @openapi
 * /api/admin/taxes/{id}:
 *   delete:
 *     summary: Super Admin - Delete Tax Class
 *     tags: [Admin Tax Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Tax class deleted successfully
 */
router.delete("/:id", validate(deleteTaxClassSchema), taxesController.deleteTaxClass);

/**
 * @openapi
 * /api/admin/taxes/{id}/rates:
 *   post:
 *     summary: Super Admin - Schedule Tax Rate
 *     tags: [Admin Tax Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201:
 *         description: Tax rate scheduled successfully
 */
router.post("/:id/rates", validate(scheduleTaxRateSchema), taxesController.scheduleTaxRate);

export default router;
