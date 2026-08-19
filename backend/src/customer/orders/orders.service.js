import { customerOrdersRepository } from "./orders.repository.js";

export class CustomerOrdersService {
  /**
   * Place an order and save each & every detail in the Order table
   */
  async placeOrder(payload, authenticatedUser = null) {
    const {
      customerId: providedCustomerId,
      userPhone,
      userEmail,
      storeId,
      addressId,
      deliveryAddress,
      fulfillmentMode,
      items,
      subtotal,
      discount,
      discountReason,
      taxAmount,
      deliveryFee,
      totalAmount,
      customerNote,
      paymentMethod,
    } = payload;

    // 1. Resolve Customer User ID
    let finalCustomerId = authenticatedUser?.id || providedCustomerId;
    if (!finalCustomerId && (userPhone || userEmail)) {
      const user = await customerOrdersRepository.findUser(userPhone || userEmail);
      if (user) {
        finalCustomerId = user.id;
      }
    }

    // 2. Resolve Store
    const store = await customerOrdersRepository.findStore(storeId);
    if (!store) {
      throw new Error("No active store found to process this order.");
    }

    // 3. Resolve Address if Delivery Mode
    let finalAddressId = addressId;
    if ((fulfillmentMode === "delivery" || !fulfillmentMode) && !finalAddressId && deliveryAddress) {
      finalAddressId = await customerOrdersRepository.resolveAddress(
        finalCustomerId,
        deliveryAddress,
        addressId
      );
    }

    // 4. Validate Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Cannot place an order with an empty basket.");
    }

    // 5. Create Order in Database
    const createdOrder = await customerOrdersRepository.createOrder({
      customerId: finalCustomerId,
      storeId: store.id,
      addressId: finalAddressId,
      type: fulfillmentMode === "pickup" ? "CLICK_COLLECT" : "DELIVERY",
      subtotal: subtotal || 0,
      discount: discount || 0,
      discountReason: discountReason || "",
      taxAmount: taxAmount || 0,
      deliveryFee: deliveryFee || 0,
      totalAmount: totalAmount || 0,
      customerNote: customerNote || "",
      items,
      paymentMethod: paymentMethod || "cod",
    });

    return createdOrder;
  }

  /**
   * Get all orders for the customer
   */
  async getCustomerOrders(userId, userPhone = null) {
    let customerId = userId;
    if (!customerId && userPhone) {
      const user = await customerOrdersRepository.findUser(userPhone);
      if (user) customerId = user.id;
    }
    return await customerOrdersRepository.getCustomerOrders(customerId);
  }

  /**
   * Get single order by ID
   */
  async getOrderById(orderId) {
    return await customerOrdersRepository.getOrderById(orderId);
  }
}

export const customerOrdersService = new CustomerOrdersService();
