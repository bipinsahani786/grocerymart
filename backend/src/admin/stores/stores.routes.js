import express from "express";
import { storesController } from "./stores.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createStoreSchema } from "./stores.schema.js";

const router = express.Router();

router.get("/", storesController.getStores);
router.post("/", validate(createStoreSchema), storesController.createStore);

export default router;
