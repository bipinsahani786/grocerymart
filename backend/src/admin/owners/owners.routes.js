import express from "express";
import { ownersController } from "./owners.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { approveKycSchema, adminOnboardOwnerSchema } from "./owners.schema.js";

const router = express.Router();

// ─── Static paths FIRST (before :ownerId param) ───────────────

/**
 * @openapi
 * /api/admin/owners:
 *   get:
 *     summary: Admin - List All Owners with Summary
 *     description: Retrieve all parking lot owners with their KYC profile, verification status, parking lot count, wallet balance, and account status for quick admin overview.
 *     tags: [Admin Owner Management]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: All owners with summary data retrieved successfully
 */
router.get("/", ownersController.getAllOwners);

/**
 * @openapi
 * /api/admin/owners/kyc:
 *   get:
 *     summary: Admin - List Owner KYC Profiles
 *     description: Retrieve all business KYC profiles submitted by parking owners, filterable by verificationStatus.
 *     tags: [Admin Owner Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [pending, approved, rejected] }
 *         example: "pending"
 *     responses:
 *       200:
 *         description: KYC profiles retrieved successfully
 */
router.get("/kyc", ownersController.getOwnerKycList);

/**
 * @openapi
 * /api/admin/owners/kyc/{ownerId}/approve:
 *   put:
 *     summary: Admin - Approve / Reject Owner KYC
 *     description: Super admin reviews business registration/bank details and approves KYC, unlocking the owner's ability to create parking lots and add-on services.
 *     tags: [Admin Owner Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: ownerId
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
 *               status: { type: string, enum: [approved, rejected], example: "approved" }
 *     responses:
 *       200:
 *         description: Owner verification status updated successfully
 */
router.put("/kyc/:ownerId/approve", validate(approveKycSchema), ownersController.approveOwnerKyc);

/**
 * @openapi
 * /api/admin/owners/onboard:
 *   post:
 *     summary: Admin - Direct Owner Onboarding
 *     description: Super admin directly creates an owner account from the admin dashboard. This account is pre-approved instantly.
 *     tags: [Admin Owner Management]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, phone, email, password, ownerType]
 *             properties:
 *               name: { type: string, example: "Metro Parking Corp" }
 *               phone: { type: string, example: "9876543210" }
 *               email: { type: string, example: "contact@metroparking.com" }
 *               password: { type: string, example: "SecurePass123" }
 *               ownerType: { type: string, enum: [home, society, commercial, govt, municipality], example: "commercial" }
 *               gstNumber: { type: string, example: "22AAAAA0000A1Z5" }
 *     responses:
 *       201:
 *         description: Owner onboarded and pre-approved successfully
 */
router.post("/onboard", validate(adminOnboardOwnerSchema), ownersController.adminOnboardOwner);

// ─── Parameterized paths AFTER static paths ────────────────────

/**
 * @openapi
 * /api/admin/owners/{ownerId}:
 *   get:
 *     summary: Admin - View Owner Full Details
 *     description: Retrieve complete owner profile including KYC data, all parking areas with slots/pricing/add-ons, latest 50 bookings per parking, latest 20 wallet transactions, and last 10 payouts. Gives admin complete visibility into an owner's business.
 *     tags: [Admin Owner Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema: { type: string }
 *         description: UUID of the owner user to inspect
 *     responses:
 *       200:
 *         description: Owner full details with all parking areas, pricing, bookings, and financials
 *       404:
 *         description: Owner not found
 */
router.get("/:ownerId", ownersController.getOwnerDetails);

/**
 * @openapi
 * /api/admin/owners/{ownerId}/disable:
 *   put:
 *     summary: Admin - Disable Owner Account
 *     description: Suspend an owner account and automatically pause ALL their parking lots in a single atomic transaction. Drivers will no longer see these lots in search results.
 *     tags: [Admin Owner Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema: { type: string }
 *         description: UUID of the owner to disable
 *     responses:
 *       200:
 *         description: Owner suspended and all parking lots paused
 *       404:
 *         description: Owner not found
 */
router.put("/:ownerId/disable", ownersController.disableOwner);

/**
 * @openapi
 * /api/admin/owners/{ownerId}/enable:
 *   put:
 *     summary: Admin - Re-enable Owner Account
 *     description: Re-activate a suspended owner account and set their parking lots back to pending review status.
 *     tags: [Admin Owner Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema: { type: string }
 *         description: UUID of the owner to re-enable
 *     responses:
 *       200:
 *         description: Owner re-activated and parking lots set to pending
 *       404:
 *         description: Owner not found
 */
router.put("/:ownerId/enable", ownersController.enableOwner);

/**
 * @openapi
 * /api/admin/owners/{ownerId}:
 *   put:
 *     summary: Admin - Update Owner Profile
 *     description: Update basic profile information for an owner (name, email, phone, status, ownerType).
 *     tags: [Admin Owner Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Owner profile updated successfully
 */
router.put("/:ownerId", ownersController.updateOwner);

/**
 * @openapi
 * /api/admin/owners/{ownerId}:
 *   delete:
 *     summary: Admin - Delete Owner Account
 *     description: Permanently delete an owner account and all their associated data. Use with caution.
 *     tags: [Admin Owner Management]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: ownerId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Owner account deleted successfully
 */
router.delete("/:ownerId", ownersController.deleteOwner);

export default router;

