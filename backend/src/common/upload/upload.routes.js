import express from "express";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { getPresignedUrl } from "./upload.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/upload/presigned-url:
 *   post:
 *     tags:
 *       - Upload
 *     summary: Generate a presigned URL for Cloudflare R2
 */
router.post("/presigned-url", verifyToken, getPresignedUrl);

export default router;
