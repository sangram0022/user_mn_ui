/**
 * Web Vitals tracker for Core Web Vitals metrics
 */

import { logger } from './logger';
import { performanceMonitor } from './PerformanceMonitor';

export interface WebVital {
  name: string;
  value: number;
  id: string;
  timestamp: Date;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  entries?: PerformanceEntry[];
}

export type WebVitalMetric = 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';

class WebVitalsTracker {
  private vitals: Map<WebVitalMetric, WebVital> = new Map();
  private observers: PerformanceObserver[] = [];
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized) {
      return;
    }

    this.setupVitalsTracking();
    this.isInitialized = true;
    logger.info('WebVitalsTracker initialized');
  }

  private setupVitalsTracking(): void {
    if (!('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not supported, Web Vitals tracking disabled');
      return;
    }

    try {
      this.trackLCP();
      this.trackFID();
      this.trackCLS();
      this.trackFCP();
      this.trackTTFB();
    } catch {
      logger.warn('Failed to setup Web Vitals tracking');
    }
  }

  private trackLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.recordVital('LCP', lastEntry.startTime, {
          entries: [lastEntry],
        });
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch {
      logger.warn('LCP tracking not supported');
    }
  }

  private trackFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'first-input') {
            const fidEntry = entry as PerformanceEntry & { processingStart?: number };
            const value = (fidEntry.processingStart || 0) - fidEntry.startTime;

            this.recordVital('FID', value, {
              entries: [entry],
            });
          }
        }
      });

      observer.observe({ entryTypes: ['first-input'], buffered: true });
      this.observers.push(observer);
    } catch {
      logger.warn('FID tracking not supported');
    }
  }

  private trackCLS(): void {
    let clsValue = 0;
    let sessionValue = 0;
    const sessionEntries: PerformanceEntry[] = [];

    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            const layoutShiftEntry = entry as PerformanceEntry & {
              hadRecentInput?: boolean;
              value?: number;
            };

            // Only count layout shifts without recent input
            if (!layoutShiftEntry.hadRecentInput) {
              sessionValue += layoutShiftEntry.value || 0;
              sessionEntries.push(entry);

              if (sessionValue > clsValue) {
                clsValue = sessionValue;
                this.recordVital('CLS', clsValue, {
                  entries: [...sessionEntries],
                });
              }
            }
          }
        }
      });

      observer.observe({ entryTypes: ['layout-shift'], buffered: true });
      this.observers.push(observer);
    } catch {
      logger.warn('CLS tracking not supported');
    }
  }

  private trackFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.recordVital('FCP', entry.startTime, {
              entries: [entry],
            });
          }
        }
      });

      observer.observe({ entryTypes: ['paint'], buffered: true });
      this.observers.push(observer);
    } catch {
      logger.warn('FCP tracking not supported');
    }
  }

  private trackTTFB(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navigationEntry = entry as PerformanceNavigationTiming;
            const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;

            this.recordVital('TTFB', ttfb, {
              entries: [entry],
            });
          }
        }
      });

      observer.observe({ entryTypes: ['navigation'], buffered: true });
      this.observers.push(observer);
    } catch {
      logger.warn('TTFB tracking not supported');
    }
  }

  private recordVital(
    name: WebVitalMetric,
    value: number,
    context?: { entries?: PerformanceEntry[] }
  ): void {
    const vital: WebVital = {
      name,
      value,
      id: this.generateVitalId(),
      timestamp: new Date(),
      rating: this.getRating(name, value),
      entries: context?.entries,
    };

    // Calculate delta if we have a previous value
    const previousVital = this.vitals.get(name);
    if (previousVital) {
      vital.delta = value - previousVital.value;
    }

    this.vitals.set(name, vital);

    // Log the vital
    logger.info(`Web Vital ${name}: ${value.toFixed(2)}ms (${vital.rating})`);

    // Record in performance monitor
    performanceMonitor.recordCustomMetric(`webvital.${name.toLowerCase()}`, value, 'ms', {
      rating: vital.rating,
      id: vital.id,
    });

    // Send to analytics if available
    this.sendVitalToAnalytics(vital);
  }

  private getRating(metric: WebVitalMetric, value: number): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      CLS: { good: 0.1, poor: 0.25 },
      FID: { good: 100, poor: 300 },
      FCP: { good: 1800, poor: 3000 },
      LCP: { good: 2500, poor: 4000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  }

  private sendVitalToAnalytics(vital: WebVital): void {
    try {
      // Send to Google Analytics if available
      const globalWindow = window as Window & { gtag?: (...args: unknown[]) => void };
      if (globalWindow.gtag) {
        globalWindow.gtag('event', vital.name, {
          event_category: 'Web Vitals',
          value: Math.round(vital.value),
          metric_id: vital.id,
          metric_rating: vital.rating,
        });
      }

      // Send to custom analytics
      this.sendToCustomAnalytics(vital);
    } catch {
      logger.warn('Failed to send Web Vital to analytics');
    }
  }

  private sendToCustomAnalytics(vital: WebVital): void {
    try {
      // Store for batch sending
      const webVitalsData = JSON.parse(localStorage.getItem('web_vitals') || '[]');
      webVitalsData.push({
        ...vital,
        timestamp: vital.timestamp.toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });

      // Keep only last 50 vitals
      if (webVitalsData.length > 50) {
        webVitalsData.splice(0, webVitalsData.length - 50);
      }

      localStorage.setItem('web_vitals', JSON.stringify(webVitalsData));
    } catch {
      logger.warn('Failed to store Web Vital data');
    }
  }

  private generateVitalId(): string {
    return 'vital_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Public API

  getVital(metric: WebVitalMetric): WebVital | undefined {
    return this.vitals.get(metric);
  }

  getAllVitals(): Record<WebVitalMetric, WebVital | undefined> {
    return {
      CLS: this.vitals.get('CLS'),
      FID: this.vitals.get('FID'),
      FCP: this.vitals.get('FCP'),
      LCP: this.vitals.get('LCP'),
      TTFB: this.vitals.get('TTFB'),
    };
  }

  getVitalsScore(): {
    overall: 'good' | 'needs-improvement' | 'poor';
    details: Partial<Record<WebVitalMetric, { value?: number; rating?: string }>>;
  } {
    const vitals = this.getAllVitals();
    const details: Partial<Record<WebVitalMetric, { value?: number; rating?: string }>> = {};
    let goodCount = 0;
    let totalCount = 0;

    Object.entries(vitals).forEach(([metric, vital]) => {
      const metricName = metric as WebVitalMetric;
      if (vital) {
        details[metricName] = {
          value: vital.value,
          rating: vital.rating,
        };

        totalCount++;
        if (vital.rating === 'good') {
          goodCount++;
        }
      } else {
        details[metricName] = {};
      }
    });

    let overall: 'good' | 'needs-improvement' | 'poor' = 'good';
    if (totalCount > 0) {
      const goodPercentage = goodCount / totalCount;
      if (goodPercentage < 0.5) {
        overall = 'poor';
      } else if (goodPercentage < 0.75) {
        overall = 'needs-improvement';
      }
    }

    return { overall, details };
  }

  clearVitals(): void {
    this.vitals.clear();
    localStorage.removeItem('web_vitals');
    logger.info('Web Vitals data cleared');
  }

  destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.vitals.clear();
  }
}

// Create singleton instance
export const webVitalsTracker = new WebVitalsTracker();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  webVitalsTracker.initialize();
}

export default webVitalsTracker;
