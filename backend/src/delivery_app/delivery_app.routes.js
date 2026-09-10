import express from "express";
import registerRoutes from "./register/register.routes.js";
import earningsRoutes from "./earnings/earnings.routes.js";

const router = express.Router();

/**
 * 1. Register & Auth Module
 * Supports both /auth/* and /register/* prefixes, as well as direct root actions
 */
router.use("/auth", registerRoutes);
router.use("/register", registerRoutes);
router.use("/", registerRoutes);

/**
 * 2. Earnings & Payouts Module
 */
router.use("/earnings", earningsRoutes);

export default router;
