import express from "express";
import { ordersController } from "./orders.controller.js";

const router = express.Router();

router.get("/", ordersController.getPickupQueue);
router.post("/:id/verify", ordersController.verifyPickupPin);

export default router;
