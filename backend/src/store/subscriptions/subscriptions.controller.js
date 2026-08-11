import { subscriptionsService } from "./subscriptions.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class SubscriptionsController {
  getSubscriptions = catchAsync(async (req, res) => {
    const { storeId, page, limit, search } = req.query;
    const result = await subscriptionsService.getSubscriptions(req.user, storeId, page, limit, search);
    res.json(result);
  });

  createSubscription = catchAsync(async (req, res) => {
    const result = await subscriptionsService.createSubscription(req.user, req.query.storeId, req.body);
    res.status(201).json(result);
  });

  updateSubscription = catchAsync(async (req, res) => {
    const result = await subscriptionsService.updateSubscription(req.user, req.query.storeId, req.params.id, req.body);
    res.json(result);
  });

  deleteSubscription = catchAsync(async (req, res) => {
    const result = await subscriptionsService.deleteSubscription(req.user, req.query.storeId, req.params.id);
    res.json(result);
  });
}

export const subscriptionsController = new SubscriptionsController();
