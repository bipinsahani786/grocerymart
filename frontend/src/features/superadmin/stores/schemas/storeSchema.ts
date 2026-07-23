import { z } from 'zod';

// ── Create / Update Store Schema ──
export const storeSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(200, 'Store name is too long'),
  address: z.string().min(1, 'Address is required').max(500, 'Address is too long'),
  lat: z.coerce.number().min(-90, 'Invalid latitude').max(90, 'Invalid latitude'),
  long: z.coerce.number().min(-180, 'Invalid longitude').max(180, 'Invalid longitude'),
  radiusKm: z.coerce
    .number()
    .min(0.1, 'Minimum radius is 0.1 km')
    .max(100, 'Maximum radius is 100 km'),
  phone: z
    .string()
    .regex(/^(\+?\d{1,4}[\s-]?)?(\(?\d{1,}\)?[\s-]?)*\d{1,}$/, 'Invalid phone number')
    .optional()
    .or(z.literal('')),
  gstin: z
    .string()
    .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN format')
    .optional()
    .or(z.literal('')),
  openingTime: z.string().min(1, 'Opening time is required'),
  closingTime: z.string().min(1, 'Closing time is required'),
  isActive: z.boolean().default(true),
  posEnabled: z.boolean().default(true),
  deliveryEnabled: z.boolean().default(false),
  clickCollectEnabled: z.boolean().default(false),
  managerName: z.string().min(2, 'Manager name is required'),
  managerEmail: z.string().email('Valid email is required'),
  managerPhone: z.string().min(10, 'Phone must be at least 10 digits'),
  managerPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type StoreFormValues = z.infer<typeof storeSchema>;
