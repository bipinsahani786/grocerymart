import express from "express";
import { loginController } from "./login.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  loginCheckSchema,
  loginSendOtpSchema,
  loginVerifyOtpSchema,
} from "./login.schema.js";

const router = express.Router();

/**
 * Check partner user existence and account status
 */
router.post("/check", validate(loginCheckSchema), loginController.checkUser);

/**
 * Request OTP for Partner Login
 */
router.post("/send-otp", validate(loginSendOtpSchema), loginController.sendOtp);

/**
 * Verify Login OTP and issue tokens
 */
router.post("/verify-otp", validate(loginVerifyOtpSchema), loginController.verifyOtp);

export default router;
