import express from "express";
import { customerAddressesController } from "./addresses.controller.js";

const router = express.Router();

// Profile & Addresses endpoints
router.get("/profile", customerAddressesController.getProfile);
router.get("/addresses", customerAddressesController.getAddresses);
router.post("/addresses", customerAddressesController.addAddress);
router.put("/addresses/:id", customerAddressesController.updateAddress);
router.delete("/addresses/:id", customerAddressesController.deleteAddress);

export default router;
