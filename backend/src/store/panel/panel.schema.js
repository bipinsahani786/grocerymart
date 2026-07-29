import { z } from "zod";

const optionalText = z.string().trim().optional().nullable();

export const createProductSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid("Invalid Category ID").optional().nullable(),
    name: z.string().min(2, "Product name is required"),
    categoryName: optionalText,
    sku: optionalText,
    barcode: z.string().min(1, "Barcode is required"),
    brand: optionalText,
    description: optionalText,
    type: z.enum(["simple", "weighted", "variable", "bundle", "service", "perishable"]).default("simple"),
    mrp: z.coerce.number().min(0).default(0).optional().nullable(),
    sellingPrice: z.coerce.number().min(0, "Selling price cannot be negative"),
    costPrice: z.coerce.number().min(0).default(0),
    taxRate: z.coerce.number().min(0).default(0),
    hsnCode: optionalText,
    unit: z.string().default("pcs"),
    quantity: z.coerce.number().min(0).default(0),
    lowStockAlert: z.coerce.number().min(0).default(5),
    rackLocation: optionalText,
    expiryDate: optionalText,
    showOnline: z.boolean().default(true),
    showPOS: z.boolean().default(true),
    deliveryEnabled: z.boolean().default(true),
    clickCollectEnabled: z.boolean().default(true),
  }).refine((data) => {
    if (data.mrp && data.mrp > 0) {
      return data.sellingPrice <= data.mrp;
    }
    return true;
  }, {
    message: "Selling price cannot exceed MRP",
    path: ["sellingPrice"],
  }).refine((data) => {
    return data.categoryId || data.categoryName;
  }, {
    message: "Either category ID or Category Name is required",
    path: ["categoryId"],
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const adjustInventorySchema = z.object({
  body: z.object({
    delta: z.coerce.number(),
    reason: z.string().min(2, "Reason is required"),
  }),
  query: z.object({}).optional(),
  params: z.object({
    productId: z.string().uuid(),
  }),
});

export const createPosOrderSchema = z.object({
  body: z.object({
    customerName: optionalText,
    customerPhone: optionalText,
    discount: z.coerce.number().min(0).default(0),
    paymentMethod: z.enum(["CASH", "CARD", "UPI", "SPLIT", "CREDIT"]).default("CASH"),
    notes: optionalText,
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.coerce.number().positive(),
    })).min(1, "At least one item is required"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PLACED", "ACCEPTED", "PACKING", "PACKED", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED", "COLLECTED", "COMPLETED", "CANCELLED", "REFUNDED"]),
  }),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid(),
  }),
});

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Staff name is required"),
    email: z.string().email().optional().nullable(),
    phone: optionalText,
    password: z.string().min(6).optional().nullable(),
    roleName: z.enum(["CASHIER", "PICKER", "DELIVERY_PARTNER", "STORE_MANAGER"]).default("CASHIER"),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});
