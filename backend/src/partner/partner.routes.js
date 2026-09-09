import express from "express";
import { partnerController } from "./partner.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { uploadMemoryMiddleware } from "../middleware/upload.middleware.js";
import {
  sendPartnerOtpSchema,
  verifyPartnerOtpSchema,
  updatePartnerProfileSchema,
} from "./partner.schema.js";

const router = express.Router();

/**
 * @openapi
 * /api/partner/auth/send-otp:
 *   post:
 *     summary: Request OTP for Delivery Partner
 *     description: Sends a 4-digit OTP to the partner's mobile number for verification / sign in.
 *     tags: [Delivery Partner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               authMode:
 *                 type: string
 *                 enum: [LOGIN, REGISTER]
 *                 example: "LOGIN"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 */
router.post(
  "/auth/send-otp",
  validate(sendPartnerOtpSchema),
  partnerController.sendOtp
);

/**
 * @openapi
 * /api/partner/auth/verify-otp:
 *   post:
 *     summary: Verify Partner OTP & Sign In / Register
 *     description: Verifies 4-digit OTP, creates partner user & delivery_partners record if new, returns JWT tokens.
 *     tags: [Delivery Partner]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, otp]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *               authMode:
 *                 type: string
 *                 enum: [LOGIN, REGISTER]
 *               vehicleType:
 *                 type: string
 *                 example: "EV_BIKE"
 *               name:
 *                 type: string
 *                 example: "Sahil"
 *     responses:
 *       200:
 *         description: Partner authenticated successfully
 */
router.post(
  "/auth/verify-otp",
  validate(verifyPartnerOtpSchema),
  partnerController.verifyOtp
);

/**
 * @openapi
 * /api/partner/upload:
 *   post:
 *     summary: Upload Avatar / Document Image to Cloudflare R2
 *     tags: [Delivery Partner]
 *     responses:
 *       200:
 *         description: File uploaded to Cloudflare R2
 */
router.post(
  "/upload",
  uploadMemoryMiddleware.single("file"),
  partnerController.uploadFile
);

/**
 * @openapi
 * /api/partner/profile:
 *   get:
 *     summary: Get Current Partner Profile
 *     description: Fetches authenticated partner details and KYC status.
 *     tags: [Delivery Partner]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Partner profile retrieved
 *   put:
 *     summary: Update Partner Profile Details
 *     description: Updates personal, address, vehicle, or bank details.
 *     tags: [Delivery Partner]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Partner profile updated
 */
router.get("/profile", verifyToken, partnerController.getProfile);
router.put(
  "/profile",
  verifyToken,
  validate(updatePartnerProfileSchema),
  partnerController.updateProfile
);

export default router;
