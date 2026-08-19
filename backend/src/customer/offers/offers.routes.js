import express from "express";
import { customerOffersController } from "./offers.controller.js";

const router = express.Router();

// GET /api/customer/offers or /api/customer/coupons
router.get("/", customerOffersController.getOffers);
router.get("/coupons", customerOffersController.getOffers);

// POST /api/customer/offers/validate or /api/customer/coupons/validate
router.post("/validate", customerOffersController.validateCoupon);
router.post("/apply", customerOffersController.validateCoupon);

export default router;
