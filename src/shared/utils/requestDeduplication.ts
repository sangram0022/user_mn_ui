/**
 * Request Deduplication Utility
 * Prevents duplicate API requests from being made simultaneously
 * 
 * @module requestDeduplication
 * @example
 * ```ts
 * const dedupedFetch = createDeduplicatedRequest();
 * 
 * // Multiple calls to same endpoint will share single request
 * const [result1, result2, result3] = await Promise.all([
 *   dedupedFetch('/api/users'),
 *   dedupedFetch('/api/users'),
 *   dedupedFetch('/api/users')
 * ]);
 * // Only 1 actual network request made!
 * ```
 */

import { logger } from '@/core/logging';

/**
 * Tracks in-flight requests to prevent duplicates
 */
type PendingRequest<T> = Promise<T>;
type RequestCache = Map<string, PendingRequest<unknown>>;

/**
 * Generate unique key for request
 * Combines method + URL + body hash
 * 
 * @param method - HTTP method (GET, POST, etc.)
 * @param url - Request URL
 * @param body - Request body (optional)
 * @returns Unique cache key
 * 
 * @example
 * ```ts
 * generateRequestKey('GET', '/api/users', null)
 * // => "GET:/api/users"
 * 
 * generateRequestKey('POST', '/api/users', { name: 'John' })
 * // => "POST:/api/users:3742"
 * ```
 */
function generateRequestKey(
  method: string,
  url: string,
  body?: unknown
): string {
  let key = `${method}:${url}`;
  
  if (body) {
    // Simple hash of body for cache key
    const bodyStr = JSON.stringify(body);
    const hash = bodyStr.split('').reduce((acc, char) => {
      return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);
    key += `:${Math.abs(hash)}`;
  }
  
  return key;
}

/**
 * Request Deduplication Manager
 * Prevents parallel duplicate API calls
 * 
 * @example
 * ```ts
 * const dedup = new RequestDeduplicator();
 * 
 * // Start 3 identical requests
 * const promises = [
 *   dedup.deduplicate('GET', '/api/users', () => fetch('/api/users')),
 *   dedup.deduplicate('GET', '/api/users', () => fetch('/api/users')),
 *   dedup.deduplicate('GET', '/api/users', () => fetch('/api/users'))
 * ];
 * 
 * // All 3 share same request - only 1 network call!
 * const results = await Promise.all(promises);
 * ```
 */
export class RequestDeduplicator {
  private pendingRequests: RequestCache = new Map();
  private stats = {
    totalRequests: 0,
    deduplicatedRequests: 0,
    cacheHitRate: 0,
  };

  /**
   * Deduplicate a request
   * If identical request in flight, returns existing promise
   * Otherwise, starts new request
   * 
   * @param method - HTTP method
   * @param url - Request URL
   * @param requestFn - Function that performs actual request
   * @param body - Optional request body
   * @returns Promise with request result
   * 
   * @example
   * ```ts
   * const dedup = new RequestDeduplicator();
   * 
   * const result = await dedup.deduplicate(
   *   'GET',
   *   '/api/users/123',
   *   () => apiClient.get('/api/users/123')
   * );
   * ```
   */
  async deduplicate<T>(
    method: string,
    url: string,
    requestFn: () => Promise<T>,
    body?: unknown
  ): Promise<T> {
    const key = generateRequestKey(method, url, body);
    this.stats.totalRequests++;

    // Check if identical request already in flight
    const existingRequest = this.pendingRequests.get(key);
    if (existingRequest) {
      this.stats.deduplicatedRequests++;
      this.updateCacheHitRate();
      
      logger().debug('Request deduplicated', {
        method,
        url,
        cacheKey: key,
        cacheHitRate: `${this.stats.cacheHitRate.toFixed(1)}%`,
      });

      return existingRequest as Promise<T>;
    }

    // Start new request
    const request = requestFn()
      .then((result) => {
        // Remove from cache after successful completion
        this.pendingRequests.delete(key);
        return result;
      })
      .catch((error) => {
        // Remove from cache on error too
        this.pendingRequests.delete(key);
        throw error;
      });

    // Store in cache
    this.pendingRequests.set(key, request);

    return request;
  }

  /**
   * Update cache hit rate statistics
   * @private
   */
  private updateCacheHitRate(): void {
    if (this.stats.totalRequests > 0) {
      this.stats.cacheHitRate = 
        (this.stats.deduplicatedRequests / this.stats.totalRequests) * 100;
    }
  }

  /**
   * Get deduplication statistics
   * 
   * @returns Statistics object
   * 
   * @example
   * ```ts
   * const stats = dedup.getStats();
   * console.log(`Saved ${stats.deduplicatedRequests} requests!`);
   * console.log(`Cache hit rate: ${stats.cacheHitRate}%`);
   * ```
   */
  getStats(): Readonly<typeof this.stats> {
    return { ...this.stats };
  }

  /**
   * Clear all pending requests
   * Useful for testing or force refresh
   * 
   * @example
   * ```ts
   * dedup.clear(); // Force all new requests
   * ```
   */
  clear(): void {
    this.pendingRequests.clear();
    logger().debug('Request cache cleared');
  }

  /**
   * Get number of pending requests
   * 
   * @returns Count of in-flight requests
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Check if request is pending
   * 
   * @param method - HTTP method
   * @param url - Request URL  
   * @param body - Optional request body
   * @returns True if request in flight
   */
  isPending(method: string, url: string, body?: unknown): boolean {
    const key = generateRequestKey(method, url, body);
    return this.pendingRequests.has(key);
  }
}

/**
 * Singleton instance for global request deduplication
 * 
 * @example
 * ```ts
 * import { globalDeduplicator } from '@/shared/utils/requestDeduplication';
 * 
 * await globalDeduplicator.deduplicate(
 *   'GET',
 *   '/api/users',
 *   () => fetch('/api/users')
 * );
 * ```
 */
export const globalDeduplicator = new RequestDeduplicator();

/**
 * Create a deduplicator wrapper for a fetch-like function
 * 
 * @param fetcher - Original fetch function
 * @param deduplicator - Deduplicator instance (optional, uses global if not provided)
 * @returns Wrapped fetch function with deduplication
 * 
 * @example
 * ```ts
 * const dedupedFetch = createDeduplicatedFetcher(
 *   (url, options) => fetch(url, options)
 * );
 * 
 * // Use like normal fetch, but with automatic deduplication
 * const response = await dedupedFetch('/api/users');
 * ```
 */
export function createDeduplicatedFetcher<T>(
  fetcher: (url: string, options?: RequestInit) => Promise<T>,
  deduplicator: RequestDeduplicator = globalDeduplicator
): (url: string, options?: RequestInit) => Promise<T> {
  return async (url: string, options?: RequestInit): Promise<T> => {
    const method = options?.method || 'GET';
    const body = options?.body;

    return deduplicator.deduplicate(
      method,
      url,
      () => fetcher(url, options),
      body
    );
  };
}

/**
 * Decorator for class methods to add deduplication
 * 
 * @example
 * ```ts
 * class UserService {
 *   @deduplicate()
 *   async getUser(id: string) {
 *     return apiClient.get(`/users/${id}`);
 *   }
 * }
 * ```
 */
export function deduplicate() {
  return function (
    _target: unknown,
    _propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const deduplicator = globalDeduplicator;

    descriptor.value = async function (...args: unknown[]) {
      const key = `${_propertyKey}:${JSON.stringify(args)}`;
      
      return deduplicator.deduplicate(
        'METHOD',
        key,
        () => originalMethod.apply(this, args)
      );
    };

    return descriptor;
  };
}
