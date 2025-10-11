/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/exhaustive-deps */
/**
 * Performance Optimization Utilities
 *
 * Advanced patterns for React performance optimization
 * Memory management, memoization, and cleanup helpers
 *
 * @module shared/utils/performance-optimizations
 */

import { DependencyList, useCallback, useEffect, useMemo, useRef } from 'react';

// ============================================================================
// MEMORY OPTIMIZATION
// ============================================================================

/**
 * WeakCache - Memory-efficient cache using WeakMap
 *
 * Automatically garbage collected when keys are no longer referenced
 * Perfect for caching data associated with objects
 *
 * @example
 * ```typescript
 * const cache = new WeakCache<User, ProcessedData>();
 *
 * function processUser(user: User) {
 *   if (cache.has(user)) {
 *     return cache.get(user);
 *   }
 *
 *   const processed = expensiveOperation(user);
 *   cache.set(user, processed);
 *   return processed;
 * }
 * ```
 */
export class WeakCache<K extends object, V> {
  private cache = new WeakMap<K, V>();

  get(key: K): V | undefined {
    return this.cache.get(key);
  }

  set(key: K, value: V): void {
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }
}

/**
 * LRU Cache with size limit
 *
 * Least Recently Used cache with automatic eviction
 *
 * @example
 * ```typescript
 * const cache = new LRUCache<string, Data>(100);
 * cache.set('key', data);
 * const data = cache.get('key');
 * ```
 */
export class LRUCache<K, V> {
  private cache = new Map<K, V>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const value = this.cache.get(key);

    if (value !== undefined) {
      // Move to end (most recently used)
      this.cache.delete(key);
      this.cache.set(key, value);
    }

    return value;
  }

  set(key: K, value: V): void {
    // Remove if exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Evict oldest if over size
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  /**
   * Check if a key exists in the cache without updating recency
   */
  has(key: K): boolean {
    return this.cache.has(key);
  }

  /**
   * Delete a key from the cache
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * useCleanupEffect - Automatic cleanup for effects
 *
 * Ensures proper cleanup and prevents memory leaks
 *
 * @example
 * ```typescript
 * useCleanupEffect(() => {
 *   const observer = new IntersectionObserver(callback);
 *   observer.observe(element);
 *
 *   return () => {
 *     observer.disconnect();
 *   };
 * }, [element]);
 * ```
 */
export function useCleanupEffect(effect: () => void | (() => void), deps: DependencyList): void {
  useEffect(() => {
    const cleanup = effect();

    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, deps);
}

/**
 * CleanupRegistry - Track and cleanup multiple resources
 *
 * @example
 * ```typescript
 * const cleanup = new CleanupRegistry();
 *
 * const observer = new IntersectionObserver(callback);
 * cleanup.register('observer', () => observer.disconnect());
 *
 * const timeout = setTimeout(fn, 1000);
 * cleanup.register('timeout', () => clearTimeout(timeout));
 *
 * // Cleanup all at once
 * cleanup.cleanupAll();
 * ```
 */
export class CleanupRegistry {
  private cleanups = new Map<string, () => void>();

  register(id: string, cleanup: () => void): void {
    // Replace previous if exists (do not invoke previous cleanup now)
    this.cleanups.set(id, cleanup);
  }

  unregister(id: string): void {
    const cleanup = this.cleanups.get(id);

    if (cleanup) {
      cleanup();
      this.cleanups.delete(id);
    }
  }

  /**
   * Cleanup a specific resource by id (alias for unregister for semantic clarity)
   */
  cleanup(id: string): void {
    this.unregister(id);
  }

  cleanupAll(): void {
    this.cleanups.forEach((cleanup) => {
      try {
        cleanup();
      } catch {
        // Swallow individual cleanup errors and continue
      }
    });
    this.cleanups.clear();
  }
}

/**
 * useCleanupRegistry - Hook for cleanup registry
 *
 * Automatically cleans up on unmount
 */
export function useCleanupRegistry(): CleanupRegistry {
  const registryRef = useRef<CleanupRegistry | null>(null);

  if (!registryRef.current) {
    registryRef.current = new CleanupRegistry();
  }

  useEffect(() => {
    return () => {
      registryRef.current?.cleanupAll();
    };
  }, []);

  return registryRef.current;
}

// ============================================================================
// MEMOIZATION HELPERS
// ============================================================================

/**
 * useMemoizedCallback - Stable callback with memoized dependencies
 *
 * Prevents unnecessary re-renders when passing callbacks to children
 *
 * @example
 * ```typescript
 * const handleUpdate = useMemoizedCallback((id: string) => {
 *   updateUser(id, data);
 * }, [data]);
 * ```
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  return useCallback(callback, deps);
}

/**
 * useStableCallback - Always stable callback (uses ref)
 *
 * Callback never changes, but always calls latest version
 * Perfect for event handlers
 *
 * @example
 * ```typescript
 * const handleClick = useStableCallback(() => {
 *   // Can use any state/props without re-creating
 *   doSomething(count);
 * });
 * ```
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef(callback);

  // Update ref on every render
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Return stable function
  return useCallback(
    ((...args) => {
      return callbackRef.current(...args);
    }) as T,
    []
  );
}

/**
 * useMemoizedObject - Memoize object to prevent reference changes
 *
 * Prevents unnecessary re-renders when object content is same
 *
 * @example
 * ```typescript
 * const config = useMemoizedObject({
 *   apiUrl,
 *   timeout: 5000,
 *   retries: 3
 * });
 * ```
 */
export function useMemoizedObject<T extends Record<string, any>>(obj: T): T {
  return useMemo(() => obj, [JSON.stringify(obj)]);
}

/**
 * useDeepMemo - Deep comparison memoization
 *
 * Uses deep equality check instead of reference equality
 */
export function useDeepMemo<T>(factory: () => T, deps: DependencyList): T {
  const valueRef = useRef<T | undefined>(undefined);
  const depsRef = useRef<DependencyList | undefined>(undefined);

  if (!depsRef.current || !deepEqual(deps, depsRef.current)) {
    valueRef.current = factory();
    depsRef.current = deps;
  }

  return valueRef.current!;
}

/**
 * Deep equality check
 */
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) => deepEqual(a[key], b[key]));
}

// ============================================================================
// RENDERING OPTIMIZATION
// ============================================================================

/**
 * useRenderCount - Debug hook to track renders
 *
 * Development tool to identify re-render issues
 *
 * @example
 * ```typescript
 * const renderCount = useRenderCount('MyComponent');
 * console.log(`Rendered ${renderCount} times`);
 * ```
 */
export function useRenderCount(_componentName: string = 'Component'): number {
  const renderCount = useRef(0);

  renderCount.current += 1;

  // Provide console output for debugging as tests expect
  console.log(_componentName, `Render #${renderCount.current}`);

  return renderCount.current;
}

/**
 * useWhyDidYouUpdate - Debug hook to identify what caused re-render
 *
 * @example
 * ```typescript
 * useWhyDidYouUpdate('MyComponent', { prop1, prop2, state1 });
 * ```
 */
export function useWhyDidYouUpdate(_componentName: string, props: Record<string, any>): void {
  const previousProps = useRef<Record<string, any> | undefined>(undefined);

  useEffect(() => {
    if (previousProps.current) {
      const changedProps = Object.entries(props).reduce(
        (acc, [key, value]) => {
          if (previousProps.current![key] !== value) {
            acc[key] = {
              from: previousProps.current![key],
              to: value,
            };
          }
          return acc;
        },
        {} as Record<string, any>
      );

      if (Object.keys(changedProps).length > 0) {
        console.log(_componentName, 'Changed props', changedProps);
      }
    }

    previousProps.current = props;
  });
}

/**
 * useDeferredValue - Defer expensive value updates
 *
 * Similar to React 18's useDeferredValue but with custom timeout
 *
 * @example
 * ```typescript
 * const deferredQuery = useDeferredValue(searchQuery, 300);
 * ```
 */
export function useDeferredValue<T>(value: T, delay: number = 300): T {
  const [deferredValue, setDeferredValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDeferredValue(value);
    }, delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return deferredValue;
}

// ============================================================================
// OBSERVER UTILITIES
// ============================================================================

/**
 * useIntersectionObserver - Observe element visibility
 *
 * Automatically cleans up observer
 *
 * @example
 * ```typescript
 * const ref = useIntersectionObserver<HTMLDivElement>((entries) => {
 *   if (entries[0].isIntersecting) {
 *     loadMore();
 *   }
 * });
 *
 * return <div ref={ref}>Load more trigger</div>;
 * ```
 */
export function useIntersectionObserver<T extends Element>(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(callback, options);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback, options]);

  return elementRef;
}

/**
 * useResizeObserver - Observe element size changes
 *
 * @example
 * ```typescript
 * const ref = useResizeObserver<HTMLDivElement>((entries) => {
 *   const { width, height } = entries[0].contentRect;
 *   setDimensions({ width, height });
 * });
 * ```
 */
export function useResizeObserver<T extends Element>(callback: ResizeObserverCallback) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const observer = new ResizeObserver(callback);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [callback]);

  return elementRef;
}

// ============================================================================
// EXPORTS
// ============================================================================

// Need to add this import
import { useState } from 'react';

export default {
  WeakCache,
  LRUCache,
  CleanupRegistry,
  useCleanupEffect,
  useCleanupRegistry,
  useMemoizedCallback,
  useStableCallback,
  useMemoizedObject,
  useDeepMemo,
  useRenderCount,
  useWhyDidYouUpdate,
  useDeferredValue,
  useIntersectionObserver,
  useResizeObserver,
};
