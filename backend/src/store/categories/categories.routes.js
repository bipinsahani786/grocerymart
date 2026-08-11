import express from "express";
import { categoriesController } from "./categories.controller.js";

const router = express.Router();

router.get("/", categoriesController.getCategories);
router.post("/", categoriesController.createCategory);
router.post("/import-master", categoriesController.importMasterCategories);
router.patch("/:id", categoriesController.updateCategory);
router.delete("/:id", categoriesController.deleteCategory);

export default router;
