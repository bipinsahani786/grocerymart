import { z } from "zod";

export const createManagerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Manager name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().optional().nullable(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    storeId: z.string().uuid("Select a valid store").optional().nullable(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const updateManagerProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Manager name is required").optional(),
    email: z.string().email("Valid email is required").optional(),
    phone: z.string().optional().nullable(),
    storeId: z.string().uuid("Select a valid store").optional().nullable(),
  }),
  params: z.object({
    id: z.string().uuid("Valid manager ID is required"),
  }),
});

export const updateManagerStatusSchema = z.object({
  body: z.object({
    status: z.enum(["active", "suspended", "banned"]),
  }),
  params: z.object({
    id: z.string().uuid("Valid manager ID is required"),
  }),
});

export const updateManagerPasswordSchema = z.object({
  body: z.object({
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
  params: z.object({
    id: z.string().uuid("Valid manager ID is required"),
  }),
});
