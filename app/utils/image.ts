import { API_CONFIG } from '../config/api';

/**
 * Resolves a product or category image URL:
 * - If it is an absolute URL (http/https) or data URI (base64), returns as is.
 * - If it is a relative path (e.g. /api/upload/file/...), prepends API_CONFIG.BASE_URL.
 * - If empty, null, or undefined, returns null.
 */
export function resolveImageUrl(url?: string | null): string | null {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return null;
  }
  const clean = url.trim();
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:')) {
    return clean;
  }
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/+$/, '');
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${baseUrl}${path}`;
}
