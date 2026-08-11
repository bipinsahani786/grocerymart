import express from "express";
import { settingsController } from "./settings.controller.js";

const router = express.Router();

router.get("/", settingsController.getSettings);
router.patch("/", settingsController.updateSettings);
router.put("/", settingsController.updateSettings);

export default router;
