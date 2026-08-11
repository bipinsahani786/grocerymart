import { dashboardService } from "./dashboard.service.js";
import { catchAsync } from "../../utils/catchAsync.js";
import { uploadToCloudflare } from "../../utils/cloudflare.js";
import { AppError } from "../../utils/AppError.js";

export class DashboardController {
  getDashboard = catchAsync(async (req, res) => {
    const result = await dashboardService.getDashboard(req.user, req.query.storeId);
    res.json(result);
  });

  getAnalytics = catchAsync(async (req, res) => {
    const result = await dashboardService.getAnalytics(req.user, req.query.storeId, req.query.range);
    res.json(result);
  });

  uploadImage = catchAsync(async (req, res) => {
    if (!req.file) {
      throw new AppError("No image provided", 400);
    }
    const url = await uploadToCloudflare(req.file.buffer, req.file.mimetype, req.file.originalname);
    res.status(200).json({ success: true, data: { url } });
  });
}

export const dashboardController = new DashboardController();
