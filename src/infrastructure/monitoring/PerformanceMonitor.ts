/**
 * Lightweight performance monitor used by legacy infrastructure hooks.
 * Delegates all persistence to in-memory buffers and logs outliers via the shared logger.
 */

import { logger } from '@shared/utils/logger';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit?: string;
  timestamp?: number;
  context?: Record<string, unknown>;
}

type MetricFilter = {
  name?: string;
  type?: string;
  since?: number;
  limit?: number;
};

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly timers = new Map<string, number>();
  private readonly maxMetrics = 500;

  private get now(): number {
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      return performance.now();
    }
    return Date.now();
  }

  startTimer(name: string): void {
    this.timers.set(name, this.now);
  }

  endTimer(name: string, context?: Record<string, unknown>): number | null {
    const start = this.timers.get(name);
    if (start === undefined) {
      logger.warn('[performance] missing timer start', { name });
      return null;
    }

    const duration = this.now - start;
    this.timers.delete(name);

    this.recordMetric({
      name: `timer.${name}`,
      value: duration,
      unit: 'ms',
      context: { type: 'timer', ...context },
    });

    return duration;
  }

  recordCustomMetric(
    name: string,
    value: number,
    unit: string = 'count',
    context?: Record<string, unknown>
  ): void {
    this.recordMetric({
      name: `custom.${name}`,
      value,
      unit,
      context: { type: 'custom', ...context },
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
    this.recordMetric({
      name: 'network.request',
      value: duration,
      unit: 'ms',
      context: {
        type: 'network',
        url,
        method,
        status,
        requestSize,
        responseSize,
      },
    });

    if (duration > 1000) {
      logger.warn('[performance] slow network request', {
        url,
        method,
        status,
        duration,
      });
    }
  }

  getMetrics(filter?: MetricFilter): PerformanceMetric[] {
    if (!filter) {
      return [...this.metrics];
    }

    return this.metrics
      .filter((metric) => {
        if (filter.name && !metric.name.includes(filter.name)) {
          return false;
        }
        if (filter.type && metric.context?.type !== filter.type) {
          return false;
        }
        if (filter.since !== undefined && (metric.timestamp ?? 0) < filter.since) {
          return false;
        }
        return true;
      })
      .slice(0, filter.limit ?? this.metrics.length);
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  destroy(): void {
    this.clearMetrics();
    this.timers.clear();
  }

  private recordMetric(metric: PerformanceMetric): void {
    const entry: PerformanceMetric = {
      ...metric,
      timestamp: metric.timestamp ?? Date.now(),
    };

    this.metrics.unshift(entry);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.length = this.maxMetrics;
    }

    if (entry.name.startsWith('timer.') && entry.value > 1500) {
      logger.warn('[performance] slow timer detected', {
        name: entry.name,
        duration: entry.value,
        context: entry.context,
      });
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;
