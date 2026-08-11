import { ordersService } from "./orders.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class OrdersController {
  getOrders = catchAsync(async (req, res) => {
    const result = await ordersService.getOrders(req.user, req.query.storeId, req.query);
    res.json(result);
  });

  getOrderById = catchAsync(async (req, res) => {
    const result = await ordersService.getOrderById(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });

  getOrderInvoicePdf = catchAsync(async (req, res) => {
    const pdfResult = await ordersService.generateOrderInvoicePdf(req.user, req.query.storeId, req.params.id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${pdfResult.filename}"`);
    res.send(pdfResult.pdfBuffer);
  });

  createPosOrder = catchAsync(async (req, res) => {
    const result = await ordersService.createPosOrder(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateOrderStatus = catchAsync(async (req, res) => {
    const result = await ordersService.updateOrderStatus(req.user, req.query.storeId, req.params.id, req.body.status);
    res.json(result);
  });

  getPickupQueue = catchAsync(async (req, res) => {
    const result = await ordersService.getPickupQueue(req.user, req.query.storeId);
    res.json(result);
  });

  verifyPickupPin = catchAsync(async (req, res) => {
    const result = await ordersService.verifyPickupPin(req.user, req.query.storeId, req.params.id, req.body.pin);
    res.json(result);
  });

  getBills = catchAsync(async (req, res) => {
    const result = await ordersService.getBills(req.user, req.query.storeId);
    res.json(result);
  });
}

export const ordersController = new OrdersController();
