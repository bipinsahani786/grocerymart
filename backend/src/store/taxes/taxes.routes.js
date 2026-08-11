import express from "express";
import { taxesController } from "./taxes.controller.js";

const router = express.Router();

router.get("/", taxesController.getTaxes);

export default router;
