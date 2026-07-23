/** Default store configuration */
export const DEFAULT_OPENING_TIME = '08:00';
export const DEFAULT_CLOSING_TIME = '22:00';
export const DEFAULT_RADIUS_KM = 5;

/** Delivery radius limits (km) */
export const MIN_RADIUS_KM = 0.1;
export const MAX_RADIUS_KM = 100;

/** Store status options */
export const STORE_STATUS_OPTIONS = [
  { label: 'Active', value: true },
  { label: 'Inactive', value: false },
] as const;

/** Store feature toggles */
export const STORE_FEATURES = [
  { key: 'posEnabled', label: 'POS (Point of Sale)', description: 'Walk-in billing and checkout' },
  { key: 'deliveryEnabled', label: 'Delivery', description: 'Home delivery orders' },
  { key: 'clickCollectEnabled', label: 'Click & Collect', description: 'Online order, in-store pickup' },
] as const;
