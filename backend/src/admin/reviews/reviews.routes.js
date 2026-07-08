import express from "express";
import { reviewsController } from "./reviews.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/reviews:
 *   get:
 *     summary: Admin - List All Reviews
 *     description: Retrieve all reviews given by drivers on parking lots and custom add-on services.
 *     tags: [Admin Reviews Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All reviews retrieved successfully
 */
router.get("/", reviewsController.getAllReviews);

/**
 * @openapi
 * /api/admin/reviews/{id}:
 *   delete:
 *     summary: Admin - Delete Review
 *     description: Delete a specific review by ID in case of spam, abuse, or policy violation.
 *     tags: [Admin Reviews Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID of the review to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       404:
 *         description: Review not found
 */
router.delete("/:id", reviewsController.deleteReview);

export default router;
