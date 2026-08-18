import express from "express";
import { customerProductsController } from "./products.controller.js";

const router = express.Router();

// GET /api/customer/categories (or /api/customer/products/categories)
router.get("/categories", customerProductsController.getCategories);

// GET /api/customer/products (or mounted as /products)
router.get("/", customerProductsController.getProducts);

export default router;
