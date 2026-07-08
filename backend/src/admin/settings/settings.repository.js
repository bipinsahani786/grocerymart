import { prisma } from "../../../config/prisma.js";

export class SettingsRepository {
  async getPlatformSettings() {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: "platform_settings" },
    });
    if (!setting) {
      const defaultSettings = {
        platformCommissionRate: 0.15,
        cancellationFeeRate: 0.05,
        overstayPenaltyRate: 1.5,
      };
      return await prisma.systemSetting.create({
        data: {
          key: "platform_settings",
          value: defaultSettings,
          description: "Global fee, commission, and penalty rates across the platform",
        },
      });
    }
    return setting;
  }

  async updatePlatformSettings(value) {
    return await prisma.systemSetting.upsert({
      where: { key: "platform_settings" },
      create: {
        key: "platform_settings",
        value,
        description: "Global fee, commission, and penalty rates across the platform",
      },
      update: { value },
    });
  }
}

export const settingsRepository = new SettingsRepository();
