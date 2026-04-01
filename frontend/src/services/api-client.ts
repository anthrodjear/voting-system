// ===========================================
// API CLIENT
// Location: src/services/api-client.ts
// Based on: services/api-client.md specification
// ===========================================

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import type { ApiResponse, ApiError } from '@/types';

// ===========================================
// CONFIGURATION
// ===========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/v1';

// ===========================================
// TYPES
// ===========================================

export interface RequestConfig extends Partial<InternalAxiosRequestConfig> {
  skipAuth?: boolean;
  skipRetry?: boolean;
}

export type ApiClientError = {
  code: string;
  message: string;
  details?: Record<string, string>;
}

// ===========================================
// ERROR CLASSES
// ===========================================

class ApiClientException extends Error {
  code: string;
  status: number;
  details?: Record<string, string>;

  constructor(error: ApiError, status: number) {
    super(error.message);
    this.code = error.code;
    this.status = status;
    this.details = error.details;
    this.name = 'ApiClientException';
  }
}

class UnauthorizedException extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}

// ===========================================
// TOKEN MANAGEMENT
// ===========================================

// Token refresh state
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(callback: (token: string) => void): void {
  refreshSubscribers.push(callback);
}

function onTokenRefreshed(token: string): void {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
}

async function refreshToken(): Promise<boolean> {
  try {
    const storedRefreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    
    if (!storedRefreshToken) {
      return false;
    }

    const response = await axios.post<ApiResponse<{ token: string; refreshToken: string; expiresIn: number }>>(
      `${API_BASE_URL}/auth/refresh`,
      { refreshToken: storedRefreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success && response.data.data) {
      const newToken = response.data.data.token;
      const newRefreshToken = response.data.data.refreshToken;
      useAuthStore.getState().login(
        useAuthStore.getState().user!,
        newToken,
        response.data.data.expiresIn
      );
      if (typeof window !== 'undefined' && newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      onTokenRefreshed(newToken);
      return true;
    }

    return false;
  } catch (error) {
    useAuthStore.getState().logout();
    return false;
  }
}

function logout(): void {
  useAuthStore.getState().logout();
}

// ===========================================
// AXIOS INSTANCE CREATION
// ===========================================

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===========================================
// REQUEST INTERCEPTOR
// ===========================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip auth for public endpoints
    if ((config as RequestConfig).skipAuth) {
      return config;
    }

    // Read token from zustand store (has it immediately after login)
    let token: string | null = useAuthStore.getState().token;
    
    // Fallback to localStorage if zustand hasn't rehydrated yet
    if (!token && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed.state?.token || null;
        }
      } catch {
        // Ignore parse errors
      }
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ===========================================
// RESPONSE INTERCEPTOR
// ===========================================

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // If we've already tried to refresh, logout
      if (originalRequest._retry) {
        logout();
        return Promise.reject(error);
      }

      // Mark as retried
      originalRequest._retry = true;

      // If not currently refreshing, try to refresh
      if (!isRefreshing) {
        isRefreshing = true;

        const refreshed = await refreshToken();
        isRefreshing = false;

        if (refreshed) {
          // Retry the original request
          return apiClient.request(originalRequest);
        }

        // Refresh failed, logout
        logout();
        return Promise.reject(new UnauthorizedException('Session expired'));
      }

      // Already refreshing, queue the request
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(apiClient.request(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

// ===========================================
// HELPER FUNCTIONS
// ===========================================

function parseApiError(error: AxiosError): ApiClientException {
  const response = error.response;
  
  if (response) {
    const data = response.data as ApiResponse<unknown> | undefined;
    const apiError: ApiError = data?.error || {
      code: response.status.toString(),
      message: response.statusText || 'An error occurred',
    };
    return new ApiClientException(apiError, response.status);
  }

  return new ApiClientException(
    { code: 'NETWORK_ERROR', message: error.message || 'Network error' },
    0
  );
}

// ===========================================
// API METHODS
// ===========================================

export const api = {
  get: <T = unknown>(url: string, config?: RequestConfig): Promise<T> =>
    apiClient.get<ApiResponse<T>>(url, config).then(response => {
      if (response.data.success) {
        return response.data.data as T;
      }
      throw new ApiClientException(response.data.error || { code: 'ERROR', message: 'Request failed' }, response.status);
    }),

  post: <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> =>
    apiClient.post<ApiResponse<T>>(url, data, config).then(response => {
      if (response.data.success) {
        return response.data.data as T;
      }
      throw new ApiClientException(response.data.error || { code: 'ERROR', message: 'Request failed' }, response.status);
    }),

  put: <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> =>
    apiClient.put<ApiResponse<T>>(url, data, config).then(response => {
      if (response.data.success) {
        return response.data.data as T;
      }
      throw new ApiClientException(response.data.error || { code: 'ERROR', message: 'Request failed' }, response.status);
    }),

  patch: <T = unknown>(url: string, data?: unknown, config?: RequestConfig): Promise<T> =>
    apiClient.patch<ApiResponse<T>>(url, data, config).then(response => {
      if (response.data.success) {
        return response.data.data as T;
      }
      throw new ApiClientException(response.data.error || { code: 'ERROR', message: 'Request failed' }, response.status);
    }),

  delete: <T = unknown>(url: string, config?: RequestConfig): Promise<T> =>
    apiClient.delete<ApiResponse<T>>(url, config).then(response => {
      if (response.data.success) {
        return response.data.data as T;
      }
      throw new ApiClientException(response.data.error || { code: 'ERROR', message: 'Request failed' }, response.status);
    }),

  // File upload
  upload: <T = unknown>(url: string, formData: FormData, config?: RequestConfig): Promise<T> =>
    apiClient.post<ApiResponse<T>>(url, formData, {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    }).then(response => {
      if (response.data.success) {
        return response.data.data as T;
      }
      throw new ApiClientException(response.data.error || { code: 'ERROR', message: 'Upload failed' }, response.status);
    }),
};

// ===========================================
// EXPORTS
// ===========================================

export { apiClient };
export { ApiClientException, UnauthorizedException };
export { ApiClientException as ApiException };
export default api;
