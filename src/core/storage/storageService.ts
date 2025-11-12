// ========================================
// Storage Service - Single Source of Truth
// ========================================
// Centralized localStorage wrapper with:
// - Unified error handling
// - TTL support for cache expiration
// - Quota management (DOMException code 22)
// - Key prefixing for namespace isolation
// - Type-safe operations
// ========================================

import { logger } from '@/core/logging';

/**
 * Storage item with metadata
 */
interface StorageItem<T> {
  data: T;
  expiry: number | null;
  timestamp: number;
}

/**
 * Storage service interface
 */
export interface StorageService {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, options?: { ttl?: number }): void;
  remove(key: string): void;
  clear(): void;
  has(key: string): boolean;
  keys(): string[];
}

/**
 * LocalStorage implementation with enhanced features
 */
class LocalStorageService implements StorageService {
  private readonly prefix = 'usermn_';

  /**
   * Get item from storage with automatic expiry check
   * @param key Storage key (without prefix)
   * @returns Parsed data or null if not found/expired
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) {
        return null;
      }

      const parsed = JSON.parse(item) as StorageItem<T>;

      // Check TTL if exists
      if (parsed.expiry && Date.now() > parsed.expiry) {
        logger().debug('Storage item expired', { key });
        this.remove(key);
        return null;
      }

      return parsed.data;
    } catch (error) {
      logger().error(
        'Storage read failed',
        error instanceof Error ? error : undefined,
        { key, operation: 'get' }
      );
      return null;
    }
  }

  /**
   * Set item in storage with optional TTL
   * @param key Storage key (without prefix)
   * @param value Data to store (will be JSON stringified)
   * @param options Optional settings (ttl in milliseconds)
   */
  set<T>(key: string, value: T, options?: { ttl?: number }): void {
    try {
      const item: StorageItem<T> = {
        data: value,
        expiry: options?.ttl ? Date.now() + options.ttl : null,
        timestamp: Date.now(),
      };

      localStorage.setItem(this.prefix + key, JSON.stringify(item));

      logger().debug('Storage write successful', {
        key,
        hasTTL: !!options?.ttl,
        ttl: options?.ttl,
      });
    } catch (error) {
      // Handle quota exceeded (DOMException code 22)
      if (error instanceof DOMException && error.code === 22) {
        logger().warn('Storage quota exceeded, clearing expired items', { key });
        this.clearExpired();

        // Retry once after cleanup
        try {
          const item: StorageItem<T> = {
            data: value,
            expiry: options?.ttl ? Date.now() + options.ttl : null,
            timestamp: Date.now(),
          };
          localStorage.setItem(this.prefix + key, JSON.stringify(item));
          logger().info('Storage write successful after cleanup', { key });
        } catch (retryError) {
          logger().error(
            'Storage write failed after cleanup',
            retryError instanceof Error ? retryError : undefined,
            { key, operation: 'set' }
          );
        }
      } else {
        logger().error(
          'Storage write failed',
          error instanceof Error ? error : undefined,
          { key, operation: 'set' }
        );
      }
    }
  }

  /**
   * Remove item from storage
   * @param key Storage key (without prefix)
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
      logger().debug('Storage item removed', { key });
    } catch (error) {
      logger().warn('Storage remove failed', { key, operation: 'remove', error });
    }
  }

  /**
   * Clear all items with this service's prefix
   */
  clear(): void {
    try {
      const keysToRemove = Object.keys(localStorage).filter((key) =>
        key.startsWith(this.prefix)
      );

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      logger().info('Storage cleared', { itemsRemoved: keysToRemove.length });
    } catch (error) {
      logger().error(
        'Storage clear failed',
        error instanceof Error ? error : undefined,
        { operation: 'clear' }
      );
    }
  }

  /**
   * Check if key exists in storage (does not check expiry)
   * @param key Storage key (without prefix)
   * @returns true if key exists
   */
  has(key: string): boolean {
    return localStorage.getItem(this.prefix + key) !== null;
  }

  /**
   * Get all keys managed by this service (without prefix)
   * @returns Array of keys without prefix
   */
  keys(): string[] {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.substring(this.prefix.length));
  }

  /**
   * Clear expired items to free up space
   * Called automatically when quota is exceeded
   */
  private clearExpired(): void {
    const keys = this.keys();
    let clearedCount = 0;

    keys.forEach((key) => {
      const item = this.get(key);
      // Item will be auto-removed if expired by get()
      if (item === null && this.has(key)) {
        // Item exists but couldn't be parsed or is expired
        this.remove(key);
        clearedCount++;
      }
    });

    logger().info('Expired items cleared', { clearedCount, totalKeys: keys.length });
  }

  /**
   * Get storage usage statistics
   * @returns Object with usage info
   */
  getStats() {
    const keys = this.keys();
    let totalSize = 0;

    keys.forEach((key) => {
      const item = localStorage.getItem(this.prefix + key);
      if (item) {
        totalSize += item.length;
      }
    });

    return {
      itemCount: keys.length,
      totalSizeBytes: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      estimatedQuotaMB: 5, // Most browsers: ~5MB for localStorage
      usagePercentage: ((totalSize / (5 * 1024 * 1024)) * 100).toFixed(2),
    };
  }
}

/**
 * Singleton instance - use this throughout the application
 */
export const storageService = new LocalStorageService();

/**
 * Export type for external use
 */
export type { StorageItem };
