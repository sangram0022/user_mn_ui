/**
 * Advanced Performance Optimization Utilities
 *
 * Latest techniques from 20 years of UI performance engineering:
 * - Resource hints and preloading
 * - Image optimization
 * - Font loading strategies
 * - Component-level performance
 * - Memory management
 * - Network optimization
 *
 * @version 3.0.0
 * @author Senior UI Performance Engineer
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

// ============================================================================
// RESOURCE HINTS AND PRELOADING
// ============================================================================

/**
 * Preconnect to external origins for faster resource loading
 */
export const preconnectToOrigin = (url: string, crossorigin = false): void => {
  if (typeof document === 'undefined') return;

  // Check if already preconnected
  const existing = document.querySelector(`link[rel="preconnect"][href="${url}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = url;
  if (crossorigin) {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);

  // Also add dns-prefetch as fallback
  const dnsPrefetch = document.createElement('link');
  dnsPrefetch.rel = 'dns-prefetch';
  dnsPrefetch.href = url;
  document.head.appendChild(dnsPrefetch);
};

/**
 * Prefetch a resource for future navigation
 */
export const prefetchResource = (
  url: string,
  type: 'script' | 'style' | 'fetch' = 'fetch'
): void => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  if (type !== 'fetch') {
    link.as = type;
  }
  document.head.appendChild(link);
};

/**
 * Preload critical resources
 */
export const preloadResource = (
  url: string,
  type: 'script' | 'style' | 'font' | 'image',
  crossorigin = false
): void => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = type;
  if (crossorigin || type === 'font') {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
};

// ============================================================================
// IMAGE OPTIMIZATION
// ============================================================================

/**
 * Hook for lazy loading images with intersection observer
 */
export const useLazyImage = (
  src: string,
  rootMargin = '50px'
): {
  imageSrc: string | undefined;
  imageRef: React.RefObject<HTMLImageElement>;
  isLoaded: boolean;
} => {
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imageRef.current || !('IntersectionObserver' in window)) {
      setImageSrc(src);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      { rootMargin }
    );

    observer.observe(imageRef.current);

    return () => observer.disconnect();
  }, [src, rootMargin]);

  useEffect(() => {
    if (!imageSrc) return;

    const img = new Image();
    img.src = imageSrc;
    img.onload = () => setIsLoaded(true);
  }, [imageSrc]);

  return { imageSrc, imageRef, isLoaded };
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (baseUrl: string, widths: number[]): string => {
  return widths.map((width) => `${baseUrl}?w=${width} ${width}w`).join(', ');
};

// ============================================================================
// FONT OPTIMIZATION
// ============================================================================

/**
 * Preload critical fonts
 */
export const preloadFont = (url: string, format: 'woff2' | 'woff' = 'woff2'): void => {
  if (typeof document === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = url;
  link.as = 'font';
  link.type = `font/${format}`;
  link.crossOrigin = 'anonymous';
  document.head.appendChild(link);
};

/**
 * Use font display swap for better performance
 */
export const optimizeFontDisplay = (): void => {
  if (typeof document === 'undefined') return;

  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
};

// ============================================================================
// COMPONENT PERFORMANCE
// ============================================================================

/**
 * Hook for debounced values (prevents excessive re-renders)
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook for throttled callbacks (limits execution rate)
 */
export const useThrottle = <T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    }) as T,
    [callback, delay]
  );
};

/**
 * Hook for intersection observer (viewport visibility detection)
 */
export const useIntersectionObserver = (
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLElement>, boolean] => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!targetRef.current || !('IntersectionObserver' in window)) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(targetRef.current);

    return () => observer.disconnect();
  }, [options]);

  return [targetRef, isIntersecting];
};

/**
 * Hook for measuring render time
 */
export const useRenderTime = (componentName: string): void => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useLayoutEffect(() => {
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderTime = Date.now() - startTime.current;
    if (import.meta.env.DEV) {
      console.log(`[Performance] ${componentName} render #${renderCount.current}: ${renderTime}ms`);
    }
    startTime.current = Date.now();
  });
};

// ============================================================================
// MEMORY MANAGEMENT
// ============================================================================

/**
 * LRU Cache implementation for component-level caching
 */
export class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;

    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    // Remove if exists
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // Add to end
    this.cache.set(key, value);

    // Evict oldest if over capacity
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * Hook for LRU cached values
 */
export const useLRUCache = <K, V>(maxSize: number): LRUCache<K, V> => {
  return useMemo(() => new LRUCache<K, V>(maxSize), [maxSize]);
};

// ============================================================================
// NETWORK OPTIMIZATION
// ============================================================================

/**
 * Get network connection quality
 */
export const getNetworkQuality = (): {
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
} => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return {
      effectiveType: '4g',
      downlink: 10,
      rtt: 50,
      saveData: false,
    };
  }

  const connection = (
    navigator as Navigator & {
      connection?: {
        effectiveType?: string;
        downlink?: number;
        rtt?: number;
        saveData?: boolean;
      };
    }
  ).connection;
  return {
    effectiveType: connection?.effectiveType || '4g',
    downlink: connection?.downlink || 10,
    rtt: connection?.rtt || 50,
    saveData: connection?.saveData || false,
  };
};

/**
 * Hook for adaptive loading based on network
 */
export const useAdaptiveLoading = (): {
  shouldLoad: boolean;
  networkQuality: 'slow' | 'medium' | 'fast';
} => {
  const [networkQuality, setNetworkQuality] = useState<'slow' | 'medium' | 'fast'>('fast');

  useEffect(() => {
    const updateNetworkQuality = () => {
      const { effectiveType, saveData } = getNetworkQuality();

      if (saveData || effectiveType === 'slow-2g' || effectiveType === '2g') {
        setNetworkQuality('slow');
      } else if (effectiveType === '3g') {
        setNetworkQuality('medium');
      } else {
        setNetworkQuality('fast');
      }
    };

    updateNetworkQuality();

    if ('connection' in navigator) {
      const connection = (
        navigator as Navigator & {
          connection?: {
            addEventListener: (event: string, handler: () => void) => void;
            removeEventListener: (event: string, handler: () => void) => void;
          };
        }
      ).connection;
      if (connection) {
        connection.addEventListener('change', updateNetworkQuality);
        return () => connection.removeEventListener('change', updateNetworkQuality);
      }
    }

    return undefined;
  }, []);

  return {
    shouldLoad: networkQuality !== 'slow',
    networkQuality,
  };
};

// ============================================================================
// WEB VITALS MONITORING
// ============================================================================

/**
 * Report web vitals to analytics
 */
export const reportWebVitals = (metric: {
  name: string;
  value: number;
  id: string;
  delta: number;
}): void => {
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${metric.name}:`, metric.value);
  }

  // Send to analytics in production
  if (import.meta.env.PROD) {
    // Replace with your analytics endpoint
    // fetch('/analytics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric),
    // });
  }
};

// ============================================================================
// VIEW TRANSITIONS API (LATEST)
// ============================================================================

/**
 * Use View Transitions API for smooth page transitions
 */
export const useViewTransition = (): ((callback: () => void) => void) => {
  return useCallback((callback: () => void) => {
    if (typeof document === 'undefined') {
      callback();
      return;
    }

    // Check for View Transitions API support
    if ('startViewTransition' in document) {
      (
        document as Document & { startViewTransition: (callback: () => void) => void }
      ).startViewTransition(() => {
        callback();
      });
    } else {
      // Fallback for browsers without support
      callback();
    }
  }, []);
};

// ============================================================================
// VIRTUAL SCROLLING
// ============================================================================

/**
 * Hook for virtual scrolling (render only visible items)
 */
export const useVirtualScroll = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
): {
  visibleItems: T[];
  offsetY: number;
  totalHeight: number;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
} => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);
  const visibleItems = items.slice(visibleStart, visibleEnd + 1);
  const offsetY = visibleStart * itemHeight;
  const totalHeight = items.length * itemHeight;

  const onScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    offsetY,
    totalHeight,
    onScroll,
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  preconnectToOrigin,
  prefetchResource,
  preloadResource,
  useLazyImage,
  generateSrcSet,
  preloadFont,
  optimizeFontDisplay,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  useRenderTime,
  LRUCache,
  useLRUCache,
  getNetworkQuality,
  useAdaptiveLoading,
  reportWebVitals,
  useViewTransition,
  useVirtualScroll,
};
