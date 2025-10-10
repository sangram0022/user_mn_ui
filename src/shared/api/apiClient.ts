/**
 * Advanced API Client with Caching and Type Safety
 * Expert-level HTTP client with React 19 patterns
 */

import { logger } from './../utils/logger';
import { type ApiResponse, 
  type ApiError, 
  type ApiRequestConfig,
  type ApiEndpoints,
  type ApiRequest,
  type ApiResponseType,
  HTTP_STATUS } from './apiTypes';

// Cache interface
interface CacheEntry<T> { data: T;
  timestamp: number;
  ttl: number;
  key: string; }

interface CacheOptions { ttl?: number; // Time to live in milliseconds
  invalidateOnError?: boolean;
  persistToStorage?: boolean; }

// Advanced cache manager
class ApiCacheManager { private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    // Load persisted cache from localStorage
    this.loadFromStorage();
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void { const ttl = options.ttl || this.defaultTTL;
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key
    };

    this.cache.set(key, entry);

    if (options.persistToStorage) { this.saveToStorage(key, entry);
    }
  }

  get<T>(key: string): T | null { const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.removeFromStorage(key);
      return null;
    }

    return entry.data;
  }

  invalidate(pattern: string | RegExp): void { const keysToDelete: string[] = [];
    
    for (const [key] of this.cache) {
      if (typeof pattern === 'string') {
        if (key.includes(pattern)) {
          keysToDelete.push(key);
        }
      } else { if (pattern.test(key)) {
          keysToDelete.push(key);
        }
      }
    }

    keysToDelete.forEach(key => { this.cache.delete(key);
      this.removeFromStorage(key);
    });
  }

  clear(): void { this.cache.clear();
    localStorage.removeItem('api_cache_keys');
    // Remove all cached items from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('api_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  private isExpired(entry: CacheEntry<unknown>): boolean { return Date.now() - entry.timestamp > entry.ttl;
  }

  private cleanup(): void { const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache) {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => { this.cache.delete(key);
      this.removeFromStorage(key);
    });
  }

  private saveToStorage<T>(key: string, entry: CacheEntry<T>): void {
    try {
      localStorage.setItem(`api_cache_${key}`, JSON.stringify(entry));
      
      // Keep track of cache keys
      const cacheKeys = JSON.parse(localStorage.getItem('api_cache_keys') || '[]');
      if (!cacheKeys.includes(key)) { cacheKeys.push(key);
        localStorage.setItem('api_cache_keys', JSON.stringify(cacheKeys));
      }
    } catch (error) { logger.warn('Failed to save cache to storage:', { error  });
    }
  }

  private removeFromStorage(key: string): void {
    try {
      localStorage.removeItem(`api_cache_${key}`);
      
      const cacheKeys = JSON.parse(localStorage.getItem('api_cache_keys') || '[]');
      const updatedKeys = cacheKeys.filter((k: string) => k !== key);
      localStorage.setItem('api_cache_keys', JSON.stringify(updatedKeys));
    } catch (error) { logger.warn('Failed to remove cache from storage:', { error  });
    }
  }

  private loadFromStorage(): void {
    try {
      const cacheKeys = JSON.parse(localStorage.getItem('api_cache_keys') || '[]');
      
      cacheKeys.forEach((key: string) => {
        const stored = localStorage.getItem(`api_cache_${key}`);
        if (stored) { const entry = JSON.parse(stored);
          if (!this.isExpired(entry)) {
            this.cache.set(key, entry);
          } else { this.removeFromStorage(key);
          }
        }
      });
    } catch (error) { logger.warn('Failed to load cache from storage:', { error  });
    }
  }
}

// Request interceptor type
type RequestInterceptor = (config: ApiRequestConfig & { url: string }) => 
  Promise<ApiRequestConfig & { url: string }> | ApiRequestConfig & { url: string };

// Response interceptor type
type ResponseInterceptor<T = unknown> = (response: ApiResponse<T>) => 
  Promise<ApiResponse<T>> | ApiResponse<T>;

// Error interceptor type
type ErrorInterceptor = (error: ApiError) => Promise<never> | never;

// Advanced API client class
export class AdvancedApiClient {
  private baseURL: string;
  private defaultConfig: ApiRequestConfig;
  private cache: ApiCacheManager;
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];

  constructor(baseURL: string, defaultConfig: ApiRequestConfig = {}) { this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.defaultConfig = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 10000,
      retries: 3,
      cache: false,
      cacheTTL: 5 * 60 * 1000,
      ...defaultConfig
    };
    this.cache = new ApiCacheManager();
    
    // Add default request interceptor for auth
    this.addRequestInterceptor(this.authInterceptor);
    
    // Add default error interceptor
    this.addErrorInterceptor(this.defaultErrorHandler);
  }

  // Type-safe API methods
  async request<T extends keyof ApiEndpoints>(
    endpoint: T,
    data: ApiRequest<T>,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponseType<T>['data']> { const url = this.buildUrl(endpoint as string, data);
    const finalConfig = { ...this.defaultConfig, ...config, url };
    
    // Check cache first
    if (finalConfig.cache && finalConfig.method === 'GET') { const cacheKey = this.getCacheKey(url, finalConfig);
      const cached = this.cache.get<ApiResponseType<T>['data']>(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // Apply request interceptors
    let processedConfig = finalConfig;
    for (const interceptor of this.requestInterceptors) { processedConfig = await interceptor(processedConfig);
    }

    // Execute request with retries
    const response = await this.executeWithRetries<ApiResponseType<T>>(processedConfig);
    
    // Apply response interceptors
    let processedResponse = response;
    for (const interceptor of this.responseInterceptors) { processedResponse = await interceptor(processedResponse) as ApiResponseType<T>;
    }

    // Cache successful responses
    if (finalConfig.cache && finalConfig.method === 'GET' && processedResponse.success) { const cacheKey = this.getCacheKey(url, finalConfig);
      this.cache.set(cacheKey, processedResponse.data, {
        ttl: finalConfig.cacheTTL,
        persistToStorage: true
      });
    }

    return processedResponse.data;
  }

  // Convenience methods with type safety
  async get<T extends keyof ApiEndpoints>(
    endpoint: T,
    params: ApiRequest<T> = {} as ApiRequest<T>,
    config?: ApiRequestConfig
  ): Promise<ApiResponseType<T>['data']> { return this.request(endpoint, params, { ...config, method: 'GET' });
  }

  async post<T extends keyof ApiEndpoints>(
    endpoint: T,
    data: ApiRequest<T>,
    config?: ApiRequestConfig
  ): Promise<ApiResponseType<T>['data']> { return this.request(endpoint, data, { ...config, method: 'POST' });
  }

  async put<T extends keyof ApiEndpoints>(
    endpoint: T,
    data: ApiRequest<T>,
    config?: ApiRequestConfig
  ): Promise<ApiResponseType<T>['data']> { return this.request(endpoint, data, { ...config, method: 'PUT' });
  }

  async delete<T extends keyof ApiEndpoints>(
    endpoint: T,
    params: ApiRequest<T> = {} as ApiRequest<T>,
    config?: ApiRequestConfig
  ): Promise<ApiResponseType<T>['data']> { return this.request(endpoint, params, { ...config, method: 'DELETE' });
  }

  // Interceptor management
  addRequestInterceptor(interceptor: RequestInterceptor): void { this.requestInterceptors.push(interceptor);
  }

  addResponseInterceptor(interceptor: ResponseInterceptor): void { this.responseInterceptors.push(interceptor);
  }

  addErrorInterceptor(interceptor: ErrorInterceptor): void { this.errorInterceptors.push(interceptor);
  }

  // Cache management
  invalidateCache(pattern: string | RegExp): void { this.cache.invalidate(pattern);
  }

  clearCache(): void { this.cache.clear();
  }

  // Private methods
  private buildUrl(endpoint: string, data: unknown): string {
    let url = `${this.baseURL}/${endpoint.replace(/^\//, '')}`;
    
    // For GET requests, append query parameters
    if (data && typeof data === 'object' && Object.keys(data).length > 0) { const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    return url;
  }

  private getCacheKey(url: string, config: ApiRequestConfig): string {
    const key = `${config.method || 'GET'}_${url}`;
    return btoa(key).replace(/[+/=]/g, ''); // Base64 encode and clean
  }

  private async executeWithRetries<T extends ApiResponse>(
    config: ApiRequestConfig & { url: string }
  ): Promise<T> { const { retries = 0, timeout = 10000 } = config;
    let lastError: ApiError;

    for (let attempt = 0; attempt <= retries; attempt++) { try {
        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(config.url, {
          method: config.method,
          headers: config.headers,
          body: config.method !== 'GET' ? JSON.stringify(config) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const apiError: ApiError = {
            code: `HTTP_${response.status}`,
            message: errorData.message || response.statusText,
            statusCode: response.status,
            timestamp: Date.now(),
            requestId: response.headers.get('x-request-id') || 'unknown',
            details: errorData
          };

          // Apply error interceptors
          for (const interceptor of this.errorInterceptors) { interceptor(apiError);
          }

          throw apiError;
        }

        const responseData = await response.json();
        return responseData as T;

      } catch (error) { lastError = error instanceof Error 
          ? {
              code: 'NETWORK_ERROR',
              message: error.message,
              statusCode: 0,
              timestamp: Date.now(),
              requestId: 'unknown'
            }
          : error as ApiError;

        // Don't retry on authentication errors
        if (lastError.statusCode === HTTP_STATUS.UNAUTHORIZED) { break;
        }

        // Don't retry on client errors (except timeout)
        if (lastError.statusCode >= 400 && lastError.statusCode < 500 && 
            lastError.code !== 'NETWORK_ERROR') { break;
        }

        // Wait before retry with exponential backoff
        if (attempt < retries) { await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError!;
  }

  private authInterceptor: RequestInterceptor = (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`
      };
    }
    return config;
  };

  private defaultErrorHandler: ErrorInterceptor = (error) => { // Handle token expiration
    if (error.statusCode === HTTP_STATUS.UNAUTHORIZED) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Log error for monitoring
    logger.error('API Error:', undefined, { error  });
    
    throw error;
  };
}

// Create default instance
export const apiClient = new AdvancedApiClient(
  process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  { cache: true,
    cacheTTL: 5 * 60 * 1000, // 5 minutes
    retries: 3,
    timeout: 15000
  }
);

// Export types for external use
export type { ApiResponse, ApiError, ApiRequestConfig } from './apiTypes';