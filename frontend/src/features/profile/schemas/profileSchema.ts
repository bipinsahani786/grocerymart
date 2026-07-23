import { z } from 'zod';

// ── Profile Update Schema ──
export const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Valid email required'),
  phone: z
    .string()
    .regex(/^(\+?\d{1,4}[\s-]?)?(\(?\d{1,}\)?[\s-]?)*\d{1,}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
});
export type ProfileValues = z.infer<typeof profileSchema>;

// ── Change Password Schema ──
export const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    new_password_confirmation: z.string().min(8, 'Minimum 8 characters'),
  })
  .refine((d) => d.new_password === d.new_password_confirmation, {
    message: 'Passwords do not match',
    path: ['new_password_confirmation'],
  });
export type PasswordValues = z.infer<typeof passwordSchema>;
