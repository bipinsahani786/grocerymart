import { z } from 'zod';

// ── Create Manager Schema ──
export const createManagerSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Valid email is required'),
  phone: z
    .string()
    .regex(/^(\+?\d{1,4}[\s-]?)?(\(?\d{1,}\)?[\s-]?)*\d{1,}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  storeId: z.string().nullable().optional(),
});

export type CreateManagerValues = z.infer<typeof createManagerSchema>;

// ── Update Manager Schema (password optional) ──
export const updateManagerSchema = z.object({
  name: z.string().min(2, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Valid email is required'),
  phone: z
    .string()
    .regex(/^(\+?\d{1,4}[\s-]?)?(\(?\d{1,}\)?[\s-]?)*\d{1,}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  storeId: z.string().nullable().optional(),
});

export type UpdateManagerValues = z.infer<typeof updateManagerSchema>;
