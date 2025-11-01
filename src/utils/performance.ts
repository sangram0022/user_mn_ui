/**
 * Modern Performance Utilities
 * Latest optimization techniques for React applications
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import React from 'react';

// Type definitions for modern web APIs
interface PerformanceEntryWithValue extends PerformanceEntry {
  value?: number;
  hadRecentInput?: boolean;
  processingStart?: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
  };
  mozConnection?: {
    effectiveType?: string;
  };
  webkitConnection?: {
    effectiveType?: string;
  };
  deviceMemory?: number;
}

// =====================================
// INTERSECTION OBSERVER UTILITIES
// =====================================

interface IntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
}

/**
 * Enhanced Intersection Observer hook with performance optimizations
 */
export function useIntersectionObserver(options: IntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    const element = ref.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options, hasIntersected]);

  return { ref, isIntersecting, hasIntersected };
}

/**
 * Lazy loading hook for images with modern formats support
 */
export function useLazyImage(src: string, fallbackSrc?: string) {
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (isIntersecting && !imageSrc) {
      // Check for WebP support
      const checkWebP = () => {
        return new Promise<boolean>((resolve) => {
          const webP = new Image();
          webP.onload = webP.onerror = () => {
            resolve(webP.height === 2);
          };
          webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });
      };

      checkWebP().then((supportsWebP) => {
        if (supportsWebP && (src.includes('.jpg') || src.includes('.jpeg') || src.includes('.png'))) {
          // Try WebP version first
          const webpSrc = src.replace(/\.(jpg|jpeg|png)(\?.*)?$/, '.webp$2');
          
          const img = new Image();
          img.onload = () => setImageSrc(webpSrc);
          img.onerror = () => setImageSrc(src);
          img.src = webpSrc;
        } else {
          setImageSrc(src);
        }
      });
    }
  }, [isIntersecting, src, imageSrc]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setHasError(true);
    if (fallbackSrc && imageSrc !== fallbackSrc) {
      setImageSrc(fallbackSrc);
    }
  }, [fallbackSrc, imageSrc]);

  return {
    ref,
    src: imageSrc,
    isLoaded,
    hasError,
    onLoad: handleLoad,
    onError: handleError,
  };
}

// =====================================
// CORE WEB VITALS OPTIMIZATION
// =====================================

/**
 * Performance metrics tracking
 */
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<{
    lcp?: number;
    fid?: number;
    cls?: number;
    fcp?: number;
    ttfb?: number;
  }>({});

  useEffect(() => {
    // Performance Observer for Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntryWithValue;
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntryWithValue) => {
          if (entry.processingStart) {
            setMetrics(prev => ({ ...prev, fid: entry.processingStart! - entry.startTime }));
          }
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntryWithValue) => {
          if (!entry.hadRecentInput && entry.value) {
            clsValue += entry.value;
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          }
        });
      });
      fcpObserver.observe({ type: 'paint', buffered: true });

      // Time to First Byte (TTFB)
      const navigationObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry) => {
          const navEntry = entry as PerformanceNavigationTiming;
          if (navEntry.responseStart && navEntry.requestStart) {
            const ttfb = navEntry.responseStart - navEntry.requestStart;
            setMetrics(prev => ({ ...prev, ttfb }));
          }
        });
      });
      navigationObserver.observe({ type: 'navigation', buffered: true });

      return () => {
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
        fcpObserver.disconnect();
        navigationObserver.disconnect();
      };
    }
  }, []);

  return metrics;
}

// =====================================
// MODERN LOADING PATTERNS
// =====================================

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: string, type?: string) {
  if (typeof window === 'undefined') return;

  const existing = document.querySelector(`link[href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (type) link.type = type;
  
  document.head.appendChild(link);
}

/**
 * Prefetch resources for next navigation
 */
export function prefetchResource(href: string) {
  if (typeof window === 'undefined') return;

  const existing = document.querySelector(`link[href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  
  document.head.appendChild(link);
}

/**
 * Modern image preloading with responsive images
 */
export function preloadImage(src: string, sizes?: string, srcSet?: string) {
  if (typeof window === 'undefined') return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  
  if (sizes) link.setAttribute('imagesizes', sizes);
  if (srcSet) link.setAttribute('imagesrcset', srcSet);
  
  document.head.appendChild(link);
}

// =====================================
// DEVICE CAPABILITIES DETECTION
// =====================================

/**
 * Detect user's device capabilities for adaptive loading
 */
export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState({
    connection: 'unknown',
    deviceMemory: 'unknown',
    hardwareConcurrency: navigator.hardwareConcurrency || 1,
    isLowEndDevice: false,
    prefersReducedMotion: false,
    prefersReducedData: false,
  });

  useEffect(() => {
    const nav = navigator as NavigatorWithConnection;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;
    const deviceMemory = nav.deviceMemory;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // Check for data saver preference
    const prefersReducedData = window.matchMedia('(prefers-reduced-data: reduce)').matches;

    // Determine if it's a low-end device
    const isLowEndDevice = deviceMemory && deviceMemory < 4;

    setCapabilities({
      connection: connection?.effectiveType || 'unknown',
      deviceMemory: deviceMemory ? String(deviceMemory) : 'unknown',
      hardwareConcurrency: navigator.hardwareConcurrency || 1,
      isLowEndDevice: Boolean(isLowEndDevice),
      prefersReducedMotion,
      prefersReducedData,
    });
  }, []);

  return capabilities;
}

// =====================================
// MODERN CACHING STRATEGIES
// =====================================

/**
 * Cache API wrapper for modern web apps
 */
export class ModernCache {
  private cacheName: string;

  constructor(cacheName: string = 'app-cache-v1') {
    this.cacheName = cacheName;
  }

  async get(url: string): Promise<Response | undefined> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      return await cache.match(url);
    }
    return undefined;
  }

  async set(url: string, response: Response): Promise<void> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      await cache.put(url, response.clone());
    }
  }

  async delete(url: string): Promise<boolean> {
    if ('caches' in window) {
      const cache = await caches.open(this.cacheName);
      return await cache.delete(url);
    }
    return false;
  }

  async clear(): Promise<void> {
    if ('caches' in window) {
      await caches.delete(this.cacheName);
    }
  }
}

// =====================================
// MODERN ANIMATION OPTIMIZATIONS
// =====================================

/**
 * Use reduced motion when user prefers it
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotion;
}

/**
 * GPU-accelerated animation hook
 */
export function useGPUAcceleration(ref: React.RefObject<HTMLElement>) {
  useEffect(() => {
    const element = ref.current;
    if (element) {
      // Force GPU acceleration
      element.style.transform = 'translateZ(0)';
      element.style.willChange = 'transform';
    }

    return () => {
      if (element) {
        element.style.transform = '';
        element.style.willChange = 'auto';
      }
    };
  }, [ref]);
}

// =====================================
// MODERN ERROR BOUNDARIES
// =====================================

/**
 * Error boundary hook for functional components
 */
export function useErrorBoundary() {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error) => {
    setError(error);
    
    // Report to analytics service in production
    if (import.meta.env.PROD) {
      console.error('Error captured by boundary:', error);
      // Add your error reporting service here
    }
  }, []);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      captureError(new Error(event.message));
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      captureError(new Error(event.reason));
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [captureError]);

  if (error) {
    throw error;
  }

  return { captureError, resetError };
}

// =====================================
// MODERN BUNDLE OPTIMIZATION
// =====================================

/**
 * Dynamic import with error handling
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await importFn();
  } catch (error) {
    console.warn('Dynamic import failed:', error);
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}

/**
 * Code splitting utilities
 */
export const lazyWithPreload = <T extends React.ComponentType<Record<string, unknown>>>(
  importFn: () => Promise<{ default: T }>
) => {
  const LazyComponent = React.lazy(importFn);
  
  // Add preload method
  (LazyComponent as React.LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> }).preload = importFn;
  
  return LazyComponent;
};

// =====================================
// EXPORTS
// =====================================

export default {
  useIntersectionObserver,
  useLazyImage,
  usePerformanceMetrics,
  useDeviceCapabilities,
  useReducedMotion,
  useGPUAcceleration,
  useErrorBoundary,
  preloadResource,
  prefetchResource,
  preloadImage,
  ModernCache,
  dynamicImport,
  lazyWithPreload,
};