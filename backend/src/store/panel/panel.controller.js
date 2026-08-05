import { storePanelService } from "./panel.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { uploadToCloudflare } from "../../utils/cloudflare.js";

export class StorePanelController {
  getDashboard = catchAsync(async (req, res) => {
    const result = await storePanelService.getDashboard(req.user, req.query.storeId);
    res.json(result);
  });

  uploadImage = catchAsync(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    const url = await uploadToCloudflare(req.file.buffer, req.file.mimetype, req.file.originalname);
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

  getTaxes = catchAsync(async (req, res) => {
    const result = await storePanelService.getTaxes(req.user, req.query.storeId);
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
    const result = await storePanelService.importMasterProducts(req.user, req.query.storeId, req.body.productIds);
    res.json(result);
  });

  getMasterCatalog = catchAsync(async (req, res) => {
    const result = await storePanelService.getMasterCatalog(req.user);
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

  createPosOrder = catchAsync(async (req, res) => {
    const result = await storePanelService.createPosOrder(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  getOrderInvoicePdf = catchAsync(async (req, res) => {
    const pdfResult = await storePanelService.generateOrderInvoicePdf(req.user, req.query.storeId, req.params.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${pdfResult.filename}"`);
    res.send(pdfResult.pdfBuffer);
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

  createCustomer = catchAsync(async (req, res) => {
    const result = await storePanelService.createCustomer(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateCustomer = catchAsync(async (req, res) => {
    const result = await storePanelService.updateCustomer(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteCustomer = catchAsync(async (req, res) => {
    const result = await storePanelService.deleteCustomer(req.user, req.query.storeId, req.params.id);
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

  updateStaff = catchAsync(async (req, res) => {
    const result = await storePanelService.updateStaff(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteStaff = catchAsync(async (req, res) => {
    const result = await storePanelService.deleteStaff(req.user, req.query.storeId, req.params.id);
    res.json(result);
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

  // ==========================================
  // OFFERS CRUD
  // ==========================================
  getOffers = catchAsync(async (req, res) => {
    const { storeId, page, limit, search } = req.query;
    const result = await storePanelService.getOffers(req.user, storeId, page, limit, search);
    res.json(result);
  });

  createOffer = catchAsync(async (req, res) => {
    const result = await storePanelService.createOffer(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateOffer = catchAsync(async (req, res) => {
    const result = await storePanelService.updateOffer(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteOffer = catchAsync(async (req, res) => {
    const result = await storePanelService.deleteOffer(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  // ==========================================
  // SUBSCRIPTIONS CRUD
  // ==========================================
  getSubscriptions = catchAsync(async (req, res) => {
    const { storeId, page, limit, search } = req.query;
    const result = await storePanelService.getSubscriptions(req.user, storeId, page, limit, search);
    res.json(result);
  });

  createSubscription = catchAsync(async (req, res) => {
    const result = await storePanelService.createSubscription(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateSubscription = catchAsync(async (req, res) => {
    const result = await storePanelService.updateSubscription(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteSubscription = catchAsync(async (req, res) => {
    const result = await storePanelService.deleteSubscription(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });
}

export const storePanelController = new StorePanelController();
