import { settingsService } from "./settings.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class SettingsController {
  getSettings = catchAsync(async (req, res) => {
    const result = await settingsService.getSettings(req.user, req.query.storeId);
    res.json(result);
  });

  updateSettings = catchAsync(async (req, res) => {
    const result = await settingsService.updateSettings(req.user, req.query.storeId, req.body);
    res.json(result);
  });
}

export const settingsController = new SettingsController();
