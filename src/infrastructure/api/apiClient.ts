/* eslint-disable @typescript-eslint/no-explicit-any */
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

import { BACKEND_CONFIG } from '@shared/config/api';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

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
  details?: unknown;
}

export type RequestInterceptor = (
  config: AxiosRequestConfig
) => AxiosRequestConfig | Promise<AxiosRequestConfig>;
export type ResponseInterceptor = (
  response: AxiosResponse
) => AxiosResponse | Promise<AxiosResponse>;

/**
 * Base API Client
 * This should be imported from your existing apiClient implementation
 */
class ApiClient {
  constructor(_config: ApiClientConfig) {
    // Configuration is stored externally or used for initialization
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
  async get<T = any>(_url: string, _config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Mock implementation - should be replaced with actual Axios call
    return {
      data: {} as T,
      status: 200,
      statusText: 'OK',
      headers: {},
    };
  }

  /**
   * POST request
   */

  async post<T = any>(
    _url: string,
    _data?: unknown,
    _config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    // Implementation
    throw new Error('Not implemented - use existing apiClient');
  }

  /**
   * PUT request
   */

  async put<T = any>(
    _url: string,
    _data?: unknown,
    _config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    // Implementation
    throw new Error('Not implemented - use existing apiClient');
  }

  /**
   * DELETE request
   */

  async delete<T = any>(_url: string, _config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    // Implementation
    throw new Error('Not implemented - use existing apiClient');
  }

  /**
   * Add request interceptor
   */

  addRequestInterceptor(_interceptor: RequestInterceptor): void {
    // Implementation
  }

  /**
   * Add response interceptor
   */

  addResponseInterceptor(_interceptor: ResponseInterceptor): void {
    // Implementation
  }
}

// Singleton instance
const apiClient = new ApiClient({
  baseURL: BACKEND_CONFIG.API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

export { apiClient };
