import express from 'express';
import { catalogController } from './catalog.controller.js';

const router = express.Router();

// Master Categories
router.get('/categories', catalogController.getMasterCategories);
router.post('/categories', catalogController.createMasterCategory);
router.put('/categories/:id', catalogController.updateMasterCategory);
router.delete('/categories/:id', catalogController.deleteMasterCategory);

// Master Products
router.get('/products', catalogController.getMasterProducts);
router.post('/products', catalogController.createMasterProduct);
router.put('/products/:id', catalogController.updateMasterProduct);
router.delete('/products/:id', catalogController.deleteMasterProduct);

import { uploadMemoryMiddleware } from '../../middleware/upload.middleware.js';
router.post('/upload', uploadMemoryMiddleware.single('file'), catalogController.uploadImage);

export default router;
