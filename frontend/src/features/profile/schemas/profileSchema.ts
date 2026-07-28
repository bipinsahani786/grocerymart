import { z } from 'zod';

// ── Profile Update Schema ──
export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().trim().email('Please enter a valid email address'),
  phone: z
    .string()
    .trim()
    .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
      message: 'Enter Valid phone number!',
    })
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
      .min(6, 'New password must be at least 6 characters'),
    new_password_confirmation: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.new_password === d.new_password_confirmation, {
    message: 'New passwords do not match',
    path: ['new_password_confirmation'],
  });
export type PasswordValues = z.infer<typeof passwordSchema>;
