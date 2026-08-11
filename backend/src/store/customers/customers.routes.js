import express from "express";
import { customersController } from "./customers.controller.js";

const router = express.Router();

router.get("/", customersController.getCustomers);
router.post("/", customersController.createCustomer);
router.patch("/:id", customersController.updateCustomer);
router.delete("/:id", customersController.deleteCustomer);

export default router;
