import express from "express";
import { bookingsController } from "./bookings.controller.js";

const router = express.Router();

/**
 * @openapi
 * /api/admin/bookings:
 *   get:
 *     summary: Admin - List All Bookings
 *     description: Retrieve all bookings across the entire platform with full details including driver info, parking area, owner, add-on services, and disputes. Supports filtering by status, parkingId, userId, vehicleType.
 *     tags: [Admin Bookings Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [confirmed, active, completed, cancelled] }
 *         description: Filter bookings by current status
 *         example: "confirmed"
 *       - in: query
 *         name: parkingId
 *         schema: { type: string }
 *         description: Filter bookings by specific parking lot UUID
 *       - in: query
 *         name: userId
 *         schema: { type: string }
 *         description: Filter bookings by specific driver user UUID
 *       - in: query
 *         name: vehicleType
 *         schema: { type: string, enum: [bike, car, commercial] }
 *         description: Filter bookings by vehicle type
 *     responses:
 *       200:
 *         description: All bookings retrieved with count and full relational details
 */
router.get("/", bookingsController.getAllBookings);

/**
 * @openapi
 * /api/admin/bookings/stats:
 *   get:
 *     summary: Admin - Booking Statistics & Revenue Summary
 *     description: Get aggregated counts of bookings by status (confirmed, active, completed, cancelled) and total platform revenue breakdown (gross, commission, owner share).
 *     tags: [Admin Bookings Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Booking statistics and revenue summary
 */
router.get("/stats", bookingsController.getBookingStats);

/**
 * @openapi
 * /api/admin/bookings/{bookingId}:
 *   get:
 *     summary: Admin - View Single Booking Full Details
 *     description: Retrieve complete booking details including driver profile, parking area with slots and pricing, add-on services, disputes with raised-by info, and reviews.
 *     tags: [Admin Bookings Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *         description: UUID of the booking to view
 *     responses:
 *       200:
 *         description: Booking full details retrieved successfully
 *       404:
 *         description: Booking not found
 */
router.get("/:bookingId", bookingsController.getBookingDetails);

/**
 * @openapi
 * /api/admin/bookings/{bookingId}/cancel:
 *   put:
 *     summary: Admin - Force Cancel Booking
 *     description: Admin force-cancels any booking. Automatically calculates cancellation fee based on platform global settings, refunds remaining amount to driver wallet, restores parking slot availability, and creates an immutable audit log entry.
 *     tags: [Admin Bookings Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema: { type: string }
 *         description: UUID of the booking to force-cancel
 *     responses:
 *       200:
 *         description: Booking cancelled with refund breakdown
 *       400:
 *         description: Booking already cancelled or completed
 *       404:
 *         description: Booking not found
 */
router.put("/:bookingId/cancel", bookingsController.adminCancelBooking);

export default router;
