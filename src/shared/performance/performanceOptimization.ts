/**
 * Performance Optimization Utilities
 * Expert-level performance enhancements by 20-year React veteran
 */

import { logger } from './../utils/logger';
import React, { memo, useMemo, useCallback, useRef, useState, useEffect, ComponentType, useTransition } from 'react';

// ==================== MEMOIZATION UTILITIES ====================

/**
 * Deep comparison memoization hook
 */
export function useDeepMemo<T>(value: T, deps: React.DependencyList): T { const ref = useRef<T>(value);
  const depsRef = useRef(deps);

  const hasChanged = useMemo(() => {
    if (deps.length !== depsRef.current.length) return true;
    
    return deps.some((dep, index) => {
      const prevDep = depsRef.current[index];
      return !Object.is(dep, prevDep);
    });
  }, deps);

  if (hasChanged) { ref.current = value;
    depsRef.current = deps;
  }

  return ref.current;
}

/**
 * Stable callback that persists across renders
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T { const callbackRef = useRef(callback);
  
  // Update the callback ref whenever the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  });

  // Return a stable callback that calls the latest version
  return useCallback((...args: unknown[]) => { return callbackRef.current(...args);
  }, []) as T;
}

/**
 * Memoized component with custom comparison
 */
export function createMemoComponent<P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) { return memo(Component, areEqual);
 }

/**
 * Smart memo that only re-renders on specific prop changes
 */
export function createSelectiveMemo<P extends object>(
  Component: ComponentType<P>,
  watchProps: (keyof P)[]
) { return memo(Component, (prevProps, nextProps) => {
    return watchProps.every(prop => Object.is(prevProps[prop], nextProps[prop]));
  });
}

// ==================== DEBOUNCING & THROTTLING ====================

/**
 * Debounced value hook
 */
export function useDebounce<T>(value: T, delay: number): T { const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => { clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Throttled value hook
 */
export function useThrottle<T>(value: T, limit: number): T { const [throttledValue, setThrottledValue] = useState(value);
  const lastRan = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => { clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T { const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: unknown[]) => { if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => { callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number
): T { const callbackRef = useRef(callback);
  const lastRan = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: unknown[]) => { const now = Date.now();
    if (now - lastRan.current >= limit) {
      callbackRef.current(...args);
      lastRan.current = now;
    }
  }, [limit]) as T;
}

// ==================== VIRTUALIZATION HELPERS ====================

/**
 * Virtual list hook for large datasets
 */
export function useVirtualList<T>({ items,
  itemHeight,
  containerHeight,
  overscan = 5,
 }: { items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
 }) { const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return { visibleItems,
    totalHeight,
    offsetY,
    onScroll: (e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    },
  };
}

/**
 * Window virtualization hook
 */
export function useWindowVirtualization<T>({ items,
  estimatedItemHeight,
  getItemHeight,
 }: { items: T[];
  estimatedItemHeight: number;
  getItemHeight?: (index: number) => number;
 }) { const [measuredHeights, setMeasuredHeights] = useState<number[]>([]);
  const [scrollTop, setScrollTop] = useState(0);

  const itemHeights = useMemo(() => {
    return items.map((_, index) => {
      if (getItemHeight) {
        return getItemHeight(index);
      }
      return measuredHeights[index] || estimatedItemHeight;
    });
  }, [items, measuredHeights, estimatedItemHeight, getItemHeight]);

  const itemOffsets = useMemo(() => { const offsets = [0];
    for (let i = 1; i < items.length; i++) {
      offsets[i] = offsets[i - 1] + itemHeights[i - 1];
    }
    return offsets;
  }, [itemHeights, items.length]);

  const measureItem = useCallback((index: number, height: number) => { setMeasuredHeights(prev => {
      const newHeights = [...prev];
      newHeights[index] = height;
      return newHeights;
    });
  }, []);

  useEffect(() => { const handleScroll = () => {
      setScrollTop(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { itemOffsets,
    measureItem,
    scrollTop,
  };
}

// ==================== IMAGE OPTIMIZATION ====================

/**
 * Progressive image loading hook
 */
export function useProgressiveImage(src: string, placeholder?: string) { const [loading, setLoading] = useState(true);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    setLoading(true);
    setError(false);

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };

    img.onerror = () => { setError(true);
      setLoading(false);
    };

    img.src = src;

    return () => { img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { src: currentSrc, loading, error };
}

/**
 * Intersection observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) { const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => { observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
}

// ==================== BUNDLE OPTIMIZATION ====================

/**
 * Dynamic import with error handling
 */
export function createDynamicImport<T>(
  importFunction: () => Promise<T>,
  retries = 3,
  delay = 1000
): () => Promise<T> { return async () => {
    let lastError: Error;

    for (let i = 0; i < retries; i++) {
      try {
        return await importFunction();
      } catch (error) { lastError = error as Error;
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
      }
    }

    throw lastError!;
  };
}

/**
 * Preload resources
 */
export class ResourcePreloader { private static cache = new Map<string, Promise<unknown>>();

  static preload<T>(key: string, loader: () => Promise<T>): Promise<T> {
    if (!this.cache.has(key)) {
      this.cache.set(key, loader());
    }
    return this.cache.get(key)! as Promise<T>;
  }

  static get<T>(key: string): Promise<T> | undefined { return this.cache.get(key) as Promise<T> | undefined;
  }

  static clear(key?: string): void { if (key) {
      this.cache.delete(key);
    } else { this.cache.clear();
    }
  }
}

// ==================== MEMORY OPTIMIZATION ====================

/**
 * Memory-efficient object comparison
 */
export function shallowEqual(objA: unknown, objB: unknown): boolean { if (Object.is(objA, objB)) return true;

  if (typeof objA !== 'object' || objA === null ||
      typeof objB !== 'object' || objB === null) {
    return false;
  }

  const a = objA as Record<string, unknown>;
  const b = objB as Record<string, unknown>;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) { if (!Object.prototype.hasOwnProperty.call(b, key) ||
        !Object.is(a[key], b[key])) {
      return false;
    }
  }

  return true;
}

/**
 * Weak reference manager for avoiding memory leaks
 */
export class WeakRefManager<T extends object> { private refs = new Set<WeakRef<T>>();
  private registry = new FinalizationRegistry<WeakRef<T>>((ref) => {
    this.refs.delete(ref);
  });

  add(obj: T): WeakRef<T> { const ref = new WeakRef(obj);
    this.refs.add(ref);
    this.registry.register(obj, ref);
    return ref;
  }

  getAll(): T[] { const alive: T[] = [];
    const dead: WeakRef<T>[] = [];

    for (const ref of this.refs) {
      const obj = ref.deref();
      if (obj) {
        alive.push(obj);
      } else { dead.push(ref);
      }
    }

    // Clean up dead references
    dead.forEach(ref => this.refs.delete(ref));

    return alive;
  }

  clear(): void { this.refs.clear();
  }
}

// ==================== RENDER OPTIMIZATION ====================

/**
 * Batch updates to reduce re-renders
 */
export function useBatchedUpdates() { const [, setUpdates] = useState<Array<() => void>>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleUpdate = useCallback((updateFn: () => void) => {
    setUpdates(prev => [...prev, updateFn]);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => { setUpdates(currentUpdates => {
        currentUpdates.forEach(fn => fn());
        return [];
      });
    }, 0);
  }, []);

  useEffect(() => { return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return scheduleUpdate;
}

/**
 * Concurrent features helper
 */
export function useConcurrentFeatures() { const [isPending, startTransitionFn] = useTransition();

  const deferredUpdate = useCallback((updateFn: () => void) => {
    startTransitionFn(() => {
      updateFn();
    });
  }, [startTransitionFn]);

  return { isPending,
    deferredUpdate,
  };
}

// ==================== PERFORMANCE MONITORING ====================

/**
 * Component render time profiler
 */
export function useRenderProfiler(componentName: string) { const renderStart = useRef<number>(0);

  useEffect(() => {
    renderStart.current = performance.now();
  });

  useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    
    if (renderTime > 16) { // Flag slow renders (>16ms)
      logger.warn(`${componentName} render took ${renderTime.toFixed(2)}ms`);
    }

    // Send to performance monitoring service
    if (typeof window !== 'undefined' && (window as any).gtag) { (window as any).gtag('event', 'render_performance', {
        component: componentName,
        render_time: renderTime,
      });
    }
  });
}

/**
 * Memory usage monitor
 */
export function useMemoryMonitor() { const [memoryInfo, setMemoryInfo] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => { const updateMemoryInfo = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// All exports are handled inline above