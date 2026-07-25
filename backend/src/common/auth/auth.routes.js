import express from "express";
import { authController } from "./auth.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { verifyToken } from "../../middleware/auth.middleware.js";
import {
  registerSchema,
  verifyRegisterOtpSchema,
  loginOtpSendSchema,
  loginOtpVerifySchema,
  loginPasswordSchema,
  changePasswordSchema,
} from "./auth.schema.js";

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Step 1 - User Registration (Sends OTP)
 *     description: Starts registration for a new user (Customer, Store Manager, or Admin) and sends a 4-digit OTP.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, password, userType]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Rajesh Kumar"
 *               email:
 *                 type: string
 *                 example: "rajesh@example.com"
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               password:
 *                 type: string
 *                 example: "SecurePass123"
 *               userType:
 *                 type: string
 *                 enum: [CUSTOMER, STORE_MANAGER, SUPER_ADMIN]
 *                 example: "CUSTOMER"
 *     responses:
 *       201:
 *         description: OTP sent successfully. No user record has been created yet.
 */
router.post("/register", validate(registerSchema), authController.register);

/**
 * @openapi
 * /api/auth/verify-register-otp:
 *   post:
 *     summary: Step 2 - Verify Registration OTP & Activate Account
 *     description: Verify the 4-digit OTP sent during registration, create the user account, and return JWT access and refresh tokens upon success.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               email:
 *                 type: string
 *                 example: "rajesh@example.com"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Account created, activated, and tokens issued
 */
router.post("/verify-register-otp", validate(verifyRegisterOtpSchema), authController.verifyRegisterOtp);

/**
 * @openapi
 * /api/auth/login-otp/send:
 *   post:
 *     summary: Request Login OTP (Mobile / Email)
 *     description: Request a 4-digit OTP to login without a password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: Login OTP sent successfully
 */
router.post("/login-otp/send", validate(loginOtpSendSchema), authController.sendLoginOtp);

/**
 * @openapi
 * /api/auth/login-otp/verify:
 *   post:
 *     summary: Verify Login OTP
 *     description: Verify login OTP and receive JWT access token.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [otp]
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.post("/login-otp/verify", validate(loginOtpVerifySchema), authController.verifyLoginOtp);

/**
 * @openapi
 * /api/auth/login-password:
 *   post:
 *     summary: Email & Password Login
 *     description: Traditional login using registered email and password.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: "rajesh@example.com"
 *               password:
 *                 type: string
 *                 example: "SecurePass123"
 *     responses:
 *       200:
 *         description: Logged in successfully
 */
router.post("/login-password", validate(loginPasswordSchema), authController.loginPassword);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh Access Token
 *     description: Use refresh token to get a new access token without logging in again.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully, returns new accessToken and refreshToken
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post("/refresh", authController.refreshToken);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout current user session
 *     description: Invalidate active user session tokens.
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
router.post("/logout", verifyToken, authController.logout);

/**
 * @openapi
 * /api/auth/profile:
 *   get:
 *     summary: Get Authenticated User Profile
 *     description: Returns the user profile payload embedded in the JWT access token.
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile payload retrieved successfully
 */
router.get("/profile", verifyToken, authController.getProfile);

/**
 * @openapi
 * /api/auth/profile:
 *   patch:
 *     summary: Update User Profile
 *     description: Update name, email, phone of authenticated user.
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch("/profile", verifyToken, authController.updateProfile);

/**
 * @openapi
 * /api/auth/profile/avatar:
 *   delete:
 *     summary: Remove avatar
 *     description: Remove user avatar.
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Avatar removed
 */
router.delete("/profile/avatar", verifyToken, authController.removeAvatar);

/**
 * @openapi
 * /api/auth/change-password:
 *   post:
 *     summary: Change User Password
 *     description: Allows an authenticated user to change their password.
 *     tags: [Authentication]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [oldPassword, newPassword]
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Incorrect old password
 */
router.post("/change-password", verifyToken, validate(changePasswordSchema), authController.changePassword);

/**
 * @openapi
 * /api/auth/seed-admin:
 *   get:
 *     summary: Temporarily seed the Super Admin user
 *     description: Creates the default superadmin user for testing.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Superadmin seeded successfully
 */
router.get("/seed-admin", authController.seedAdmin);

export default router;
