import { z } from "zod";

export const createTaxClassSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional().nullable(),
    initialRate: z.object({
      effectiveFrom: z.string().datetime("Valid ISO datetime required for effective date"),
      components: z.array(z.object({
        name: z.string().min(1, "Component name is required"),
        rate: z.number().min(0, "Rate must be positive")
      })).min(1, "At least one tax component is required")
    }).optional()
  }),
});

export const updateTaxClassSchema = z.object({
  params: z.object({
    id: z.string().uuid("Valid tax class ID is required"),
  }),
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
  }),
});

export const deleteTaxClassSchema = z.object({
  params: z.object({
    id: z.string().uuid("Valid tax class ID is required"),
  }),
});

export const scheduleTaxRateSchema = z.object({
  params: z.object({
    id: z.string().uuid("Valid tax class ID is required"),
  }),
  body: z.object({
    effectiveFrom: z.string().datetime("Valid ISO datetime required for effective date"),
    components: z.array(z.object({
      name: z.string().min(1, "Component name is required"),
      rate: z.number().min(0, "Rate must be positive")
    })).min(1, "At least one tax component is required")
  }),
});
