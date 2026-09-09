import { API_CONFIG } from '../config/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  phone?: string;
}

export interface RequestOptions extends RequestInit {
  token?: string | null;
  params?: Record<string, string | number | boolean | undefined>;
}

/**
 * Unified HTTP request client and network error handler for Partner App
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_CONFIG.BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const fullPath = path.startsWith('http') ? path : `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    if (!params) return fullPath;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${fullPath}?${queryString}` : fullPath;
  }

  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { token, params, headers, ...restOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>),
    };

    try {
      const response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let errorMessage = data?.message || data?.error;
        if (Array.isArray(data?.errors) && data.errors.length > 0) {
          errorMessage = data.errors.map((e: any) => e.message).join('. ');
        }
        if (!errorMessage) {
          errorMessage = `HTTP ${response.status}: Request failed`;
        }

        return {
          success: false,
          error: errorMessage,
          message: errorMessage,
          data: data?.data,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        phone: data.phone,
      };
    } catch (networkError: any) {
      console.warn('[API Client Network Error]', networkError.message);
      return {
        success: false,
        error: networkError.message || 'Network connection failed. Please check your internet connection.',
        message: 'Network connection error. Ensure backend server is running.',
      };
    }
  }

  get<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T = any>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T = any>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
