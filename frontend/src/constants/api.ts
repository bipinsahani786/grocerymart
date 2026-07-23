export const API_ENDPOINTS = {
  STORES: '/admin/stores',
  STORE_STATUS: (id: string) => `/admin/stores/${id}/status`,
  STORE_DETAIL: (id: string) => `/admin/stores/${id}`,
};
