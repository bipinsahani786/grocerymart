import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function getFileUrl(path: any): string {
  if (!path) return '';

  let target = path;

  // If array, take first valid element
  if (Array.isArray(target)) {
    target = target.find((item) => Boolean(item)) || '';
  }

  if (typeof target !== 'string' || !target.trim()) return '';
  let clean = target.trim();

  // Handle JSON stringified array or object
  if (clean.startsWith('[') || clean.startsWith('{')) {
    try {
      const parsed = JSON.parse(clean);
      if (Array.isArray(parsed) && parsed.length > 0) {
        clean = String(parsed[0]).trim();
      }
    } catch {
      // Ignore parse error
    }
  }

  // Convert r2.dev domain URLs or direct upload paths to backend Cloudflare R2 streaming endpoint
  if (clean.includes('.r2.dev/uploads/')) {
    const filename = clean.split('.r2.dev/uploads/')[1];
    clean = `/api/upload/file/uploads/${filename}`;
  } else if (clean.includes('.r2.dev/')) {
    const filename = clean.split('.r2.dev/')[1];
    clean = `/api/upload/file/${filename}`;
  } else if (clean.startsWith('uploads/')) {
    clean = `/api/upload/file/${clean}`;
  }

  if (
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    return clean;
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    return clean;
  }

  // If path starts with /api/, prioritize relative URL so Vite proxy / same-origin prevents CORP CORS blocking
  if (clean.startsWith('/api/')) {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl && (apiUrl.startsWith('http://') || apiUrl.startsWith('https://'))) {
      const baseUrl = apiUrl.replace(/\/api\/?$/, '');
      return `${baseUrl}${clean}`;
    }
    return clean;
  }

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');

  return `${baseUrl}${clean.startsWith('/') ? '' : '/'}${clean}`;
}

export function extractErrorMessage(error: any, fallback = 'An unexpected error occurred'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  // Check if it's an Axios-like error
  if (error.response?.data) {
    const data = error.response.data;
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    
    // Sometimes validation errors return an array of messages
    if (Array.isArray(data.errors)) {
      return data.errors.map((e: any) => e.msg || e.message || String(e)).join(', ');
    }
  }

  if (error.message) {
    return error.message;
  }

  return fallback;
}