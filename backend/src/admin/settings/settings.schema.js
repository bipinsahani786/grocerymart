import { z } from "zod";

export const updatePlatformSettingsSchema = z.object({
  body: z.object({
    platformCommissionRate: z.number().nonnegative().max(1),
    cancellationFeeRate: z.number().nonnegative().max(1),
    overstayPenaltyRate: z.number().nonnegative(),
  }),
});
