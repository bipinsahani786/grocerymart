import express from "express";
import { ordersController } from "./orders.controller.js";

const router = express.Router();

router.get("/", ordersController.getBills);

export default router;
