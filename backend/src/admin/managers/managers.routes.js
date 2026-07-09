import express from "express";
import { managersController } from "./managers.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createManagerSchema } from "./managers.schema.js";

const router = express.Router();

router.get("/", managersController.getManagers);
router.post("/", validate(createManagerSchema), managersController.createManager);

export default router;
