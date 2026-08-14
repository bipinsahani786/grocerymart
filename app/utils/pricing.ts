export interface PricingConfig {
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  taxRatePercent: number; // e.g. 5 for 5% GST
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  freeDeliveryThreshold: 299.0,
  standardDeliveryFee: 30.0,
  taxRatePercent: 5.0,
};

export interface PricingSummary {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  grandTotal: number;
  isFreeDelivery: boolean;
}

/**
 * Single Responsibility & Open/Closed:
 * Pure functions to compute cart totals, taxes, delivery fees, and discounts.
 */
export function calculatePricing(
  items: Array<{ price: number; quantity: number }>,
  discountPercent: number = 0,
  config: PricingConfig = DEFAULT_PRICING_CONFIG
): PricingSummary {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const isFreeDelivery = subtotal >= config.freeDeliveryThreshold || subtotal === 0;
  const deliveryFee = isFreeDelivery ? 0 : config.standardDeliveryFee;
  const discount = (subtotal * discountPercent) / 100;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = (taxableAmount * config.taxRatePercent) / 100;
  const grandTotal = Math.max(0, taxableAmount + deliveryFee + tax);

  return {
    subtotal,
    deliveryFee,
    tax,
    discount,
    grandTotal,
    isFreeDelivery,
  };
}
