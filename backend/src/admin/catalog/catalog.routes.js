import express from 'express';
import { catalogController } from './catalog.controller.js';

const router = express.Router();

// Master Categories
router.get('/categories', catalogController.getMasterCategories);
router.post('/categories', catalogController.createMasterCategory);

// Master Products
router.get('/products', catalogController.getMasterProducts);
router.post('/products', catalogController.createMasterProduct);

import { uploadMemoryMiddleware } from '../../middleware/upload.middleware.js';
router.post('/upload', uploadMemoryMiddleware.single('file'), catalogController.uploadImage);

export default router;
