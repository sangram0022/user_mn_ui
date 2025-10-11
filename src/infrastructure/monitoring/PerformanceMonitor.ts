/**
 * Performance monitoring utility for tracking application performance metrics
 */

import { logger } from './logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface TimingMetric extends PerformanceMetric {
  startTime: number;
  endTime: number;
  duration: number;
}

export interface MemoryMetric extends PerformanceMetric {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export interface NetworkMetric extends PerformanceMetric {
  url: string;
  method: string;
  status: number;
  requestSize?: number;
  responseSize?: number;
  duration: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();
  private maxMetrics = 1000;
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  initialize(): void {
    this.setupPerformanceObservers();
    this.startMemoryMonitoring();
    logger.info('PerformanceMonitor initialized');
  }

  private setupPerformanceObservers(): void {
    if (!('PerformanceObserver' in window)) {
      logger.warn('PerformanceObserver not supported');
      return;
    }

    try {
      // Observe navigation timing
      const navigationObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordNavigationMetric(entry);
        }
      });
      navigationObserver.observe({ entryTypes: ['navigation'] });
      this.observers.push(navigationObserver);

      // Observe resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordResourceMetric(entry);
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
      this.observers.push(resourceObserver);

      // Observe paint timing
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordPaintMetric(entry);
        }
      });
      paintObserver.observe({ entryTypes: ['paint'] });
      this.observers.push(paintObserver);

      // Observe layout shifts
      const layoutShiftObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordLayoutShiftMetric(entry as any);
        }
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(layoutShiftObserver);
    } catch (error) {
      logger.warn('Failed to setup performance observers');
    }
  }

  private recordNavigationMetric(entry: PerformanceEntry): void {
    const navigationEntry = entry as PerformanceNavigationTiming;

    this.addMetric({
      name: 'navigation.domContentLoaded',
      value: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
      unit: 'ms',
      timestamp: new Date(),
      context: {
        type: 'navigation',
        navigationType: navigationEntry.type,
      },
    });

    this.addMetric({
      name: 'navigation.loadComplete',
      value: navigationEntry.loadEventEnd - navigationEntry.loadEventStart,
      unit: 'ms',
      timestamp: new Date(),
      context: {
        type: 'navigation',
        navigationType: navigationEntry.type,
      },
    });

    this.addMetric({
      name: 'navigation.totalTime',
      value: navigationEntry.loadEventEnd - navigationEntry.fetchStart,
      unit: 'ms',
      timestamp: new Date(),
      context: {
        type: 'navigation',
        navigationType: navigationEntry.type,
      },
    });
  }

  private recordResourceMetric(entry: PerformanceEntry): void {
    const resourceEntry = entry as PerformanceResourceTiming;

    this.addMetric({
      name: 'resource.loadTime',
      value: resourceEntry.responseEnd - resourceEntry.requestStart,
      unit: 'ms',
      timestamp: new Date(),
      context: {
        type: 'resource',
        name: resourceEntry.name,
        initiatorType: resourceEntry.initiatorType,
        transferSize: resourceEntry.transferSize,
      },
    });
  }

  private recordPaintMetric(entry: PerformanceEntry): void {
    this.addMetric({
      name: `paint.${entry.name}`,
      value: entry.startTime,
      unit: 'ms',
      timestamp: new Date(),
      context: {
        type: 'paint',
        entryType: entry.entryType,
      },
    });
  }

  private recordLayoutShiftMetric(entry: any): void {
    this.addMetric({
      name: 'layout.shift',
      value: entry.value,
      unit: 'score',
      timestamp: new Date(),
      context: {
        type: 'layout-shift',
        hadRecentInput: entry.hadRecentInput,
        sources: entry.sources?.length || 0,
      },
    });
  }

  private startMemoryMonitoring(): void {
    if (!('memory' in performance)) {
      logger.warn('Performance memory API not supported');
      return;
    }

    const recordMemoryMetrics = () => {
      const memoryInfo = (performance as any).memory;

      const memoryMetric: MemoryMetric = {
        name: 'memory.usage',
        value: memoryInfo.usedJSHeapSize,
        unit: 'bytes',
        timestamp: new Date(),
        usedJSHeapSize: memoryInfo.usedJSHeapSize,
        totalJSHeapSize: memoryInfo.totalJSHeapSize,
        jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
        context: {
          type: 'memory',
          usagePercentage: (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100,
        },
      };

      this.addMetric(memoryMetric);
    };

    // Record memory metrics every 30 seconds
    setInterval(recordMemoryMetrics, 30000);

    // Record initial memory metrics
    recordMemoryMetrics();
  }

  // Public API methods

  startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  endTimer(name: string, context?: Record<string, any>): number | null {
    const startTime = this.timers.get(name);
    if (!startTime) {
      logger.warn(`Timer '${name}' not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.timers.delete(name);

    const timingMetric: TimingMetric = {
      name: `timer.${name}`,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      startTime,
      endTime,
      duration,
      context: {
        type: 'timer',
        ...context,
      },
    };

    this.addMetric(timingMetric);
    return duration;
  }

  recordCustomMetric(
    name: string,
    value: number,
    unit: string = 'count',
    context?: Record<string, any>
  ): void {
    this.addMetric({
      name: `custom.${name}`,
      value,
      unit,
      timestamp: new Date(),
      context: {
        type: 'custom',
        ...context,
      },
    });
  }

  recordNetworkMetric(
    url: string,
    method: string,
    status: number,
    duration: number,
    requestSize?: number,
    responseSize?: number
  ): void {
    const networkMetric: NetworkMetric = {
      name: 'network.request',
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      url,
      method,
      status,
      requestSize,
      responseSize,
      duration,
      context: {
        type: 'network',
        endpoint: new URL(url).pathname,
        statusClass: Math.floor(status / 100) * 100,
      },
    };

    this.addMetric(networkMetric);
  }

  private addMetric(metric: PerformanceMetric): void {
    this.metrics.unshift(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(0, this.maxMetrics);
    }

    // Log slow operations
    if (metric.name.includes('timer') && metric.value > 1000) {
      logger.warn(`Slow operation detected: ${metric.name} took ${metric.value}ms`);
    }
  }

  getMetrics(filter?: {
    name?: string;
    type?: string;
    since?: Date;
    limit?: number;
  }): PerformanceMetric[] {
    let filteredMetrics = [...this.metrics];

    if (filter) {
      if (filter.name) {
        filteredMetrics = filteredMetrics.filter((metric) => metric.name.includes(filter.name!));
      }

      if (filter.type) {
        filteredMetrics = filteredMetrics.filter((metric) => metric.context?.type === filter.type);
      }

      if (filter.since) {
        filteredMetrics = filteredMetrics.filter((metric) => metric.timestamp >= filter.since!);
      }

      if (filter.limit) {
        filteredMetrics = filteredMetrics.slice(0, filter.limit);
      }
    }

    return filteredMetrics;
  }

  getPerformanceStats(): {
    totalMetrics: number;
    avgLoadTime: number;
    avgNetworkTime: number;
    memoryUsage: number;
    layoutShifts: number;
  } {
    const stats = {
      totalMetrics: this.metrics.length,
      avgLoadTime: 0,
      avgNetworkTime: 0,
      memoryUsage: 0,
      layoutShifts: 0,
    };

    const loadTimeMetrics = this.metrics.filter((m) => m.name.includes('navigation.totalTime'));
    if (loadTimeMetrics.length > 0) {
      stats.avgLoadTime =
        loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length;
    }

    const networkMetrics = this.metrics.filter((m) => m.name.includes('network.request'));
    if (networkMetrics.length > 0) {
      stats.avgNetworkTime =
        networkMetrics.reduce((sum, m) => sum + m.value, 0) / networkMetrics.length;
    }

    const memoryMetrics = this.metrics.filter((m) => m.name.includes('memory.usage'));
    if (memoryMetrics.length > 0) {
      stats.memoryUsage = memoryMetrics[0].value; // Most recent
    }

    const layoutShiftMetrics = this.metrics.filter((m) => m.name.includes('layout.shift'));
    stats.layoutShifts = layoutShiftMetrics.reduce((sum, m) => sum + m.value, 0);

    return stats;
  }

  clearMetrics(): void {
    this.metrics = [];
    logger.info('Performance metrics cleared');
  }

  destroy(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers = [];
    this.timers.clear();
    this.clearMetrics();
  }
}

// Create singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Auto-initialize in browser environment
if (typeof window !== 'undefined') {
  performanceMonitor.initialize();
}

export default performanceMonitor;
