import { z } from "zod";

export const storeValidation = {
  createStore: z.object({
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
      managerName: z.string().min(2, "Manager name is required"),
      managerEmail: z.string().email("Valid manager email is required"),
      managerPhone: z.string().min(10, "Manager phone must be at least 10 digits"),
      managerPassword: z.string().min(6, "Manager password must be at least 6 characters"),
    }),
  }),
  getStores: z.object({
    query: z.object({
      search: z.string().optional(),
      page: z.coerce.number().min(1).optional().default(1),
      limit: z.coerce.number().min(1).max(100).optional().default(10),
      status: z.enum(['active', 'inactive', 'all']).optional().default('all'),
      module: z.enum(['pos', 'delivery', 'click_collect', 'all']).optional().default('all'),
    }),
  }),
  updateStore: z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
      name: z.string().min(2, "Store name is required").optional(),
      address: z.string().min(3, "Address is required").optional(),
      lat: z.coerce.number().optional(),
      long: z.coerce.number().optional(),
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
  }),
  updateStatus: z.object({
    params: z.object({ id: z.string() }),
    body: z.object({
      isActive: z.boolean({ required_error: "isActive status is required" }),
    }),
  }),
};
