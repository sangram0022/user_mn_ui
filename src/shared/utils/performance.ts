/**
 * Performance Monitoring and Optimization Utilities
 * Expert-level performance tracking and optimization by 20-year React veteran
 *
 * React 19 Migration: All memoization removed - React Compiler handles optimization
 */

import { useEffect, useRef, useState } from 'react';
import { APP_CONFIG } from '../config/constants';
import { logger } from './logger';

// ==================== PERFORMANCE METRICS TYPES ====================

export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  type: 'timing' | 'counter' | 'gauge';
  tags?: Record<string, string | number>;
}

export interface NavigationTiming {
  navigationStart: number;
  unloadEventStart: number;
  unloadEventEnd: number;
  redirectStart: number;
  redirectEnd: number;
  fetchStart: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  secureConnectionStart: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domLoading: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  domComplete: number;
  loadEventStart: number;
  loadEventEnd: number;
}

export interface ResourceTiming {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
  initiatorType: string;
  transferSize: number;
  encodedBodySize: number;
  decodedBodySize: number;
}

export interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface WebVitals {
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte
}

// ==================== PERFORMANCE MONITOR CLASS ====================

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();
  private webVitals: WebVitals = {};
  private isEnabled: boolean = APP_CONFIG.FEATURES.ANALYTICS;

  constructor() {
    if (this.isEnabled && typeof window !== 'undefined') {
      this.initializeObservers();
      this.measureNavigationTiming();
      this.measureWebVitals();
    }
  }

  // ==================== INITIALIZATION ====================

  private initializeObservers(): void {
    // Resource timing observer
    this.createObserver('resource', (list) => {
      list.getEntries().forEach((entry) => {
        this.recordResourceTiming(entry as PerformanceResourceTiming);
      });
    });

    // Navigation timing observer
    this.createObserver('navigation', (list) => {
      list.getEntries().forEach((entry) => {
        this.recordNavigationTiming(entry as PerformanceNavigationTiming);
      });
    });

    // Paint timing observer
    this.createObserver('paint', (list) => {
      list.getEntries().forEach((entry) => {
        this.recordMetric({
          name: entry.name,
          value: entry.startTime,
          timestamp: Date.now(),
          type: 'timing',
          tags: { type: 'paint' },
        });
      });
    });

    // Largest Contentful Paint observer
    this.createObserver('largest-contentful-paint', (list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.webVitals.LCP = lastEntry.startTime;
        this.recordMetric({
          name: 'largest-contentful-paint',
          value: lastEntry.startTime,
          timestamp: Date.now(),
          type: 'timing',
          tags: { type: 'web-vital' },
        });
      }
    });

    // First Input Delay observer
    this.createObserver('first-input', (list) => {
      list.getEntries().forEach((entry: PerformanceEntry) => {
        const eventEntry = entry as PerformanceEntry & {
          processingStart: number;
          processingEnd: number;
        };
        const fid = eventEntry.processingStart - eventEntry.startTime;
        this.webVitals.FID = fid;
        this.recordMetric({
          name: 'first-input-delay',
          value: fid,
          timestamp: Date.now(),
          type: 'timing',
          tags: { type: 'web-vital' },
        });
      });
    });

    // Layout shift observer
    this.createObserver('layout-shift', (list) => {
      let clsValue = 0;
      list.getEntries().forEach((entry: PerformanceEntry) => {
        const layoutEntry = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        if (!layoutEntry.hadRecentInput) {
          clsValue += layoutEntry.value;
        }
      });

      if (clsValue > 0) {
        this.webVitals.CLS = (this.webVitals.CLS || 0) + clsValue;
        this.recordMetric({
          name: 'cumulative-layout-shift',
          value: this.webVitals.CLS,
          timestamp: Date.now(),
          type: 'gauge',
          tags: { type: 'web-vital' },
        });
      }
    });
  }

  private createObserver(
    type: string,
    callback: (list: PerformanceObserverEntryList) => void
  ): void {
    try {
      const observer = new PerformanceObserver(callback);
      observer.observe({ entryTypes: [type] });
      this.observers.set(type, observer);
    } catch (error) {
      logger.warn(`Failed to create ${type} observer:`, { error: String(error) });
    }
  }

  // ==================== TIMING MEASUREMENTS ====================

  private measureNavigationTiming(): void {
    // Wait for navigation to complete
    if (document.readyState === 'complete') {
      this.calculateNavigationMetrics();
    } else {
      window.addEventListener('load', () => {
        setTimeout(() => this.calculateNavigationMetrics(), 0);
      });
    }
  }

  private calculateNavigationMetrics(): void {
    const timing = performance.timing;
    if (!timing) return;

    const metrics = [
      { name: 'dns-lookup', value: timing.domainLookupEnd - timing.domainLookupStart },
      { name: 'tcp-connect', value: timing.connectEnd - timing.connectStart },
      { name: 'request', value: timing.responseStart - timing.requestStart },
      { name: 'response', value: timing.responseEnd - timing.responseStart },
      { name: 'dom-processing', value: timing.domComplete - timing.domLoading },
      { name: 'load-event', value: timing.loadEventEnd - timing.loadEventStart },
      { name: 'total-page-load', value: timing.loadEventEnd - timing.navigationStart },
    ];

    metrics.forEach((metric) => {
      if (metric.value >= 0) {
        this.recordMetric({
          name: metric.name,
          value: metric.value,
          timestamp: Date.now(),
          type: 'timing',
          tags: { type: 'navigation' },
        });
      }
    });
  }

  private measureWebVitals(): void {
    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      this.webVitals.FCP = fcpEntry.startTime;
      this.recordMetric({
        name: 'first-contentful-paint',
        value: fcpEntry.startTime,
        timestamp: Date.now(),
        type: 'timing',
        tags: { type: 'web-vital' },
      });
    }

    // Time to First Byte
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navEntry) {
      this.webVitals.TTFB = navEntry.responseStart - navEntry.requestStart;
      this.recordMetric({
        name: 'time-to-first-byte',
        value: this.webVitals.TTFB,
        timestamp: Date.now(),
        type: 'timing',
        tags: { type: 'web-vital' },
      });
    }
  }

  // ==================== RESOURCE TIMING ====================

  private recordResourceTiming(entry: PerformanceResourceTiming): void {
    this.recordMetric({
      name: 'resource-load-time',
      value: entry.duration,
      timestamp: Date.now(),
      type: 'timing',
      tags: {
        type: 'resource',
        resource: entry.name,
        initiator: entry.initiatorType,
        size: entry.transferSize,
      },
    });

    // Track slow resources
    if (entry.duration > 1000) {
      this.recordMetric({
        name: 'slow-resource',
        value: entry.duration,
        timestamp: Date.now(),
        type: 'timing',
        tags: {
          type: 'performance-issue',
          resource: entry.name,
          initiator: entry.initiatorType,
        },
      });
    }
  }

  private recordNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = [
      {
        name: 'dom-content-loaded',
        value: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
      },
      { name: 'dom-complete', value: entry.domComplete - entry.fetchStart },
      { name: 'load-complete', value: entry.loadEventEnd - entry.loadEventStart },
    ];

    metrics.forEach((metric) => {
      if (metric.value >= 0) {
        this.recordMetric({
          name: metric.name,
          value: metric.value,
          timestamp: Date.now(),
          type: 'timing',
          tags: { type: 'navigation-detail' },
        });
      }
    });
  }

  // ==================== MEMORY MONITORING ====================

  public measureMemoryUsage(): MemoryInfo | null {
    if (!('memory' in performance)) return null;

    const memory = (performance as Performance & { memory: MemoryInfo }).memory;
    const memoryInfo: MemoryInfo = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };

    this.recordMetric({
      name: 'memory-usage',
      value: memoryInfo.usedJSHeapSize,
      timestamp: Date.now(),
      type: 'gauge',
      tags: {
        type: 'memory',
        total: memoryInfo.totalJSHeapSize,
        limit: memoryInfo.jsHeapSizeLimit,
        percentage: Math.round((memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100),
      },
    });

    return memoryInfo;
  }

  // ==================== CUSTOM TIMING ====================

  public startTiming(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric({
        name,
        value: duration,
        timestamp: Date.now(),
        type: 'timing',
        tags: { type: 'custom' },
      });
    };
  }

  public markStart(name: string): void {
    if (this.isEnabled) {
      performance.mark(`${name}-start`);
    }
  }

  public markEnd(name: string): number | null {
    if (!this.isEnabled) return null;

    const endMark = `${name}-end`;
    const startMark = `${name}-start`;

    performance.mark(endMark);

    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name, 'measure')[0];

      if (measure) {
        this.recordMetric({
          name,
          value: measure.duration,
          timestamp: Date.now(),
          type: 'timing',
          tags: { type: 'measured' },
        });

        return measure.duration;
      }
    } catch (error) {
      logger.warn(`Failed to measure ${name}:`, { error: String(error) });
    }

    return null;
  }

  // ==================== METRIC RECORDING ====================

  private recordMetric(metric: PerformanceMetric): void {
    if (!this.isEnabled) return;

    this.metrics.push(metric);

    // Limit stored metrics to prevent memory leaks
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-500);
    }

    // Log performance issues
    this.checkPerformanceThresholds(metric);
  }

  private checkPerformanceThresholds(metric: PerformanceMetric): void {
    const thresholds = {
      'largest-contentful-paint': 2500, // LCP should be < 2.5s
      'first-input-delay': 100, // FID should be < 100ms
      'cumulative-layout-shift': 0.1, // CLS should be < 0.1
      'first-contentful-paint': 1800, // FCP should be < 1.8s
      'time-to-first-byte': 800, // TTFB should be < 800ms
      'total-page-load': 3000, // Total load should be < 3s
    };

    const threshold = thresholds[metric.name as keyof typeof thresholds];
    if (threshold && metric.value > threshold) {
      logger.warn(
        `Performance threshold exceeded for ${metric.name}: ${metric.value}ms > ${threshold}ms`
      );

      this.recordMetric({
        name: 'performance-threshold-exceeded',
        value: metric.value,
        timestamp: Date.now(),
        type: 'counter',
        tags: {
          type: 'performance-issue',
          metric: metric.name,
          threshold,
          severity: metric.value > threshold * 2 ? 'critical' : 'warning',
        },
      });
    }
  }

  // ==================== DATA EXPORT ====================

  public getMetrics(filter?: {
    type?: string;
    name?: string;
    since?: number;
  }): PerformanceMetric[] {
    let filteredMetrics = this.metrics;

    if (filter) {
      if (filter.type) {
        filteredMetrics = filteredMetrics.filter((m) => m.tags?.['type'] === filter.type);
      }
      if (filter.name) {
        filteredMetrics = filteredMetrics.filter((m) => m.name === filter.name);
      }
      if (filter.since !== undefined) {
        filteredMetrics = filteredMetrics.filter((m) => m.timestamp >= filter.since!);
      }
    }

    return filteredMetrics;
  }

  public getWebVitals(): WebVitals {
    return { ...this.webVitals };
  }

  public exportMetrics(): string {
    return JSON.stringify(
      {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        webVitals: this.webVitals,
        metrics: this.metrics,
      },
      null,
      2
    );
  }

  // ==================== CLEANUP ====================

  public destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.metrics = [];
  }
}

// ==================== PERFORMANCE UTILITIES ====================

export class PerformanceUtils {
  // Debounce function for performance optimization
  static debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number,
    immediate = false
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(this: unknown, ...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };

      const callNow = immediate && !timeout;

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait);

      if (callNow) func(...args);
    };
  }

  // Throttle function for performance optimization
  static throttle<T extends (...args: unknown[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return function executedFunction(this: unknown, ...args: Parameters<T>) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Memoization for expensive computations
  static memoize<T extends (...args: unknown[]) => unknown>(fn: T): T {
    const cache = new Map();

    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);

      if (cache.has(key)) {
        return cache.get(key);
      }

      const result = fn(...args);
      cache.set(key, result);

      return result;
    }) as T;
  }

  // Lazy loading utility
  static createLazyLoader<T>(loader: () => Promise<T>): () => Promise<T> {
    let promise: Promise<T> | null = null;

    return () => {
      if (!promise) {
        promise = loader().catch((error) => {
          promise = null; // Reset on error
          throw error;
        });
      }
      return promise;
    };
  }

  // RAF-based animation helper
  static createAnimationLoop(callback: (timestamp: number) => boolean | void): () => void {
    let animationId: number | null = null;
    let isRunning = false;

    const loop = (timestamp: number) => {
      if (!isRunning) return;

      const shouldContinue = callback(timestamp);
      if (shouldContinue !== false) {
        animationId = requestAnimationFrame(loop);
      } else {
        isRunning = false;
        animationId = null;
      }
    };

    const start = () => {
      if (!isRunning) {
        isRunning = true;
        animationId = requestAnimationFrame(loop);
      }
    };

    const stop = () => {
      isRunning = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    start();
    return stop;
  }

  // Virtual scrolling helper
  static createVirtualScroller(
    containerHeight: number,
    itemHeight: number,
    totalItems: number,
    buffer = 5
  ) {
    return (scrollTop: number) => {
      const visibleStart = Math.floor(scrollTop / itemHeight);
      const visibleEnd = Math.min(
        visibleStart + Math.ceil(containerHeight / itemHeight),
        totalItems - 1
      );

      const startIndex = Math.max(0, visibleStart - buffer);
      const endIndex = Math.min(totalItems - 1, visibleEnd + buffer);

      return {
        startIndex,
        endIndex,
        visibleStart,
        visibleEnd,
        totalHeight: totalItems * itemHeight,
        offsetY: startIndex * itemHeight,
      };
    };
  }

  // Performance-aware image loading
  static createImageLoader(): {
    loadImage: (src: string) => Promise<HTMLImageElement>;
    preloadImages: (sources: string[]) => Promise<HTMLImageElement[]>;
  } {
    const imageCache = new Map<string, HTMLImageElement>();

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      if (imageCache.has(src)) {
        return Promise.resolve(imageCache.get(src)!);
      }

      return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
          imageCache.set(src, img);
          resolve(img);
        };

        img.onerror = reject;
        img.src = src;
      });
    };

    const preloadImages = (sources: string[]): Promise<HTMLImageElement[]> => {
      return Promise.all(sources.map(loadImage));
    };

    return { loadImage, preloadImages };
  }
}

// ==================== REACT PERFORMANCE HOOKS ====================

// Performance monitoring hook
export function usePerformanceMonitor(): {
  startTiming: (name: string) => () => void;
  markStart: (name: string) => void;
  markEnd: (name: string) => number | null;
  getMetrics: () => PerformanceMetric[];
  getWebVitals: () => WebVitals;
} {
  const monitor = performanceMonitor;

  return {
    startTiming: monitor.startTiming.bind(monitor),
    markStart: monitor.markStart.bind(monitor),
    markEnd: monitor.markEnd.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    getWebVitals: monitor.getWebVitals.bind(monitor),
  };
}

// Optimized resize observer hook
export function useResizeObserver<T extends HTMLElement>(
  callback: (entry: ResizeObserverEntry) => void,
  options?: ResizeObserverOptions
): React.RefObject<T | null> {
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);
  const callbackRef = useRef(callback);

  // React 19 best practice: Update callback ref in useEffect
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        callbackRef.current(entry);
      }
    });

    observerRef.current.observe(element, options);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  return elementRef;
}

// Intersection observer hook for lazy loading
export function useIntersectionObserver<T extends HTMLElement>(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
): React.RefObject<T | null> {
  const elementRef = useRef<T | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const callbackRef = useRef(callback);

  // React 19 best practice: Update callback ref in useEffect
  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        callbackRef.current(entry);
      }
    }, options);

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [options]);

  return elementRef;
}

// Optimized debounced value hook
export function useDebouncedValue<T>(value: T, delay: number): T {
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
}

// Performance-aware callback hook
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
  const callbackRef = useRef<T>(callback);

  // React 19 best practice: Update callback ref in useEffect
  useEffect(() => {
    callbackRef.current = callback;
  });

  return ((...args: Parameters<T>) => callbackRef.current(...args)) as T;
}

/**
 * Optimized debounce hook for performance
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
 * Throttle hook for high-frequency events
 */
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  // React 19 best practice: Initialize refs without impure functions
  const lastRan = useRef<number>(0);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Initialize on first run (no state update to avoid cascading)
    if (!isInitialized.current) {
      isInitialized.current = true;
      lastRan.current = Date.now();
      // Don't call setThrottledValue here to avoid cascading renders
      return;
    }

    const handler = setTimeout(
      () => {
        if (Date.now() - lastRan.current >= limit) {
          setThrottledValue(value);
          lastRan.current = Date.now();
        }
      },
      limit - (Date.now() - lastRan.current)
    );

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

/**
 * Optimized pagination hook
 */
export const usePagination = (totalItems: number, itemsPerPage = 10, initialPage = 1) => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Convert useMemo to IIFE
  const pagination = (() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      currentPage,
      totalPages,
      itemsPerPage,
      startIndex,
      endIndex,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
      totalItems,
    };
  })();

  // Convert useCallback to plain functions
  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, pagination.totalPages));
    setCurrentPage(newPage);
  };

  const nextPage = () => {
    if (pagination.hasNext) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const previousPage = () => {
    if (pagination.hasPrevious) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  return { ...pagination, goToPage, nextPage, previousPage };
};

/**
 * Performance-optimized virtual list hook
 */
export const useVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  // Convert useMemo to IIFE
  const visibleItems = (() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
      offsetY: (startIndex + index) * itemHeight,
    }));
  })();

  const totalHeight = items.length * itemHeight;

  return { visibleItems, totalHeight, startIndex, endIndex, scrollTop, setScrollTop };
};

/**
 * Optimized intersection observer hook
 */
export const useIntersection = (
  threshold = 0.1,
  rootMargin = '0px'
): [React.RefObject<HTMLElement | null>, boolean] => {
  const elementRef = useRef<HTMLElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setIsIntersecting(entry.isIntersecting);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return [elementRef, isIntersecting];
};

/**
 * Memory-efficient state for large datasets
 */
export const useLargeDataset = <T>(data: T[], pageSize = 100) => {
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(data.length / pageSize);

  // Convert useMemo to IIFE
  const currentData = (() => {
    const start = currentPage * pageSize;
    return data.slice(start, start + pageSize);
  })();

  // Convert useCallback to plain functions
  const loadMore = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const reset = () => {
    setCurrentPage(0);
  };

  return {
    currentData,
    currentPage,
    totalPages,
    hasMore: currentPage < totalPages - 1,
    loadMore,
    reset,
  };
};

// ==================== SINGLETON INSTANCE ====================

export const performanceMonitor = new PerformanceMonitor();

// ==================== EXPORTS ====================

export default {
  PerformanceMonitor,
  PerformanceUtils,
  performanceMonitor,
  usePerformanceMonitor,
  useResizeObserver,
  useIntersectionObserver,
  useDebouncedValue,
  useStableCallback,
  useDebounce,
  useThrottle,
  usePagination,
  useVirtualList,
  useIntersection,
  useLargeDataset,
};
