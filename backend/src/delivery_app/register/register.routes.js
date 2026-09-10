import express from "express";
import { registerController } from "./register.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { uploadMemoryMiddleware } from "../../middleware/upload.middleware.js";
import {
  sendPartnerOtpSchema,
  verifyPartnerOtpSchema,
  updatePartnerProfileSchema,
} from "./register.schema.js";

const router = express.Router();

/**
 * Registration & Sign-in OTP
 */
router.post(
  "/send-otp",
  validate(sendPartnerOtpSchema),
  registerController.sendOtp
);

router.post(
  "/verify-otp",
  validate(verifyPartnerOtpSchema),
  registerController.verifyOtp
);

/**
 * Document / Photo upload
 */
router.post(
  "/upload",
  uploadMemoryMiddleware.single("file"),
  registerController.uploadFile
);

/**
 * Partner Profile & KYC Update
 */
router.get("/profile", verifyToken, registerController.getProfile);
router.put(
  "/profile",
  verifyToken,
  validate(updatePartnerProfileSchema),
  registerController.updateProfile
);

/**
 * Live Duty status
 */
router.put("/duty", verifyToken, registerController.updateDuty);

/**
 * Rider Subscription Plans (Bought later by rider)
 */
router.post("/subscription/buy", verifyToken, registerController.buySubscription);
router.post("/subscription/cancel", verifyToken, registerController.cancelSubscription);

export default router;
