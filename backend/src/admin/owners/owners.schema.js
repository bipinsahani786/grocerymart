import { z } from "zod";

export const approveKycSchema = z.object({
  body: z.object({
    status: z.enum(["approved", "rejected"]),
  }),
});

export const adminOnboardOwnerSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name required"),
    phone: z.string().min(10, "Valid phone required"),
    email: z.string().email("Valid email required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    ownerType: z.enum(["home", "society", "commercial", "govt", "municipality"]),
    gstNumber: z.string().optional(),
  }),
});
