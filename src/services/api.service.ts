/**
 * Base API Service
 * Handles all HTTP requests with interceptors for auth, error handling, and retries
 */

import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG, TOKEN_KEYS } from '../config/api.config';
import { ApiError, ApiResponse } from '../types/api.types';

class ApiService {
  private axiosInstance: AxiosInstance;
  private refreshPromise: Promise<void> | null = null;
  private isRefreshing = false;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add request ID for tracking
        if (config.headers) {
          config.headers['X-Request-ID'] = this.generateRequestId();
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors and token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for the ongoing refresh to complete
            await this.refreshPromise;
            return this.axiosInstance(originalRequest);
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            this.refreshPromise = this.refreshToken();
            await this.refreshPromise;
            this.isRefreshing = false;
            this.refreshPromise = null;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.isRefreshing = false;
            this.refreshPromise = null;
            this.handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  /**
   * Get access token from storage
   */
  private getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  /**
   * Get refresh token from storage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  /**
   * Store tokens in localStorage
   */
  private setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
  }

  /**
   * Clear tokens from storage
   */
  private clearTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.USER_DATA);
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
        }
      );

      const { access_token, refresh_token } = response.data;
      this.setTokens(access_token, refresh_token);
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Handle authentication errors - Redirect to login
   */
  private handleAuthError(): void {
    this.clearTokens();

    // Dispatch custom event for auth error
    window.dispatchEvent(new CustomEvent('auth:error'));

    // Redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?expired=true';
    }
  }

  /**
   * Format axios error into ApiResponse
   */
  private formatError(error: AxiosError<ApiError>): ApiResponse {
    if (error.response) {
      return {
        error: error.response.data,
        status: error.response.status,
      };
    }

    if (error.request) {
      return {
        error: {
          error_code: 'NETWORK_ERROR',
          message: 'Network error. Please check your connection.',
          details: { data: [] },
        },
        status: 0,
      };
    }

    return {
      error: {
        error_code: 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: { data: [] },
      },
      status: 0,
    };
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ==================== Public HTTP Methods ====================

  /**
   * GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  // ==================== Utility Methods ====================

  /**
   * Set authentication tokens
   */
  setAuthTokens(accessToken: string, refreshToken: string): void {
    this.setTokens(accessToken, refreshToken);
  }

  /**
   * Clear authentication data
   */
  clearAuth(): void {
    this.clearTokens();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get axios instance for advanced usage
   */
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Export singleton instance
export default new ApiService();
