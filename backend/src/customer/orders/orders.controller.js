import { customerOrdersService } from "./orders.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class CustomerOrdersController {
  createOrder = catchAsync(async (req, res) => {
    const order = await customerOrdersService.placeOrder(req.body, req.user);
    res.status(201).json({
      success: true,
      message: "Order placed successfully and recorded in database.",
      data: order,
    });
  });

  getMyOrders = catchAsync(async (req, res) => {
    const userId = req.user?.id || req.query.userId;
    const userPhone = req.user?.phone || req.query.phone;
    const orders = await customerOrdersService.getCustomerOrders(userId, userPhone);
    res.json({
      success: true,
      data: orders,
    });
  });

  getOrderById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const order = await customerOrdersService.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    res.json({
      success: true,
      data: order,
    });
  });
}

export const customerOrdersController = new CustomerOrdersController();
