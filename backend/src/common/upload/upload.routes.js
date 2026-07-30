import express from "express";
import { verifyToken } from "../../middleware/auth.middleware.js";
import { uploadMemoryMiddleware } from "../../middleware/upload.middleware.js";
import { getPresignedUrl, directUpload, getFileFromR2 } from "./upload.controller.js";

const router = express.Router();

// Stream images directly from Cloudflare R2 bucket
router.get("/file/*key", getFileFromR2);

router.post("/presigned-url", verifyToken, getPresignedUrl);
router.post("/", verifyToken, uploadMemoryMiddleware.single("file"), directUpload);

export default router;
