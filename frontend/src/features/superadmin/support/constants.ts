export const CATEGORY_MAP: Record<string, { label: string; icon: string }> = {
  DELIVERY: { label: 'Delivery Delay', icon: '🚚' },
  MISSING_ITEMS: { label: 'Missing / Wrong Item', icon: '📦' },
  QUALITY: { label: 'Quality / Freshness', icon: '🥦' },
  REFUND: { label: 'Refund / Payment', icon: '💳' },
  PAYMENT: { label: 'Payment Failure', icon: '⚡' },
  APP_ISSUE: { label: 'App / Bug Issue', icon: '📱' },
  OTHER: { label: 'General Help', icon: '❓' },
};

export const QUICK_REPLIES = [
  'We apologize for the inconvenience. We are currently investigating this with the store team.',
  'Your refund has been initiated and will reflect in your account within 24-48 hours.',
  'The delivery executive is on the way with your updated order. Thank you for your patience!',
  'Your issue has been resolved. Please let us know if you need any further assistance.',
];

export const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
];

export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'DELIVERY', label: '🚚 Delivery Delay' },
  { value: 'MISSING_ITEMS', label: '📦 Missing / Wrong Item' },
  { value: 'QUALITY', label: '🥦 Quality / Freshness' },
  { value: 'REFUND', label: '💳 Refund / Payment' },
  { value: 'PAYMENT', label: '⚡ Payment Failure' },
  { value: 'APP_ISSUE', label: '📱 App / Bug Issue' },
  { value: 'OTHER', label: '❓ General Help' },
];

export const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'URGENT', label: '🔥 Urgent' },
  { value: 'HIGH', label: '⚡ High' },
  { value: 'MEDIUM', label: '🔹 Medium' },
  { value: 'LOW', label: '◽ Low' },
];
