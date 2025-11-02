// ========================================
// RBAC Endpoint Cache - Performance Optimization
// ========================================
// O(1) endpoint lookup instead of O(n) array search
// Memoized permission calculations
// ========================================

import type { ApiEndpointConfig } from '../types/rbac.types';
import { API_ENDPOINTS } from './apiRoleMapping';

/**
 * High-performance endpoint lookup cache
 * Converts O(n) array search to O(1) Map lookup
 */
class EndpointCache {
  private endpointMap: Map<string, ApiEndpointConfig>;
  private initialized = false;

  constructor() {
    this.endpointMap = new Map();
    this.initialize();
  }

  /**
   * Initialize the cache with all endpoints
   * Creates key format: "METHOD:path"
   */
  private initialize(): void {
    if (this.initialized) return;

    for (const endpoint of API_ENDPOINTS) {
      const key = this.createKey(endpoint.method, endpoint.path);
      this.endpointMap.set(key, endpoint);
    }

    this.initialized = true;
  }

  /**
   * Create cache key from method and path
   */
  private createKey(method: string, path: string): string {
    return `${method.toUpperCase()}:${path}`;
  }

  /**
   * Find endpoint by method and path
   * O(1) lookup instead of O(n) array search
   */
  findEndpoint(method: string, path: string): ApiEndpointConfig | undefined {
    const key = this.createKey(method, path);
    return this.endpointMap.get(key);
  }

  /**
   * Check if endpoint exists
   */
  hasEndpoint(method: string, path: string): boolean {
    const key = this.createKey(method, path);
    return this.endpointMap.has(key);
  }

  /**
   * Get all public endpoints
   * Cached for performance
   */
  private _publicEndpoints?: ApiEndpointConfig[];
  getPublicEndpoints(): ApiEndpointConfig[] {
    if (!this._publicEndpoints) {
      this._publicEndpoints = Array.from(this.endpointMap.values())
        .filter(endpoint => endpoint.public === true);
    }
    return this._publicEndpoints;
  }

  /**
   * Get all endpoints requiring specific role
   * Cached for performance
   */
  private _roleEndpointsCache = new Map<string, ApiEndpointConfig[]>();
  getEndpointsForRole(role: string): ApiEndpointConfig[] {
    if (!this._roleEndpointsCache.has(role)) {
      const endpoints = Array.from(this.endpointMap.values())
        .filter(endpoint => endpoint.requiredRoles.includes(role as never));
      this._roleEndpointsCache.set(role, endpoints);
    }
    return this._roleEndpointsCache.get(role)!;
  }

  /**
   * Clear caches (if endpoints change dynamically)
   */
  clearCache(): void {
    this._publicEndpoints = undefined;
    this._roleEndpointsCache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getStats() {
    return {
      totalEndpoints: this.endpointMap.size,
      publicEndpoints: this.getPublicEndpoints().length,
      rolesCached: this._roleEndpointsCache.size,
      initialized: this.initialized,
    };
  }
}

/**
 * Singleton instance for app-wide use
 * Ensures single cache across all components
 */
export const endpointCache = new EndpointCache();

/**
 * Permission check memoization utility
 * Caches expensive permission computations
 */
class PermissionMemoCache {
  private cache = new Map<string, boolean>();
  private maxSize = 1000; // Prevent memory leaks

  /**
   * Create cache key from parameters
   */
  private createKey(
    userRoles: string[],
    permissions: string[],
    operation: string,
    params: unknown[]
  ): string {
    return JSON.stringify({
      roles: userRoles.sort(),
      permissions: permissions.sort(),
      operation,
      params,
    });
  }

  /**
   * Get cached result or compute and cache
   */
  memoize<T extends unknown[], R>(
    fn: (...args: T) => R,
    userRoles: string[],
    permissions: string[],
    operation: string,
    ...args: T
  ): R {
    const key = this.createKey(userRoles, permissions, operation, args);
    
    if (this.cache.has(key)) {
      return this.cache.get(key) as R;
    }

    const result = fn(...args);
    
    // Prevent memory leaks
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, result as boolean);
    return result;
  }

  /**
   * Clear permission cache (on role/permission changes)
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRatio: 0, // Could be implemented with counters
    };
  }
}

/**
 * Singleton permission cache
 */
export const permissionCache = new PermissionMemoCache();

/**
 * React hook for cache statistics (debugging)
 */
export function useCacheStats() {
  return {
    endpoint: endpointCache.getStats(),
    permission: permissionCache.getStats(),
  };
}