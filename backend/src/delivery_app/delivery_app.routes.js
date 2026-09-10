import express from "express";
import registerRoutes from "./register/register.routes.js";
import loginRoutes from "./login/login.routes.js";
import earningsRoutes from "./earnings/earnings.routes.js";

const router = express.Router();

/**
 * 1. Dedicated Login Module
 */
router.use("/login", loginRoutes);

/**
 * 2. Dedicated Register & Onboarding Module
 */
router.use("/register", registerRoutes);
router.use("/auth", registerRoutes);
router.use("/", registerRoutes);

/**
 * 3. Dedicated Earnings & Payouts Module
 */
router.use("/earnings", earningsRoutes);

export default router;
