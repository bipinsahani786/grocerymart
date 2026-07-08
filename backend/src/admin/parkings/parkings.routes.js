import express from "express";
import { parkingsController } from "./parkings.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/parkings:
 *   get:
 *     summary: Admin - List All Parking Areas
 *     description: Retrieve all parking areas with their owners and slot details.
 *     tags: [Admin Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: kycStatus
 *         schema: { type: string, enum: [pending, approved, rejected, All] }
 *         description: Filter parkings by their KYC verification status.
 *     responses:
 *       200:
 *         description: All parkings retrieved successfully
 */
router.get("/", parkingsController.getAllParkings);

/**
 * @openapi
 * /api/admin/parkings/{id}:
 *   get:
 *     summary: Admin - Get Full Parking Details
 *     description: View full parking details including owner info, slots, revenue bookings, and add-ons before/after KYC approval.
 *     tags: [Admin Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Full details retrieved successfully
 */
router.get("/:id", parkingsController.getParkingDetails);

/**
 * @openapi
 * /api/admin/parkings/{id}/status:
 *   put:
 *     summary: Admin - Update Parking Area Status
 *     description: Update the status of a parking area (e.g. active, paused, banned).
 *     tags: [Admin Parking Management]
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
 *               status: { type: string, enum: [pending, active, paused, banned] }
 *     responses:
 *       200:
 *         description: Parking status updated successfully
 */
router.put("/:id/status", parkingsController.updateParkingStatus);

/**
 * @openapi
 * /api/admin/parkings/{id}/kyc:
 *   put:
 *     summary: Admin - Update Parking Area KYC Status
 *     description: Approve or reject the KYC documents for a parking area.
 *     tags: [Admin Parking Management]
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
 *               status: { type: string, enum: [approved, rejected] }
 *     responses:
 *       200:
 *         description: Parking KYC status updated successfully
 */
router.put("/:id/kyc", parkingsController.updateParkingKycStatus);

/**
 * @openapi
 * /api/admin/parkings/{id}:
 *   put:
 *     summary: Admin - Update Parking Area
 *     description: Update editable parking area fields from the super-admin panel.
 *     tags: [Admin Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID of the parking area to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               parkingType: { type: string, enum: [home, society, commercial, govt, municipality] }
 *               address: { type: string }
 *               latitude: { type: number }
 *               longitude: { type: number }
 *               openTime: { type: string, example: "09:00" }
 *               closeTime: { type: string, example: "22:00" }
 *               is24hr: { type: boolean }
 *               status: { type: string, enum: [pending, active, paused, banned] }
 *     responses:
 *       200:
 *         description: Parking area updated successfully
 *       404:
 *         description: Parking area not found
 */
router.put("/:id", parkingsController.updateParking);

/**
 * @openapi
 * /api/admin/parkings/{id}:
 *   delete:
 *     summary: Admin - Delete Parking Area
 *     description: Permanently delete a parking area and its directly managed slot records.
 *     tags: [Admin Parking Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: UUID of the parking area to delete
 *     responses:
 *       200:
 *         description: Parking area deleted successfully
 *       404:
 *         description: Parking area not found
 */
router.delete("/:id", parkingsController.deleteParking);

export default router;
