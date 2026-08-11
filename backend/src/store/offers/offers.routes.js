import express from "express";
import { offersController } from "./offers.controller.js";

const router = express.Router();

router.get("/", offersController.getOffers);
router.post("/", offersController.createOffer);
router.patch("/:id", offersController.updateOffer);
router.delete("/:id", offersController.deleteOffer);

export default router;
