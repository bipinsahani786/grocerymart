export interface PricingConfig {
  freeDeliveryThreshold: number;
  standardDeliveryFee: number;
  taxRatePercent: number; // e.g. 5 for 5% GST
  freeDeliveryKmRadius?: number;
  deliveryChargePerKm?: number;
  minDeliveryCharge?: number;
  distanceKm?: number;
}

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  freeDeliveryThreshold: 299.0,
  standardDeliveryFee: 30.0,
  taxRatePercent: 5.0,
  freeDeliveryKmRadius: 0,
  deliveryChargePerKm: 0,
  minDeliveryCharge: 30.0,
  distanceKm: 1.2,
};

export interface PricingSummary {
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  tip: number;
  grandTotal: number;
  isFreeDelivery: boolean;
  deliveryRuleReason?: string;
}

/**
 * Single Responsibility & Open/Closed:
 * Pure function to compute cart totals, taxes, distance-based delivery fees, tip, and discounts
 * adhering strictly to the backend Store Panel delivery & KM rules.
 */
export function calculatePricing(
  items: Array<{ price: number; quantity: number }>,
  discountValue: number = 0,
  isDiscountPercentage: boolean = false,
  config: PricingConfig = DEFAULT_PRICING_CONFIG,
  tipAmount: number = 0
): PricingSummary {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const freeKm = config.freeDeliveryKmRadius || 0;
  const minCharge = typeof config.minDeliveryCharge === 'number' ? config.minDeliveryCharge : config.standardDeliveryFee || 0;
  const chargePerKm = config.deliveryChargePerKm || 0;
  const dist = config.distanceKm || 1.2;

  let isFreeDelivery = false;
  let deliveryFee = 0;
  let deliveryRuleReason = '';

  // ── Store Panel Exact Delivery & KM Rule ──
  if (subtotal >= config.freeDeliveryThreshold || subtotal === 0) {
    isFreeDelivery = true;
    deliveryFee = 0;
    deliveryRuleReason = subtotal > 0 ? `Free on orders above ₹${config.freeDeliveryThreshold}` : '';
  } else if (freeKm > 0 && dist <= freeKm) {
    isFreeDelivery = true;
    deliveryFee = 0;
    deliveryRuleReason = `Free Delivery (${dist} km is within ${freeKm} km free radius)`;
  } else if (freeKm > 0) {
    const chargeableDist = Math.max(0, dist - freeKm);
    deliveryFee = Math.max(minCharge, chargeableDist * chargePerKm);
    isFreeDelivery = deliveryFee === 0;
    deliveryRuleReason = deliveryFee === 0
      ? 'Free Delivery'
      : `₹${deliveryFee.toFixed(0)} (${chargeableDist.toFixed(1)} km chargeable @ ₹${chargePerKm}/km)`;
  } else {
    deliveryFee = minCharge;
    isFreeDelivery = deliveryFee === 0;
    deliveryRuleReason = deliveryFee === 0 ? 'Free Delivery' : `Standard Delivery: ₹${minCharge}`;
  }

  const discount = isDiscountPercentage
    ? (subtotal * discountValue) / 100
    : Math.min(discountValue, subtotal);

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = (taxableAmount * config.taxRatePercent) / 100;
  const grandTotal = Math.max(0, taxableAmount + deliveryFee + tax + tipAmount);

  return {
    subtotal,
    deliveryFee,
    tax,
    discount,
    tip: tipAmount,
    grandTotal,
    isFreeDelivery,
    deliveryRuleReason,
  };
}
