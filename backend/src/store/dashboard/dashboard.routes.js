import express from "express";
import { dashboardController } from "./dashboard.controller.js";
import { uploadMemoryMiddleware } from "../../middleware/upload.middleware.js";

const router = express.Router();

router.get("/", dashboardController.getDashboard);
router.get("/analytics", dashboardController.getAnalytics);
router.post("/upload", uploadMemoryMiddleware.single("file"), dashboardController.uploadImage);

export default router;
