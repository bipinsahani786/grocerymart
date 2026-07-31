export const normalizeStaffRole = (roleInput) => {
  if (!roleInput) return "CASHIER";
  const str = String(roleInput).trim();
  const upper = str.toUpperCase().replace(/[-\s]+/g, "_");

  if (upper === "CASHIER" || upper === "POS_CASHIER") return "CASHIER";
  if (upper === "PICKER" || upper === "ORDER_PICKER") return "PICKER";
  if (upper === "DELIVERY_RIDER" || upper === "DELIVERY_PARTNER" || upper === "DELIVERY") return "DELIVERY_PARTNER";
  if (upper === "STORE_MANAGER" || upper === "ASSISTANT_STORE_MANAGER" || upper === "MANAGER") return "STORE_MANAGER";
  if (upper === "SUPER_ADMIN" || upper === "ADMIN") return "SUPER_ADMIN";
  if (upper === "CUSTOMER") return "CUSTOMER";

  const validRoles = ["SUPER_ADMIN", "STORE_MANAGER", "CASHIER", "PICKER", "DELIVERY_PARTNER", "CUSTOMER"];
  if (validRoles.includes(upper)) return upper;

  return "CASHIER";
};
