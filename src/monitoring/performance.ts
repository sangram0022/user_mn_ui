/**
 * Performance Monitoring Module
 * Tracks Core Web Vitals and custom performance metrics
 */

import type { Metric } from 'web-vitals';
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

interface PerformanceMetricData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType?: string;
}

/**
 * Send metric to analytics endpoint
 */
async function sendToAnalytics(metric: PerformanceMetricData): Promise<void> {
  // Only send in production
  if (!import.meta.env.PROD) {
    if (import.meta.env.DEV) {
      console.warn('📊 Performance Metric:', metric);
    }
    return;
  }

  try {
    const body = JSON.stringify({
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Use sendBeacon if available, otherwise fall back to fetch
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/v1/metrics', body);
    } else {
      fetch('/api/v1/metrics', {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'application/json',
        },
        keepalive: true,
      }).catch(() => {
        // Silent fail - don't crash app if metrics fail
      });
    }
  } catch (error) {
    // Silent fail in production
    if (import.meta.env.DEV) {
      console.error('Failed to send performance metric:', error);
    }
  }
}

/**
 * Convert Web Vitals metric to our format
 */
function formatMetric(metric: Metric): PerformanceMetricData {
  return {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  };
}

/**
 * Initialize performance monitoring
 * Tracks all Core Web Vitals metrics
 */
export function initPerformanceMonitoring(): void {
  // Only track in production or when explicitly enabled
  const shouldTrack =
    import.meta.env.PROD || import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true';

  if (!shouldTrack) {
    console.warn('📊 Performance monitoring disabled in development');
    return;
  }

  console.warn('📊 Initializing performance monitoring...');

  // Track Cumulative Layout Shift (CLS)
  // Measures visual stability
  onCLS((metric) => {
    sendToAnalytics(formatMetric(metric));
  });

  // Track First Contentful Paint (FCP)
  // Measures when first content appears
  onFCP((metric) => {
    sendToAnalytics(formatMetric(metric));
  });

  // Track Interaction to Next Paint (INP)
  // Measures responsiveness
  onINP((metric) => {
    sendToAnalytics(formatMetric(metric));
  });

  // Track Largest Contentful Paint (LCP)
  // Measures loading performance
  onLCP((metric) => {
    sendToAnalytics(formatMetric(metric));
  });

  // Track Time to First Byte (TTFB)
  // Measures server response time
  onTTFB((metric) => {
    sendToAnalytics(formatMetric(metric));
  });

  // Track custom navigation timing
  if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
        const ttfb = timing.responseStart - timing.navigationStart;

        sendToAnalytics({
          name: 'page-load',
          value: loadTime,
          rating: loadTime < 3000 ? 'good' : loadTime < 5000 ? 'needs-improvement' : 'poor',
          delta: 0,
          id: 'page-load',
        });

        sendToAnalytics({
          name: 'dom-ready',
          value: domReady,
          rating: domReady < 2000 ? 'good' : domReady < 3500 ? 'needs-improvement' : 'poor',
          delta: 0,
          id: 'dom-ready',
        });

        sendToAnalytics({
          name: 'ttfb-custom',
          value: ttfb,
          rating: ttfb < 800 ? 'good' : ttfb < 1800 ? 'needs-improvement' : 'poor',
          delta: 0,
          id: 'ttfb-custom',
        });
      }, 0);
    });
  }
}

/**
 * Track a custom performance mark
 */
export function trackPerformanceMark(name: string): void {
  if (window.performance && window.performance.mark) {
    try {
      window.performance.mark(name);
    } catch {
      // Silent fail
    }
  }
}

/**
 * Measure time between two performance marks
 */
export function measurePerformance(
  name: string,
  startMark: string,
  endMark: string
): number | null {
  if (window.performance && window.performance.measure) {
    try {
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0];

      if (measure) {
        const duration = measure.duration;

        // Send to analytics
        sendToAnalytics({
          name: `custom-${name}`,
          value: duration,
          rating: duration < 100 ? 'good' : duration < 300 ? 'needs-improvement' : 'poor',
          delta: 0,
          id: name,
        });

        return duration;
      }
    } catch {
      // Silent fail
    }
  }

  return null;
}

/**
 * Get current performance metrics
 */
export function getCurrentMetrics(): {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  navigation?: PerformanceNavigationTiming;
} {
  const metrics: ReturnType<typeof getCurrentMetrics> = {};

  // Memory usage (Chrome only)
  if ('memory' in performance) {
    const memory = (
      performance as {
        memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
      }
    ).memory;
    metrics.memory = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
    };
  }

  // Navigation timing
  const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  if (navTiming) {
    metrics.navigation = navTiming;
  }

  return metrics;
}

/**
 * Log performance summary (development only)
 */
export function logPerformanceSummary(): void {
  if (!import.meta.env.DEV) return;

  const metrics = getCurrentMetrics();

  console.warn('📊 Performance Summary');

  if (metrics.memory) {
    const used = (metrics.memory.usedJSHeapSize / 1048576).toFixed(2);
    const total = (metrics.memory.totalJSHeapSize / 1048576).toFixed(2);
    const limit = (metrics.memory.jsHeapSizeLimit / 1048576).toFixed(2);
    console.warn(`Memory: ${used}MB / ${total}MB (Limit: ${limit}MB)`);
  }

  if (metrics.navigation) {
    const nav = metrics.navigation;
    console.warn(`DNS Lookup: ${(nav.domainLookupEnd - nav.domainLookupStart).toFixed(2)}ms`);
    console.warn(`TCP Connection: ${(nav.connectEnd - nav.connectStart).toFixed(2)}ms`);
    console.warn(`Request/Response: ${(nav.responseEnd - nav.requestStart).toFixed(2)}ms`);
    console.warn(`DOM Interactive: ${(nav.domInteractive - nav.fetchStart).toFixed(2)}ms`);
    console.warn(`Page Load: ${(nav.loadEventEnd - nav.loadEventStart).toFixed(2)}ms`);
  }
}
