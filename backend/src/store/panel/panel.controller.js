import { storePanelService } from "./panel.service.js";
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { catchAsync } from "../../utils/catchAsync.js";

export class StorePanelController {
  getDashboard = catchAsync(async (req, res) => {
    const result = await storePanelService.getDashboard(req.user, req.query.storeId);
    res.json(result);
  });

  uploadImage = catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const uploadDir = path.join(process.cwd(), 'public/uploads/categories');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const ext = req.file.originalname.split('.').pop() || 'png';
    const filename = `store-cat-${crypto.randomUUID()}-${Date.now()}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, req.file.buffer);
    const url = `/uploads/categories/${filename}`;

    res.status(200).json({ success: true, data: { url } });
  });

  getSettings = catchAsync(async (req, res) => {
    const result = await storePanelService.getSettings(req.user, req.query.storeId);
    res.json(result);
  });

  updateSettings = catchAsync(async (req, res) => {
    const result = await storePanelService.updateSettings(req.user, req.query.storeId, req.body);
    res.json(result);
  });

  getCategories = catchAsync(async (req, res) => {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search || req.query.q,
      parentId: req.query.parentId,
      all: req.query.all
    };
    const result = await storePanelService.getCategories(req.user, req.query.storeId, filters);
    res.json(result);
  });

  createCategory = catchAsync(async (req, res) => {
    const result = await storePanelService.createCategory(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateCategory = catchAsync(async (req, res) => {
    const result = await storePanelService.updateCategory(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteCategory = catchAsync(async (req, res) => {
    const result = await storePanelService.deleteCategory(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  getInventory = catchAsync(async (req, res) => {
    const result = await storePanelService.getInventory(req.user, req.query.storeId, req.query.q);
    res.json(result);
  });

  createProduct = catchAsync(async (req, res) => {
    const result = await storePanelService.createProduct(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateProduct = catchAsync(async (req, res) => {
    const result = await storePanelService.updateProduct(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteProduct = catchAsync(async (req, res) => {
    const result = await storePanelService.deleteProduct(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  importMasterCategories = catchAsync(async (req, res) => {
    const result = await storePanelService.importMasterCategories(req.user, req.query.storeId);
    res.json(result);
  });

  importMasterProducts = catchAsync(async (req, res) => {
    const result = await storePanelService.importMasterProducts(req.user, req.query.storeId);
    res.json(result);
  });

  adjustInventory = catchAsync(async (req, res) => {
    const result = await storePanelService.adjustInventory(req.user, req.query.storeId, req.params.productId, req.body.delta);
    res.json(result);
  });

  getOrders = catchAsync(async (req, res) => {
    const result = await storePanelService.getOrders(req.user, req.query.storeId, req.query);
    res.json(result);
  });

  getOrderById = catchAsync(async (req, res) => {
    const result = await storePanelService.getOrderById(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  updateOrderStatus = catchAsync(async (req, res) => {
    const result = await storePanelService.updateOrderStatus(req.user, req.query.storeId, req.params.id, req.body.status);
    res.json(result);
  });

  getPickupQueue = catchAsync(async (req, res) => {
    const result = await storePanelService.getPickupQueue(req.user, req.query.storeId);
    res.json(result);
  });

  verifyPickupPin = catchAsync(async (req, res) => {
    const result = await storePanelService.verifyPickupPin(req.user, req.query.storeId, req.params.id, req.body.pin);
    res.json(result);
  });

  getBills = catchAsync(async (req, res) => {
    const result = await storePanelService.getBills(req.user, req.query.storeId);
    res.json(result);
  });

  getCustomers = catchAsync(async (req, res) => {
    const result = await storePanelService.getCustomers(req.user, req.query.storeId);
    res.json(result);
  });

  getStaff = catchAsync(async (req, res) => {
    const result = await storePanelService.getStaff(req.user, req.query.storeId);
    res.json(result);
  });

  createStaff = catchAsync(async (req, res) => {
    const result = await storePanelService.createStaff(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  toggleStaffClock = catchAsync(async (req, res) => {
    const result = await storePanelService.toggleStaffClock(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  updateStaffShift = catchAsync(async (req, res) => {
    const result = await storePanelService.updateStaffShift(req.user, req.query.storeId, req.params.id, req.body.shift);
    res.json(result);
  });

  getAnalytics = catchAsync(async (req, res) => {
    const result = await storePanelService.getAnalytics(req.user, req.query.storeId);
    res.json(result);
  });
}

export const storePanelController = new StorePanelController();
