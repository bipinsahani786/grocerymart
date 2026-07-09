import { z } from "zod";

export const createStoreSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Store name is required"),
    address: z.string().min(3, "Address is required"),
    lat: z.coerce.number(),
    long: z.coerce.number(),
    radiusKm: z.coerce.number().positive().optional(),
    phone: z.string().optional().nullable(),
    gstin: z.string().optional().nullable(),
    openingTime: z.string().optional(),
    closingTime: z.string().optional(),
    isActive: z.boolean().optional(),
    posEnabled: z.boolean().optional(),
    deliveryEnabled: z.boolean().optional(),
    clickCollectEnabled: z.boolean().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
