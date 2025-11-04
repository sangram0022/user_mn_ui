// ========================================
// API Client - Enhanced with Auth Interceptors
// SINGLE SOURCE OF TRUTH for API configuration
// ========================================

import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';
import tokenService from '../../domains/auth/services/tokenService';
import { logger } from '@/core/logging';
import { APIError } from '@/core/error';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ========================================
// Refresh Token Queue
// Prevents multiple simultaneous refresh attempts
// ========================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ========================================
// Exponential Backoff Helper
// ========================================

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRetryDelay = (retryCount: number): number => {
  // 1s, 2s, 4s, 8s
  return Math.min(1000 * Math.pow(2, retryCount), 8000);
};

// ========================================
// Create Axios Instance
// ========================================

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies for CSRF
});

// ========================================
// Request Interceptor
// - Inject access token
// - Add CSRF token for mutations
// - Add retry count for exponential backoff
// ========================================

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from storage
    const accessToken = tokenService.getAccessToken();
    
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Add CSRF token for mutations (POST, PUT, PATCH, DELETE)
    const isMutation = ['post', 'put', 'patch', 'delete'].includes(
      config.method?.toLowerCase() || ''
    );
    
    if (isMutation) {
      const csrfToken = tokenService.getStoredCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }

    // Initialize retry count
    if (!config.headers['X-Retry-Count']) {
      config.headers['X-Retry-Count'] = '0';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ========================================
// Response Interceptor
// - Handle 401 errors (token expired)
// - Trigger token refresh
// - Queue requests during refresh
// - Exponential backoff for retries
// - Enhanced error handling
// ========================================

apiClient.interceptors.response.use(
  (response) => {
    // Log successful API calls (debug level in production, info in development)
    const method = response.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = response.config?.url || 'unknown';
    const status = response.status;
    const duration = response.config?.headers?.['X-Request-Start']
      ? performance.now() - parseInt(response.config.headers['X-Request-Start'] as string, 10)
      : undefined;

    if (import.meta.env.MODE === 'development' || status >= 400) {
      logger().debug(`API Success: ${method} ${url}`, {
        status,
        duration,
        url,
        method,
        context: 'apiClient.success',
      });
    }

    return response;
  },
  async (error) => {
    const originalRequest: AxiosRequestConfig & { _retry?: boolean } = error.config;

    // ========================================
    // Handle 401 Unauthorized - Token Expired
    // ========================================

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Token refresh in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh token endpoint
        const response = await tokenService.refreshToken(refreshToken);
        
        // Extract token data from response
        const tokenData = response.data;
        if (!tokenData) {
          throw new Error('Invalid refresh token response');
        }
        
        // Store new tokens
        tokenService.storeTokens({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          token_type: tokenData.token_type,
          expires_in: tokenData.expires_in,
        });

        // Update original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokenData.access_token}`;
        }

        // Process queued requests
        processQueue(null, tokenData.access_token);

        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError, null);
        tokenService.clearTokens();
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ========================================
    // Handle Network Errors with Exponential Backoff
    // ========================================

    if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
      const retryCount = parseInt(originalRequest.headers?.['X-Retry-Count'] as string || '0', 10);
      const maxRetries = 3;

      if (retryCount < maxRetries) {
        const delayMs = getRetryDelay(retryCount);
        
        logger().info(`Retrying request (attempt ${retryCount + 1}/${maxRetries}) after ${delayMs}ms`, {
          method: originalRequest.method,
          url: originalRequest.url,
          retryCount,
          delayMs,
          context: 'apiClient.networkError.retry',
        });
        
        await delay(delayMs);
        
        // Increment retry count
        if (originalRequest.headers) {
          originalRequest.headers['X-Retry-Count'] = (retryCount + 1).toString();
        }
        
        return apiClient(originalRequest);
      }
    }

    // ========================================
    // Enhanced Error Handling with Logging
    // ========================================

    // Extract error message from various response formats
    let errorMessage = 'An unexpected error occurred';
    const responseData = error.response?.data;
    
    if (responseData) {
      // Check for field_errors first (backend validation errors)
      if (responseData.field_errors && typeof responseData.field_errors === 'object') {
        const fieldErrors = responseData.field_errors as Record<string, string[]>;
        const allErrors = Object.values(fieldErrors).flat();
        if (allErrors.length > 0) {
          errorMessage = allErrors[0]; // Use first error as primary message
        }
      }
      // Fallback to message, detail, or generic error
      else if (responseData.message) {
        errorMessage = responseData.message;
      } else if (responseData.detail) {
        errorMessage = responseData.detail;
      }
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    const errorCode = responseData?.message_code || responseData?.code;
    const status = error.response?.status || 0;
    const method = originalRequest?.method?.toUpperCase() || 'UNKNOWN';
    const url = originalRequest?.url || 'unknown';
    const duration = error.config?.headers?.['X-Request-Start'] 
      ? performance.now() - parseInt(error.config.headers['X-Request-Start'] as string, 10)
      : undefined;

    // Log the error
    logger().error(
      `API Error: ${method} ${url}`,
      error instanceof Error ? error : new Error(errorMessage),
      {
        status,
        errorCode,
        method,
        url,
        duration,
        responseData: error.response?.data,
        context: 'apiClient.error',
      }
    );

    // Throw structured error with enhanced message and full response data
    const apiError = new APIError(
      errorMessage,
      status,
      method,
      url,
      error.response?.data,
      duration
    );
    
    // Attach field_errors to the error object for component-level handling
    if (responseData?.field_errors) {
      (apiError as unknown as { field_errors: Record<string, string[]> }).field_errors = responseData.field_errors;
    }
    
    throw apiError;
  }
);

export default apiClient;
