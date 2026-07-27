import { z } from 'zod';

// ── Create / Update Store Schema ──
export const storeSchema = z
  .object({
    name: z.string().min(1, 'Store name is required').max(200, 'Store name is too long'),
    address: z.string().min(1, 'Address is required').max(500, 'Address is too long'),
    lat: z
      .union([z.string(), z.number()])
      .refine(
        (val) =>
          val !== '' &&
          val !== null &&
          val !== undefined &&
          !isNaN(Number(val)) &&
          Number(val) !== 0,
        {
          message: 'Latitude (GPS) is required',
        }
      )
      .transform((val) => Number(val))
      .pipe(
        z
          .number()
          .min(-90, 'Invalid latitude (-90 to 90)')
          .max(90, 'Invalid latitude (-90 to 90)')
      ),
    long: z
      .union([z.string(), z.number()])
      .refine(
        (val) =>
          val !== '' &&
          val !== null &&
          val !== undefined &&
          !isNaN(Number(val)) &&
          Number(val) !== 0,
        {
          message: 'Longitude (GPS) is required',
        }
      )
      .transform((val) => Number(val))
      .pipe(
        z
          .number()
          .min(-180, 'Invalid longitude (-180 to 180)')
          .max(180, 'Invalid longitude (-180 to 180)')
      ),
    radiusKm: z
      .union([z.string(), z.number()])
      .refine(
        (val) =>
          val !== '' &&
          val !== null &&
          val !== undefined &&
          !isNaN(Number(val)) &&
          Number(val) > 0,
        {
          message: 'Service radius (km) is required',
        }
      )
      .transform((val) => Number(val))
      .pipe(
        z
          .number()
          .min(0.1, 'Minimum radius is 0.1 km')
          .max(100, 'Maximum radius is 100 km')
      ),
    phone: z
      .string()
      .min(1, 'Store contact phone is required')
      .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit phone number (e.g. 9876543210)'),
    gstin: z
      .string()
      .min(1, 'GSTIN identification is required')
      .regex(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/, 'Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)'),
    openingTime: z.string().min(1, 'Opening time is required'),
    closingTime: z.string().min(1, 'Closing time is required'),
    isActive: z.boolean().default(true),
    posEnabled: z.boolean().default(true),
    deliveryEnabled: z.boolean().default(false),
    clickCollectEnabled: z.boolean().default(false),
    managerName: z.string().optional().nullable().or(z.literal('')),
    managerEmail: z.string().optional().nullable().or(z.literal('')),
    managerPhone: z.string().optional().nullable().or(z.literal('')),
    managerPassword: z.string().optional().nullable().or(z.literal('')),
  })
  .refine(
    (data) => data.posEnabled || data.deliveryEnabled || data.clickCollectEnabled,
    {
      message: 'At least one franchise module (POS, Delivery, or Click & Collect) must be enabled!',
      path: ['posEnabled'],
    }
  );

export type StoreFormValues = z.infer<typeof storeSchema>;
