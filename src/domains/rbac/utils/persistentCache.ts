/**
 * ========================================
 * RBAC Persistent Cache (Phase 2)
 * ========================================
 * LocalStorage-backed caching for RBAC permissions and endpoints
 * Survives browser sessions with intelligent invalidation
 * Reduces API calls and improves cold-start performance
 *
 * Features:
 * - Cross-session permission caching
 * - Intelligent cache invalidation
 * - TTL-based expiration
 * - Memory + LocalStorage hybrid caching
 * - Cache versioning and migration
 * ========================================
 */

import type { UserRole } from '../types/rbac.types';
import type { ApiEndpointConfig } from '../types/rbac.types';
import { storageService } from '@/core/storage';

// ========================================
// Types
// ========================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  version: string;
  userId?: string; // User-specific cache entries
}

interface RbacCacheConfig {
  permissions: {
    ttl: number; // 1 hour default
    version: string;
  };
  endpoints: {
    ttl: number; // 24 hours default
    version: string;
  };
  userRoles: {
    ttl: number; // 30 minutes default
    version: string;
  };
}

interface CacheStats {
  hits: number;
  misses: number;
  stores: number;
  invalidations: number;
  memorySize: number;
  localStorageSize: number;
}

// ========================================
// Configuration
// ========================================

const DEFAULT_CONFIG: RbacCacheConfig = {
  permissions: {
    ttl: 60 * 60 * 1000, // 1 hour
    version: '1.0.0',
  },
  endpoints: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
    version: '1.0.0',
  },
  userRoles: {
    ttl: 30 * 60 * 1000, // 30 minutes
    version: '1.0.0',
  },
};

// ========================================
// Storage Keys
// ========================================

const STORAGE_KEYS = {
  PERMISSIONS: 'rbac_permissions_cache',
  ENDPOINTS: 'rbac_endpoints_cache',
  USER_ROLES: 'rbac_user_roles_cache',
  CONFIG: 'rbac_cache_config',
  STATS: 'rbac_cache_stats',
} as const;

// ========================================
// Memory Cache Layer
// ========================================

class MemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;
  }

  get(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check TTL expiration
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  set(key: string, entry: CacheEntry<T>): void {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, entry);
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }
}

// ========================================
// Persistent Cache Manager
// ========================================

class RbacPersistentCache {
  private memoryCache = {
    permissions: new MemoryCache<boolean>(500),
    endpoints: new MemoryCache<ApiEndpointConfig>(200),
    userRoles: new MemoryCache<UserRole[]>(100),
  };

  private config: RbacCacheConfig;
  private stats: CacheStats;

  constructor(config: Partial<RbacCacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.stats = this.loadStats();
    this.initialize();
  }

  // ========================================
  // Initialization
  // ========================================

  private initialize(): void {
    // Clean up expired entries on startup
    this.cleanupExpiredEntries();
    
    // Set up periodic cleanup (every 5 minutes)
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanupExpiredEntries();
      }, 5 * 60 * 1000);
    }
  }

  // ========================================
  // Permission Caching
  // ========================================

  cachePermissionCheck(
    key: string,
    result: boolean,
    userId?: string
  ): void {
    const entry: CacheEntry<boolean> = {
      data: result,
      timestamp: Date.now(),
      ttl: this.config.permissions.ttl,
      version: this.config.permissions.version,
      userId,
    };

    // Store in memory
    this.memoryCache.permissions.set(key, entry);

    // Store in localStorage
    this.storeInLocalStorage(`${STORAGE_KEYS.PERMISSIONS}_${key}`, entry);
    
    this.stats.stores++;
  }

  getCachedPermissionCheck(
    key: string,
    userId?: string
  ): boolean | null {
    // Try memory cache first
    let entry = this.memoryCache.permissions.get(key);
    
    if (entry) {
      this.stats.hits++;
      return entry.userId === userId ? entry.data : null;
    }

    // Try localStorage
    entry = this.loadFromLocalStorage(`${STORAGE_KEYS.PERMISSIONS}_${key}`);
    
    if (entry && entry.userId === userId) {
      // Restore to memory cache
      this.memoryCache.permissions.set(key, entry);
      this.stats.hits++;
      return entry.data;
    }

    this.stats.misses++;
    return null;
  }

  // ========================================
  // Endpoint Caching
  // ========================================

  cacheEndpoint(
    endpoint: string,
    config: ApiEndpointConfig
  ): void {
    const entry: CacheEntry<ApiEndpointConfig> = {
      data: config,
      timestamp: Date.now(),
      ttl: this.config.endpoints.ttl,
      version: this.config.endpoints.version,
    };

    this.memoryCache.endpoints.set(endpoint, entry);
    this.storeInLocalStorage(`${STORAGE_KEYS.ENDPOINTS}_${endpoint}`, entry);
    
    this.stats.stores++;
  }

  getCachedEndpoint(endpoint: string): ApiEndpointConfig | null {
    // Try memory cache first
    let entry = this.memoryCache.endpoints.get(endpoint);
    
    if (entry) {
      this.stats.hits++;
      return entry.data;
    }

    // Try localStorage
    entry = this.loadFromLocalStorage(`${STORAGE_KEYS.ENDPOINTS}_${endpoint}`);
    
    if (entry) {
      this.memoryCache.endpoints.set(endpoint, entry);
      this.stats.hits++;
      return entry.data;
    }

    this.stats.misses++;
    return null;
  }

  // ========================================
  // User Roles Caching
  // ========================================

  cacheUserRoles(userId: string, roles: UserRole[]): void {
    const entry: CacheEntry<UserRole[]> = {
      data: roles,
      timestamp: Date.now(),
      ttl: this.config.userRoles.ttl,
      version: this.config.userRoles.version,
      userId,
    };

    const key = `user_${userId}`;
    this.memoryCache.userRoles.set(key, entry);
    this.storeInLocalStorage(`${STORAGE_KEYS.USER_ROLES}_${key}`, entry);
    
    this.stats.stores++;
  }

  getCachedUserRoles(userId: string): UserRole[] | null {
    const key = `user_${userId}`;
    
    // Try memory cache first
    let entry = this.memoryCache.userRoles.get(key);
    
    if (entry) {
      this.stats.hits++;
      return entry.data;
    }

    // Try localStorage
    entry = this.loadFromLocalStorage(`${STORAGE_KEYS.USER_ROLES}_${key}`);
    
    if (entry) {
      this.memoryCache.userRoles.set(key, entry);
      this.stats.hits++;
      return entry.data;
    }

    this.stats.misses++;
    return null;
  }

  // ========================================
  // Cache Management
  // ========================================

  invalidateUserCache(userId: string): void {
    // Clear memory cache
    const userKeys = Array.from(this.memoryCache.permissions.keys())
      .filter(key => key.includes(userId));
    
    userKeys.forEach(key => {
      this.memoryCache.permissions.delete(key);
    });

    // Clear user roles
    this.memoryCache.userRoles.delete(`user_${userId}`);

    // Clear storage entries for this user
    if (typeof window !== 'undefined') {
      const allKeys = storageService.keys();
      const keysToRemove = allKeys.filter(key => {
        if (key.includes(STORAGE_KEYS.PERMISSIONS) || key.includes(STORAGE_KEYS.USER_ROLES)) {
          const entry = this.loadFromLocalStorage(key);
          return entry?.userId === userId;
        }
        return false;
      });

      keysToRemove.forEach(key => storageService.remove(key));
    }

    this.stats.invalidations++;
  }

  clearAllCache(): void {
    // Clear memory
    this.memoryCache.permissions.clear();
    this.memoryCache.endpoints.clear();
    this.memoryCache.userRoles.clear();

    // Clear storage
    if (typeof window !== 'undefined') {
      const allKeys = storageService.keys();
      
      Object.values(STORAGE_KEYS).forEach(keyPrefix => {
        const keysToRemove = allKeys.filter(key => key.includes(keyPrefix));
        keysToRemove.forEach(key => storageService.remove(key));
      });
    }

    this.stats = this.resetStats();
  }

  private cleanupExpiredEntries(): void {
    const now = Date.now();
    
    // Clean memory cache
    Object.values(this.memoryCache).forEach(cache => {
      const expiredKeys: string[] = [];
      
      for (const key of cache.keys()) {
        const entry = cache.get(key);
        if (entry && now > entry.timestamp + entry.ttl) {
          expiredKeys.push(key);
        }
      }

      expiredKeys.forEach(key => cache.delete(key));
    });

    // Clean storage (less frequent, more expensive)
    // storageService handles TTL automatically, but manual cleanup helps with quota
    if (typeof window !== 'undefined' && Math.random() < 0.1) { // 10% chance
      const allKeys = storageService.keys();
      
      Object.values(STORAGE_KEYS).forEach(keyPrefix => {
        const expiredKeys = allKeys
          .filter(key => key.includes(keyPrefix))
          .map(key => {
            const entry = this.loadFromLocalStorage(key);
            return entry && now > entry.timestamp + entry.ttl ? key : null;
          })
          .filter((key): key is string => key !== null);

        expiredKeys.forEach(key => storageService.remove(key));
      });
    }
  }

  // ========================================
  // Storage Helpers (using storageService)
  // ========================================

  private storeInLocalStorage<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === 'undefined') return;

    // storageService handles quota management, error handling, and retry logic
    storageService.set(key, entry, { ttl: entry.ttl });
  }

  private loadFromLocalStorage<T>(key: string): CacheEntry<T> | null {
    if (typeof window === 'undefined') return null;

    const entry = storageService.get<CacheEntry<T>>(key);
    if (!entry) return null;
    
    // Check version compatibility
    const expectedVersion = this.getExpectedVersion(key);
    if (entry.version !== expectedVersion) {
      storageService.remove(key);
      return null;
    }

    // TTL is automatically handled by storageService
    return entry;
  }

  private getExpectedVersion(key: string): string {
    if (key.includes(STORAGE_KEYS.PERMISSIONS)) return this.config.permissions.version;
    if (key.includes(STORAGE_KEYS.ENDPOINTS)) return this.config.endpoints.version;
    if (key.includes(STORAGE_KEYS.USER_ROLES)) return this.config.userRoles.version;
    return '1.0.0';
  }



  // ========================================
  // Stats and Monitoring
  // ========================================

  private loadStats(): CacheStats {
    if (typeof window === 'undefined') {
      return this.resetStats();
    }

    const stored = storageService.get<CacheStats>(STORAGE_KEYS.STATS);
    return stored || this.resetStats();
  }

  private saveStats(): void {
    if (typeof window === 'undefined') return;

    this.stats.memorySize = this.calculateMemorySize();
    this.stats.localStorageSize = this.calculateLocalStorageSize();
    storageService.set(STORAGE_KEYS.STATS, this.stats);
  }

  private resetStats(): CacheStats {
    return {
      hits: 0,
      misses: 0,
      stores: 0,
      invalidations: 0,
      memorySize: 0,
      localStorageSize: 0,
    };
  }

  private calculateMemorySize(): number {
    return (
      this.memoryCache.permissions.size() +
      this.memoryCache.endpoints.size() +
      this.memoryCache.userRoles.size()
    );
  }

  private calculateLocalStorageSize(): number {
    if (typeof window === 'undefined') return 0;

    const allKeys = storageService.keys();
    
    return Object.values(STORAGE_KEYS).reduce((totalSize, keyPrefix) => {
      const matchingKeys = allKeys.filter(key => key.includes(keyPrefix));
      const keysSize = matchingKeys.reduce((sum, key) => {
        const item = storageService.get<unknown>(key);
        return sum + (item ? JSON.stringify(item).length : 0);
      }, 0);
      return totalSize + keysSize;
    }, 0);
  }

  getStats(): CacheStats {
    this.saveStats();
    return { ...this.stats };
  }

  getCacheEfficiency(): number {
    const total = this.stats.hits + this.stats.misses;
    return total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
}

// ========================================
// Singleton Instance
// ========================================

export const rbacPersistentCache = new RbacPersistentCache();

// ========================================
// Public API
// ========================================

export {
  RbacPersistentCache,
  type CacheEntry,
  type RbacCacheConfig,
  type CacheStats,
};