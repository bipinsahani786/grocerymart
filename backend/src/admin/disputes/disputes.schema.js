import { z } from "zod";

export const resolveDisputeSchema = z.object({
  body: z.object({
    resolution: z.enum(["full_refund", "partial_refund", "no_refund", "owner_penalty"]),
    refundAmount: z.number().nonnegative().optional(),
    adminNote: z.string().min(1, "Admin note required"),
  }),
});
