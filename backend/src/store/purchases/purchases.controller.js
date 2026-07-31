import { purchasesService } from "./purchases.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class PurchasesController {
  // Suppliers
  getSuppliers = catchAsync(async (req, res) => {
    const result = await purchasesService.getSuppliers(req.user, req.query.storeId);
    res.json(result);
  });

  createSupplier = catchAsync(async (req, res) => {
    const result = await purchasesService.createSupplier(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateSupplier = catchAsync(async (req, res) => {
    const result = await purchasesService.updateSupplier(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  // Purchase Orders
  getPurchaseOrders = catchAsync(async (req, res) => {
    const result = await purchasesService.getPurchaseOrders(req.user, req.query.storeId);
    res.json(result);
  });

  getPurchaseOrderById = catchAsync(async (req, res) => {
    const result = await purchasesService.getPurchaseOrderById(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  createPurchaseOrder = catchAsync(async (req, res) => {
    const result = await purchasesService.createPurchaseOrder(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  // Batches
  getStoreBatches = catchAsync(async (req, res) => {
    const result = await purchasesService.getStoreBatches(req.user, req.query.storeId, req.query.productId);
    res.json(result);
  });
}

export const purchasesController = new PurchasesController();
