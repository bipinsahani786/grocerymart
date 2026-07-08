import { settingsService } from "./settings.service.js";
import { catchAsync } from "../../utils/catchAsync.js";

export class SettingsController {
  getPlatformSettings = catchAsync(async (req, res) => {
    const result = await settingsService.getPlatformSettings();
    res.json(result);
  });

  updatePlatformSettings = catchAsync(async (req, res) => {
    const result = await settingsService.updatePlatformSettings(req.body);
    res.json(result);
  });
}

export const settingsController = new SettingsController();
