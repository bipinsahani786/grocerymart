import { ordersRepository } from "./orders.repository.js";
import { AppError } from "../../utils/AppError.js";
import { generateInvoicePdf } from "../../utils/pdfGenerator.js";
import { resolveStoreId } from "../shared.js";

export class OrdersService {
  async getOrders(user, storeIdParam, filters) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await ordersRepository.orders(storeId, filters);
    return { success: true, data };
  }

  async getOrderById(user, storeIdParam, orderId) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await ordersRepository.getOrderById(storeId, orderId);
    if (!data) throw new AppError("Order not found", 404);
    return { success: true, data };
  }

  async updateOrderStatus(user, storeIdParam, orderId, status) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await ordersRepository.updateOrderStatus(storeId, orderId, status);
    return { success: true, data, message: "Order status updated" };
  }

  async createPosOrder(user, storeIdParam, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await ordersRepository.createPosOrder(storeId, payload, user?.id);

    try {
      const pdfResult = await generateInvoicePdf(data);
      if (pdfResult?.relativeUrl) {
        await ordersRepository.updateBillPdfUrl(data.id, pdfResult.relativeUrl);
        data.invoicePdfUrl = pdfResult.relativeUrl;
      }
    } catch (err) {
      console.error("PDF generation skipped in background:", err.message);
    }

    return { success: true, data, message: "POS Counter sale completed successfully" };
  }

  async generateOrderInvoicePdf(user, storeIdParam, orderId) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const order = await ordersRepository.getOrderById(storeId, orderId);
    if (!order) throw new AppError("Order not found", 404);

    return await generateInvoicePdf(order);
  }

  async getPickupQueue(user, storeIdParam) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await ordersRepository.getPickupQueue(storeId);
    return { success: true, data };
  }

  async verifyPickupPin(user, storeIdParam, orderId, pin) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await ordersRepository.verifyPickupPin(storeId, orderId, pin);
    return { success: true, data, message: "Order picked up successfully" };
  }

  async getBills(user, storeIdParam) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const data = await ordersRepository.bills(storeId);
    return { success: true, data };
  }
}

export const ordersService = new OrdersService();
