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
