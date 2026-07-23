import { z } from 'zod';

// ── Tax Component Schema ──
export const taxComponentSchema = z.object({
  name: z.string().min(1, 'Component name is required'),
  rate: z.coerce.number().min(0, 'Rate must be positive'),
});

// ── Create Tax Class Schema ──
export const createTaxClassSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  effectiveFrom: z.string().min(1, 'Effective date is required'),
  components: z.array(taxComponentSchema).min(1, 'At least one tax component is required'),
});

export type CreateTaxClassFormValues = z.infer<typeof createTaxClassSchema>;

// ── Schedule Tax Rate Schema ──
export const scheduleTaxRateSchema = z.object({
  effectiveFrom: z.string().min(1, 'Effective date is required'),
  components: z.array(taxComponentSchema).min(1, 'At least one tax component is required'),
});

export type ScheduleTaxRateFormValues = z.infer<typeof scheduleTaxRateSchema>;

// ── TypeScript Interfaces (API response shapes) ──
export interface TaxComponent {
  id: string;
  name: string;
  rate: number;
}

export interface TaxRate {
  id: string;
  taxClassId: string;
  effectiveFrom: string;
  isActive: boolean;
  components: TaxComponent[];
}

export interface TaxClass {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  rates: TaxRate[];
  currentActiveRate: TaxRate | null;
  currentTotalRate: number;
  _count: {
    products: number;
  };
}
