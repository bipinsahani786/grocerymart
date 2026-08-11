import express from "express";
import { staffController } from "./staff.controller.js";

const router = express.Router();

router.get("/", staffController.getStaff);
router.post("/", staffController.createStaff);
router.patch("/:id", staffController.updateStaff);
router.delete("/:id", staffController.deleteStaff);
router.patch("/:id/clock", staffController.toggleStaffClock);
router.patch("/:id/shift", staffController.updateStaffShift);

export default router;
