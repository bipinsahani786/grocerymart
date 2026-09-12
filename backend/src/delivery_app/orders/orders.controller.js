import { deliveryOrdersService } from "./orders.service.js";

export class DeliveryOrdersController {
  async getIncomingOrder(req, res) {
    try {
      const userId = req.user.id;
      const lat = req.query.lat ? parseFloat(req.query.lat) : undefined;
      const lng = req.query.lng ? parseFloat(req.query.lng) : undefined;
      const coords =
        lat !== undefined && !isNaN(lat) && lng !== undefined && !isNaN(lng)
          ? { lat, lng }
          : null;

      const order = await deliveryOrdersService.getIncomingOrder(userId, coords);
      return res.status(200).json({
        success: true,
        data: order || null,
      });
    } catch (err) {
      console.error("[OrdersController] getIncomingOrder error:", err);
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to fetch incoming orders",
      });
    }
  }

  async acceptOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const acceptedOrder = await deliveryOrdersService.acceptOrder(orderId, userId);
      return res.status(200).json({
        success: true,
        message: "Order accepted successfully",
        data: acceptedOrder,
      });
    } catch (err) {
      console.error("[OrdersController] acceptOrder error:", err);
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || "Failed to accept order",
      });
    }
  }

  async rejectOrder(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { reason } = req.body;
      const result = await deliveryOrdersService.rejectOrder(orderId, userId, reason);
      return res.status(200).json(result);
    } catch (err) {
      console.error("[OrdersController] rejectOrder error:", err);
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || "Failed to pass order",
      });
    }
  }

  async getActiveOrder(req, res) {
    try {
      const userId = req.user.id;
      const activeOrder = await deliveryOrdersService.getActiveOrder(userId);
      return res.status(200).json({
        success: true,
        data: activeOrder,
      });
    } catch (err) {
      console.error("[OrdersController] getActiveOrder error:", err);
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to fetch active order",
      });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { status } = req.body;
      const updatedOrder = await deliveryOrdersService.updateOrderStatus(orderId, userId, status);
      return res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: updatedOrder,
      });
    } catch (err) {
      console.error("[OrdersController] updateOrderStatus error:", err);
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || "Failed to update order status",
      });
    }
  }

  async completeDelivery(req, res) {
    try {
      const userId = req.user.id;
      const { orderId } = req.params;
      const { otp } = req.body;
      const completedOrder = await deliveryOrdersService.completeDelivery(orderId, userId, otp);
      return res.status(200).json({
        success: true,
        message: "Order delivered successfully!",
        data: completedOrder,
      });
    } catch (err) {
      console.error("[OrdersController] completeDelivery error:", err);
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || "Failed to complete delivery",
      });
    }
  }

  async getCompletedTrips(req, res) {
    try {
      const userId = req.user.id;
      const trips = await deliveryOrdersService.getCompletedTrips(userId);
      return res.status(200).json({
        success: true,
        data: trips,
      });
    } catch (err) {
      console.error("[OrdersController] getCompletedTrips error:", err);
      return res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Failed to fetch completed trips",
      });
    }
  }
}

export const deliveryOrdersController = new DeliveryOrdersController();
