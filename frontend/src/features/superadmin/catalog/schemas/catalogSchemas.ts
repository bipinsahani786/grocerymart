import { z } from 'zod';

export const masterCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  parentId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  sortOrder: z.number().optional().default(0),
});

export type MasterCategory = z.infer<typeof masterCategorySchema> & {
  children?: MasterCategory[];
};

export const masterProductVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required'),
  barcode: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  mrp: z.coerce.number().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export const masterProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name is required'),
  sku: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  productType: z.enum(['simple', 'variant', 'loose']),
  unit: z.string().min(1, 'Unit is required'),
  basePrice: z.coerce.number().min(0, 'Base price must be positive'),
  mrp: z.coerce.number().optional().nullable(),
  taxClassId: z.string().optional().nullable(),
  hsnCode: z.string().optional().nullable(),
  imageUrls: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  variants: z.array(masterProductVariantSchema).optional(),
});

export type MasterProductVariant = z.infer<typeof masterProductVariantSchema>;
export type MasterProduct = z.infer<typeof masterProductSchema> & {
  category?: MasterCategory;
};
