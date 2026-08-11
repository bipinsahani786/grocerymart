import express from "express";
import { subscriptionsController } from "./subscriptions.controller.js";

const router = express.Router();

router.get("/", subscriptionsController.getSubscriptions);
router.post("/", subscriptionsController.createSubscription);
router.patch("/:id", subscriptionsController.updateSubscription);
router.delete("/:id", subscriptionsController.deleteSubscription);

export default router;
