/**
 * Advanced Performance Monitoring and Web Vitals
 * Enterprise-grade performance tracking by 20-year React expert
 */

// ==================== WEB VITALS MONITORING ====================

export interface WebVitalsMetrics {
  // Core Web Vitals
  LCP: number | null; // Largest Contentful Paint
  FID: number | null; // First Input Delay
  CLS: number | null; // Cumulative Layout Shift

  // Additional metrics
  FCP: number | null; // First Contentful Paint
  TTFB: number | null; // Time to First Byte
  INP: number | null; // Interaction to Next Paint

  // Custom metrics
  loadTime: number | null;
  renderTime: number | null;
  interactiveTime: number | null;
}

export interface PerformanceBudget {
  LCP: number; // Target: < 2.5s
  FID: number; // Target: < 100ms
  CLS: number; // Target: < 0.1
  FCP: number; // Target: < 1.8s
  TTFB: number; // Target: < 600ms
  bundleSize: number; // Target: < 500KB
  renderTime: number; // Target: < 16ms
}

export const defaultPerformanceBudget: PerformanceBudget = {
  LCP: 2500,
  FID: 100,
  CLS: 0.1,
  FCP: 1800,
  TTFB: 600,
  bundleSize: 500 * 1024, // 500KB
  renderTime: 16,
};

export class WebVitalsMonitor {
  private static instance: WebVitalsMonitor;
  private metrics: WebVitalsMetrics = {
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
    INP: null,
    loadTime: null,
    renderTime: null,
    interactiveTime: null,
  };
  private budget: PerformanceBudget;
  private observers: PerformanceObserver[] = [];
  private callbacks: Array<(metrics: WebVitalsMetrics) => void> = [];

  private constructor(budget: PerformanceBudget = defaultPerformanceBudget) {
    this.budget = budget;
  }

  public static getInstance(budget?: PerformanceBudget): WebVitalsMonitor {
    if (!WebVitalsMonitor.instance) {
      WebVitalsMonitor.instance = new WebVitalsMonitor(budget);
    }
    return WebVitalsMonitor.instance;
  }

  /**
   * Initialize Web Vitals monitoring
   */
  public initialize(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not supported');
      return;
    }

    this.measureLCP();
    this.measureFID();
    this.measureCLS();
    this.measureFCP();
    this.measureTTFB();
    this.measureINP();
    this.measureCustomMetrics();

    logger.info('📊 Web Vitals monitoring initialized');
  }

  /**
   * Measure Largest Contentful Paint (LCP)
   */
  private measureLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };

        this.metrics.LCP = lastEntry.startTime;
        this.checkBudget('LCP', lastEntry.startTime);
        this.notifyCallbacks();
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch {
      logger.warn('Failed to measure LCP:', { error });
    }
  }

  /**
   * Measure First Input Delay (FID)
   */
  private measureFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry) => {
          const eventEntry = entry as PerformanceEntry & { processingStart: number };
          const fid = eventEntry.processingStart - eventEntry.startTime;
          this.metrics.FID = fid;
          this.checkBudget('FID', fid);
          this.notifyCallbacks();
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch {
      logger.warn('Failed to measure FID:', { error });
    }
  }

  /**
   * Measure Cumulative Layout Shift (CLS)
   */
  private measureCLS(): void {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry) => {
          const layoutEntry = entry as PerformanceEntry & {
            hadRecentInput: boolean;
            value: number;
          };
          if (!layoutEntry.hadRecentInput) {
            clsValue += layoutEntry.value;
          }
        });

        this.metrics.CLS = clsValue;
        this.checkBudget('CLS', clsValue);
        this.notifyCallbacks();
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch {
      logger.warn('Failed to measure CLS:', { error });
    }
  }

  /**
   * Measure First Contentful Paint (FCP)
   */
  private measureFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.metrics.FCP = entry.startTime;
            this.checkBudget('FCP', entry.startTime);
            this.notifyCallbacks();
          }
        });
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch {
      logger.warn('Failed to measure FCP:', { error });
    }
  }

  /**
   * Measure Time to First Byte (TTFB)
   */
  private measureTTFB(): void {
    try {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        this.metrics.TTFB = ttfb;
        this.checkBudget('TTFB', ttfb);
        this.notifyCallbacks();
      }
    } catch {
      logger.warn('Failed to measure TTFB:', { error });
    }
  }

  /**
   * Measure Interaction to Next Paint (INP)
   */
  private measureINP(): void {
    try {
      let maxINP = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: PerformanceEntry) => {
          const interactionEntry = entry as PerformanceEntry & { processingEnd: number };
          const inp = interactionEntry.processingEnd - interactionEntry.startTime;
          if (inp > maxINP) {
            maxINP = inp;
            this.metrics.INP = inp;
            this.notifyCallbacks();
          }
        });
      });

      observer.observe({ entryTypes: ['event'] });
      this.observers.push(observer);
    } catch {
      logger.warn('Failed to measure INP:', { error });
    }
  }

  /**
   * Measure custom performance metrics
   */
  private measureCustomMetrics(): void {
    // Measure total load time
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics.loadTime = navigation.loadEventEnd - navigation.fetchStart;
        this.notifyCallbacks();
      }
    });

    // Measure render time
    this.measureRenderTime();

    // Measure time to interactive
    this.measureTimeToInteractive();
  }

  /**
   * Measure render time using React DevTools profiler
   */
  private measureRenderTime(): void {
    let renderStart = performance.now();

    const measureRender = () => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;

      if (renderTime > this.budget.renderTime) {
        this.metrics.renderTime = renderTime;
        this.checkBudget('renderTime', renderTime);
        this.notifyCallbacks();
      }

      renderStart = performance.now();
    };

    // Use requestAnimationFrame to measure render time
    const scheduleRenderMeasurement = () => {
      requestAnimationFrame(measureRender);
      requestAnimationFrame(scheduleRenderMeasurement);
    };

    scheduleRenderMeasurement();
  }

  /**
   * Measure time to interactive
   */
  private measureTimeToInteractive(): void {
    let interactiveTime: number | null = null;
    let longTasksEnd = 0;

    // Track long tasks
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            longTasksEnd = Math.max(longTasksEnd, entry.startTime + entry.duration);
          });
        });

        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch {
        logger.warn('Long task monitoring not supported');
      }
    }

    // Check if page is interactive
    const checkInteractive = () => {
      const now = performance.now();
      if (now - longTasksEnd > 5000 && !interactiveTime) {
        // 5 seconds without long tasks
        interactiveTime = now;
        this.metrics.interactiveTime = interactiveTime;
        this.notifyCallbacks();
      } else {
        setTimeout(checkInteractive, 1000);
      }
    };

    // Start checking after DOM is loaded
    if (document.readyState === 'complete') {
      checkInteractive();
    } else {
      window.addEventListener('load', checkInteractive);
    }
  }

  /**
   * Check if metric exceeds performance budget
   */
  private checkBudget(metric: keyof PerformanceBudget, value: number): void {
    const threshold = this.budget[metric];
    if (value > threshold) {
      logger.warn(`⚠️ Performance budget exceeded for ${metric}: ${value}ms > ${threshold}ms`);

      // Report to monitoring service
      if (process.env.NODE_ENV === 'production') {
        this.reportPerformanceIssue(metric, value, threshold);
      }
    }
  }

  /**
   * Report performance issue to monitoring service
   */
  private async reportPerformanceIssue(
    metric: string,
    value: number,
    threshold: number
  ): Promise<void> {
    try {
      const endpoint = process.env.REACT_APP_PERFORMANCE_MONITORING_ENDPOINT;
      if (!endpoint) return;

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'performance_budget_exceeded',
          metric,
          value,
          threshold,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
          ...this.getDeviceInfo(),
        }),
      });
    } catch {
      logger.error('Failed to report performance issue:', undefined, { error });
    }
  }

  /**
   * Get device and connection information
   */
  private getDeviceInfo(): Record<string, unknown> {
    const info: Record<string, unknown> = {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      screen: { width: screen.width, height: screen.height },
      devicePixelRatio: window.devicePixelRatio,
    };

    // Add connection info if available
    if ('connection' in navigator) {
      const connection = (navigator as Navigator & { connection: Record<string, unknown> })
        .connection;
      info.connection = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
    }

    // Add memory info if available
    if ('memory' in performance) {
      const memory = (
        performance as Performance & {
          memory: { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number };
        }
      ).memory;
      info.memory = {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }

    return info;
  }

  /**
   * Subscribe to metric updates
   */
  public subscribe(callback: (metrics: WebVitalsMetrics) => void): () => void {
    this.callbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Notify all callbacks
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach((callback) => {
      try {
        callback({ ...this.metrics });
      } catch {
        logger.error('Error in performance callback:', undefined, { error });
      }
    });
  }

  /**
   * Get current metrics
   */
  public getMetrics(): WebVitalsMetrics {
    return { ...this.metrics };
  }

  /**
   * Get performance score (0-100)
   */
  public getPerformanceScore(): number {
    const { LCP, FID, CLS, FCP } = this.metrics;
    let score = 100;

    // Deduct points based on Core Web Vitals
    if (LCP && LCP > this.budget.LCP) {
      score -= Math.min(30, (LCP - this.budget.LCP) / 100);
    }

    if (FID && FID > this.budget.FID) {
      score -= Math.min(25, (FID - this.budget.FID) / 10);
    }

    if (CLS && CLS > this.budget.CLS) {
      score -= Math.min(25, (CLS - this.budget.CLS) * 100);
    }

    if (FCP && FCP > this.budget.FCP) {
      score -= Math.min(20, (FCP - this.budget.FCP) / 100);
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Clean up observers
   */
  public dispose(): void {
    this.observers.forEach((observer) => {
      try {
        observer.disconnect();
      } catch {
        logger.warn('Error disconnecting observer:', { error });
      }
    });
    this.observers = [];
    this.callbacks = [];
  }
}

// ==================== BUNDLE ANALYSIS ====================

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: Array<{
    name: string;
    size: number;
    modules: string[];
  }>;
  duplicates: string[];
  recommendations: string[];
}

export class BundleAnalyzer {
  /**
   * Analyze current bundle size
   */
  public static async analyzeBundleSize(): Promise<BundleAnalysis> {
    const analysis: BundleAnalysis = {
      totalSize: 0,
      gzippedSize: 0,
      chunks: [],
      duplicates: [],
      recommendations: [],
    };

    try {
      // Get resource timing data
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

      resources.forEach((resource) => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          analysis.totalSize += resource.transferSize || 0;
          analysis.gzippedSize += resource.encodedBodySize || 0;
        }
      });

      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);
    } catch {
      logger.error('Failed to analyze bundle:', undefined, { error });
    }

    return analysis;
  }

  /**
   * Generate optimization recommendations
   */
  private static generateRecommendations(analysis: BundleAnalysis): string[] {
    const recommendations: string[] = [];

    if (analysis.totalSize > 500 * 1024) {
      // 500KB threshold
      recommendations.push('Bundle size is large. Consider code splitting and lazy loading.');
    }

    if (analysis.gzippedSize > 150 * 1024) {
      // 150KB threshold
      recommendations.push('Gzipped size is large. Review dependencies and remove unused code.');
    }

    if (analysis.duplicates.length > 0) {
      recommendations.push('Duplicate modules detected. Consider bundle optimization.');
    }

    return recommendations;
  }

  /**
   * Monitor bundle size in real-time
   */
  public static monitorBundleSize(threshold: number = 500 * 1024): void {
    const checkBundleSize = async () => {
      const analysis = await this.analyzeBundleSize();

      if (analysis.totalSize > threshold) {
        logger.warn(
          `📦 Bundle size warning: ${(analysis.totalSize / 1024).toFixed(2)}KB > ${(threshold / 1024).toFixed(2)}KB`
        );

        // Report to monitoring service
        if (process.env.NODE_ENV === 'production') {
          await this.reportBundleSize(analysis);
        }
      }
    };

    // Check bundle size periodically
    setInterval(checkBundleSize, 60000); // Every minute

    // Check on page load
    if (document.readyState === 'complete') {
      checkBundleSize();
    } else {
      window.addEventListener('load', checkBundleSize);
    }
  }

  /**
   * Report bundle size to monitoring service
   */
  private static async reportBundleSize(analysis: BundleAnalysis): Promise<void> {
    try {
      const endpoint = process.env.REACT_APP_PERFORMANCE_MONITORING_ENDPOINT;
      if (!endpoint) return;

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'bundle_analysis',
          ...analysis,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {
      logger.error('Failed to report bundle size:', undefined, { error });
    }
  }
}

// ==================== PERFORMANCE HOOKS ====================

export function useWebVitals(budget?: PerformanceBudget) {
  const [metrics, setMetrics] = useState<WebVitalsMetrics>({
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
    INP: null,
    loadTime: null,
    renderTime: null,
    interactiveTime: null,
  });

  useEffect(() => {
    const monitor = WebVitalsMonitor.getInstance(budget);
    monitor.initialize();

    const unsubscribe = monitor.subscribe(setMetrics);

    return () => {
      unsubscribe();
    };
  }, [budget]);

  return metrics;
}

export function usePerformanceScore(budget?: PerformanceBudget) {
  const [score, setScore] = useState(100);

  useEffect(() => {
    const monitor = WebVitalsMonitor.getInstance(budget);

    const unsubscribe = monitor.subscribe(() => {
      setScore(monitor.getPerformanceScore());
    });

    return unsubscribe;
  }, [budget]);

  return score;
}

export function useBundleAnalysis() {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null);

  useEffect(() => {
    BundleAnalyzer.analyzeBundleSize().then(setAnalysis);
  }, []);

  return analysis;
}

// ==================== EXPORTS ====================

export const performanceMonitoring = {
  WebVitalsMonitor,
  BundleAnalyzer,
  useWebVitals,
  usePerformanceScore,
  useBundleAnalysis,
  defaultPerformanceBudget,
};

export default performanceMonitoring;

// React import for hooks
import { logger } from './../utils/logger';
import { useState, useEffect } from 'react';
