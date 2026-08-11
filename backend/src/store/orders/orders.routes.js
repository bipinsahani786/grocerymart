import express from "express";
import { ordersController } from "./orders.controller.js";

const router = express.Router();

router.get("/", ordersController.getOrders);
router.get("/:id", ordersController.getOrderById);
router.get("/:id/pdf", ordersController.getOrderInvoicePdf);
router.post("/pos", ordersController.createPosOrder);
router.patch("/:id/status", ordersController.updateOrderStatus);

export default router;
