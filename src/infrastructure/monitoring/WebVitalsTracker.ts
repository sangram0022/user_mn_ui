/**
 * Web Vitals tracker for Core Web Vitals metrics
 */

import { logger } from '@shared/utils/logger';
import { initPerformanceMonitoring } from '../../monitoring/performance';

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
  private initialized = false;

  initialize(): void {
    if (this.initialized) {
      return;
    }

    initPerformanceMonitoring();
    this.initialized = true;
    logger.info('[monitoring] web vitals tracker initialized');
  }

  getVital(_metric: WebVitalMetric): WebVital | undefined {
    return undefined;
  }

  getAllVitals(): Record<WebVitalMetric, WebVital | undefined> {
    return {
      CLS: undefined,
      FID: undefined,
      FCP: undefined,
      LCP: undefined,
      TTFB: undefined,
    };
  }

  getVitalsScore(): {
    overall: 'good' | 'needs-improvement' | 'poor';
    details: Partial<Record<WebVitalMetric, { value?: number; rating?: string }>>;
  } {
    return { overall: 'needs-improvement', details: {} };
  }

  clearVitals(): void {
    /* no-op */
  }

  destroy(): void {
    this.initialized = false;
  }
}

// Create singleton instance
export const webVitalsTracker = new WebVitalsTracker();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  webVitalsTracker.initialize();
}

export default webVitalsTracker;
