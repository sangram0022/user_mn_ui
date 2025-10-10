/**
 * Advanced caching strategies for React applications
 */
import { useCallback, useEffect, useRef, useState } from 'react';

// Cache entry interface
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  stale: boolean;
}

// Cache configuration
export interface CacheConfig {
  defaultTTL: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of entries
  staleWhileRevalidate: boolean; // Serve stale data while revalidating
  persistToBrowser: boolean; // Persist to localStorage/sessionStorage
  storageKey?: string;
}

// Default cache configuration
const DEFAULT_CACHE_CONFIG: CacheConfig = {
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  maxSize: 100,
  staleWhileRevalidate: true,
  persistToBrowser: false
};

/**
 * In-memory cache implementation with LRU eviction
 */
export class MemoryCache<T = unknown> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Map<string, number>();
  private accessCounter = 0;
  private config: CacheConfig;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CACHE_CONFIG, ...config };
    
    if (this.config.persistToBrowser) {
      this.loadFromStorage();
    }
  }

  get(key: string): CacheEntry<T> | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Update access order for LRU
    this.accessOrder.set(key, ++this.accessCounter);

    // Check if expired
    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;

    if (isExpired) {
      if (this.config.staleWhileRevalidate) {
        return { ...entry, stale: true };
      } else {
        this.delete(key);
        return null;
      }
    }

    return entry;
  }

  set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.config.defaultTTL,
      stale: false
    };

    // Evict LRU entries if cache is full
    if (this.cache.size >= this.config.maxSize && !this.cache.has(key)) {
      this.evictLRU();
    }

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.accessCounter);

    if (this.config.persistToBrowser) {
      this.saveToStorage();
    }
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.accessOrder.delete(key);
    
    if (deleted && this.config.persistToBrowser) {
      this.saveToStorage();
    }
    
    return deleted;
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.accessCounter = 0;
    
    if (this.config.persistToBrowser) {
      this.clearStorage();
    }
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }

  private evictLRU(): void {
    let lruKey = '';
    let lruAccess = Infinity;

    for (const [key, access] of this.accessOrder) {
      if (access < lruAccess) {
        lruAccess = access;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.delete(lruKey);
    }
  }

  private loadFromStorage(): void {
    if (!this.config.storageKey) return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.cache = new Map(parsed.cache);
        this.accessOrder = new Map(parsed.accessOrder);
        this.accessCounter = parsed.accessCounter || 0;
      }
    } catch (error) {
      console.warn('Failed to load cache from storage:', error);
    }
  }

  private saveToStorage(): void {
    if (!this.config.storageKey) return;

    try {
      const toStore = {
        cache: Array.from(this.cache.entries()),
        accessOrder: Array.from(this.accessOrder.entries()),
        accessCounter: this.accessCounter
      };
      localStorage.setItem(this.config.storageKey, JSON.stringify(toStore));
    } catch (error) {
      console.warn('Failed to save cache to storage:', error);
    }
  }

  private clearStorage(): void {
    if (!this.config.storageKey) return;
    localStorage.removeItem(this.config.storageKey);
  }
}

/**
 * React hook for using cache with automatic revalidation
 */
export interface UseCacheOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  ttl?: number;
  enabled?: boolean;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

const globalCache = new MemoryCache();
const pendingRequests = new Map<string, Promise<unknown>>();

export function useCache<T>({
  key,
  fetcher,
  ttl,
  enabled = true,
  revalidateOnFocus = false,
  revalidateOnReconnect = false,
  dedupingInterval = 2000,
  onSuccess,
  onError
}: UseCacheOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef<number>(0);

  const revalidate = useCallback(async (force = false) => {
    if (!enabled || !mountedRef.current) return;

    // Prevent duplicate requests within deduping interval
    const now = Date.now();
    if (!force && now - lastFetchRef.current < dedupingInterval) {
      return;
    }

    const cachedEntry = globalCache.get(key) as CacheEntry<T> | null;
    
    // Return cached data if fresh and not forcing revalidation
    if (!force && cachedEntry && !cachedEntry.stale) {
      setData(cachedEntry.data);
      setError(null);
      return;
    }

    // Set loading state only if no cached data
    if (!cachedEntry) {
      setIsLoading(true);
    } else {
      setIsValidating(true);
    }

    // Check for pending request to avoid duplicate fetches
    const pendingKey = `${key}_${JSON.stringify(fetcher.toString())}`;
    let request = pendingRequests.get(pendingKey) as Promise<T> | undefined;

    if (!request) {
      request = fetcher();
      pendingRequests.set(pendingKey, request);
      
      // Clean up pending request after completion
      request.finally(() => {
        pendingRequests.delete(pendingKey);
      });
    }

    try {
      const result = await request;
      lastFetchRef.current = now;

      if (mountedRef.current) {
        setData(result);
        setError(null);
        globalCache.set(key, result, ttl);
        onSuccess?.(result);
      }
    } catch (err) {
      if (mountedRef.current) {
        const error = err as Error;
        setError(error);
        onError?.(error);
        
        // Keep serving stale data if available
        if (cachedEntry && cachedEntry.stale) {
          setData(cachedEntry.data);
        }
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsValidating(false);
      }
    }
  }, [key, fetcher, ttl, enabled, dedupingInterval, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    void revalidate();
  }, [revalidate]);

  // Revalidate on focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const handleFocus = () => {
      void revalidate();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [revalidate, revalidateOnFocus]);

  // Revalidate on reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const handleOnline = () => {
      void revalidate();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [revalidate, revalidateOnReconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const mutate = useCallback((newData?: T | ((prevData: T | null) => T)) => {
    if (typeof newData === 'function') {
      const updater = newData as (prevData: T | null) => T;
      const updated = updater(data);
      setData(updated);
      globalCache.set(key, updated, ttl);
    } else if (newData !== undefined) {
      setData(newData);
      globalCache.set(key, newData, ttl);
    } else {
      // Revalidate
      void revalidate(true);
    }
  }, [key, data, ttl, revalidate]);

  return {
    data,
    error,
    isLoading,
    isValidating,
    revalidate,
    mutate
  };
}

/**
 * Cache utilities
 */
export const CacheUtils = {
  // Invalidate specific cache entries
  invalidate: (keys: string | string[]) => {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    keysArray.forEach(key => globalCache.delete(key));
  },

  // Invalidate cache entries by pattern
  invalidatePattern: (pattern: RegExp) => {
    const keys = globalCache.keys();
    keys.forEach(key => {
      if (pattern.test(key)) {
        globalCache.delete(key);
      }
    });
  },

  // Clear all cache
  clear: () => {
    globalCache.clear();
  },

  // Get cache statistics
  getStats: () => ({
    size: globalCache.size(),
    keys: globalCache.keys()
  }),

  // Prefetch data
  prefetch: async <T>(key: string, fetcher: () => Promise<T>, ttl?: number) => {
    const cached = globalCache.get(key);
    if (!cached || cached.stale) {
      try {
        const data = await fetcher();
        globalCache.set(key, data, ttl);
      } catch (error) {
        console.warn(`Prefetch failed for key ${key}:`, error);
      }
    }
  }
};

export default {
  MemoryCache,
  useCache,
  CacheUtils
};