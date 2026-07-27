import { catalogService } from './catalog.service.js';
import { catchAsync } from '../../utils/catchAsync.js';

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

  // --- Upload ---
  uploadImage = catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }
    const { uploadToCloudflare } = await import('../../utils/cloudflare.js');
    const url = await uploadToCloudflare(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.status(200).json({ success: true, data: { url } });
  });
}

export const catalogController = new CatalogController();
