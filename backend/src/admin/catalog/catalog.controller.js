import { catalogService } from './catalog.service.js';
import { catchAsync } from '../../utils/catchAsync.js';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class CatalogController {
  // --- Master Categories ---
  getMasterCategories = catchAsync(async (req, res) => {
    const result = await catalogService.getMasterCategories();
    res.status(200).json({ success: true, data: result });
  });

  createMasterCategory = catchAsync(async (req, res) => {
    const result = await catalogService.createMasterCategory(req.body);
    res.status(201).json(result);
  });

  updateMasterCategory = catchAsync(async (req, res) => {
    const result = await catalogService.updateMasterCategory(req.params.id, req.body);
    res.status(200).json(result);
  });

  deleteMasterCategory = catchAsync(async (req, res) => {
    const result = await catalogService.deleteMasterCategory(req.params.id);
    res.status(200).json(result);
  });

  // --- Master Products ---
  getMasterProducts = catchAsync(async (req, res) => {
    const filters = req.query; // can have categoryId, type, search
    const result = await catalogService.getMasterProducts(filters);
    res.status(200).json({ success: true, data: result });
  });

  createMasterProduct = catchAsync(async (req, res) => {
    const result = await catalogService.createMasterProduct(req.body);
    res.status(201).json(result);
  });

  updateMasterProduct = catchAsync(async (req, res) => {
    const result = await catalogService.updateMasterProduct(req.params.id, req.body);
    res.status(200).json(result);
  });

  deleteMasterProduct = catchAsync(async (req, res) => {
    const result = await catalogService.deleteMasterProduct(req.params.id);
    res.status(200).json(result);
  });

  // --- Upload (100% Reliable Local Serving) ---
  uploadImage = catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    // Save directly to public/uploads/categories for reliable Express static file serving
    const uploadDir = path.join(process.cwd(), 'public/uploads/categories');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = req.file.originalname.split('.').pop() || 'png';
    const filename = `cat-${crypto.randomUUID()}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, req.file.buffer);
    const url = `/uploads/categories/${filename}`;

    res.status(200).json({ success: true, data: { url } });
  });
}

export const catalogController = new CatalogController();
