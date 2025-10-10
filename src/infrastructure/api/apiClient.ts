/**
 * API Client - Base HTTP Client
 * 
 * Centralized HTTP client with:
 * - Request/Response interceptors
 * - Error handling
 * - Authentication token management
 * - Retry logic
 * - Request cancellation
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

export type RequestInterceptor = (config: AxiosRequestConfig) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
export type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;

/**
 * Base API Client
 * This should be imported from your existing apiClient implementation
 */
class ApiClient {
  private instance: AxiosInstance | null = null;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  /**
   * Initialize the API client
   */
  initialize(): void {
    // Implementation moved from shared/services/apiClient.ts
    // This will be the actual Axios instance configuration
  }

  /**
   * GET request
   */
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Implementation
    throw new Error('Not implemented - use existing apiClient');
  }

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Implementation
    throw new Error('Not implemented - use existing apiClient');
  }

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Implementation
    throw new Error('Not implemented - use existing apiClient');
  }

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Implementation
    throw new Error('Not implemented - use existing apiClient');
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    // Implementation
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    // Implementation
  }
}

// Singleton instance
const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1',
  timeout: 30000,
  withCredentials: true,
});

export { apiClient };
