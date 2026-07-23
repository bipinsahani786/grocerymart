/** Manager account status options */
export const MANAGER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
} as const;

export type ManagerStatus = (typeof MANAGER_STATUS)[keyof typeof MANAGER_STATUS];

/** Status label mapping for display */
export const MANAGER_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending: 'Pending Setup',
};

/** Status badge colors */
export const MANAGER_STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  suspended: 'bg-rose-100 text-rose-700',
  pending: 'bg-amber-100 text-amber-700',
};

/** Manager role labels */
export const MANAGER_ROLE_LABELS: Record<string, string> = {
  store_manager: 'Store Manager',
  admin: 'Admin',
  super_admin: 'Super Admin',
};
