import { ordersRepository } from "./orders.repository.js";
import { AppError } from "../../utils/AppError.js";
import { generateInvoicePdf } from "../../utils/pdfGenerator.js";
import { resolveStoreId } from "../shared.js";

/**
 * Single Responsibility: Business logic, validation, and workflow orchestration for store orders.
 */
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

  /**
   * Orchestrates customer lookup/creation, staff resolution, inventory stock validation,
   * financial calculations, transaction persistence, and asynchronous invoice generation.
   */
  async createPosOrder(user, storeIdParam, payload) {
    const storeId = await resolveStoreId(user, storeIdParam);
    const { customerName, customerPhone, customerId, staffId, discount = 0, paymentMethod = "CASH", notes, items } = payload;

    if (!items || !items.length) {
      throw new AppError("Order items cannot be empty", 400);
    }

    const data = await ordersRepository.runTransaction(async (tx) => {
      // 1. Resolve Customer
      let finalCustomerId = null;
      let targetPhone = customerPhone?.trim() || null;
      let targetName = customerName?.trim() || "POS Customer";

      if (customerId) {
        const userObj = await ordersRepository.findUserById(customerId, tx);
        if (userObj) {
          finalCustomerId = userObj.id;
          targetPhone = userObj.phone || targetPhone;
          targetName = userObj.name || targetName;
        }
      }

      if (!finalCustomerId && targetPhone) {
        let userObj = await ordersRepository.findUserByPhone(targetPhone, tx);
        if (!userObj) {
          userObj = await ordersRepository.createCustomerUser({ phone: targetPhone, name: targetName }, tx);
        }
        finalCustomerId = userObj.id;
      }

      // 2. Resolve Staff / Cashier
      let finalStaffId = user?.id || null;
      const targetStaffId = staffId || user?.id;

      if (targetStaffId) {
        const storeStaffObj = await ordersRepository.findStoreStaffById(targetStaffId, tx);
        if (storeStaffObj && storeStaffObj.userId) {
          finalStaffId = storeStaffObj.userId;
        } else {
          const directUser = await ordersRepository.findUserById(targetStaffId, tx);
          if (directUser) {
            finalStaffId = directUser.id;
          }
        }
      }

      // 3. Calculate Totals and Validate Inventory Stock levels
      let subtotal = 0;
      const orderItemsData = [];

      for (const item of items) {
        const product = await ordersRepository.findProductWithInventory(item.productId, storeId, tx);

        if (!product) {
          throw new AppError(`Product not found in store catalog: ${item.productId}`, 400);
        }

        const price = item.price !== undefined ? parseFloat(item.price) : product.basePrice;
        const qty = parseFloat(item.quantity);
        const itemTotal = price * qty;
        subtotal += itemTotal;

        // Deduct inventory stock levels
        const inv = product.inventory && product.inventory[0];
        if (inv) {
          if (inv.quantity < qty) {
            throw new AppError(`Insufficient stock for product ${product.name}. Requested: ${qty}, Available: ${inv.quantity}`, 400);
          }
          await ordersRepository.decrementInventoryStock(inv.id, qty, tx);
        }

        orderItemsData.push({
          productId: product.id,
          name: product.name,
          qty,
          unit: product.unit,
          priceAtOrder: price,
          taxRate: item.taxRate !== undefined ? parseFloat(item.taxRate) : 0,
        });
      }

      const totalAmount = Math.max(0, subtotal - parseFloat(discount));

      // 4. Create Order Record
      const orderNumber = `POS-${Date.now().toString().slice(-6)}`;
      const order = await ordersRepository.createOrderWithRelations({
        orderNumber,
        type: "POS",
        status: "COMPLETED",
        storeId,
        customerId: finalCustomerId,
        staffId: finalStaffId,
        subtotal,
        discount: parseFloat(discount),
        totalAmount,
        notes,
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            method: paymentMethod,
            status: "SUCCESS",
            amount: totalAmount,
          },
        },
      }, tx);

      // 5. Generate Invoice Bill Record
      const billNumber = `INV-${Date.now().toString().slice(-6)}`;
      await ordersRepository.createBill({
        billNumber,
        orderId: order.id,
        storeId,
        type: "RECEIPT",
      }, tx);

      // 6. Update Customer Ledger & Balances
      if (finalCustomerId) {
        await ordersRepository.updateCustomerBalances(finalCustomerId, {
          khataDelta: paymentMethod === "CREDIT" ? totalAmount : 0,
          totalSpentDelta: totalAmount,
          loyaltyDelta: Math.floor(totalAmount / 100) * 10,
        }, tx);
      }

      // 7. Return created order with full relationships
      return await ordersRepository.getOrderWithFullIncludes(order.id, tx);
    });

    // Background Invoice PDF generation
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
