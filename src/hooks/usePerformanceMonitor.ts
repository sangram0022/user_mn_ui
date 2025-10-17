/**
 * Performance Monitoring Hook
 *
 * React 19 pattern for tracking component performance, render times,
 * and user interactions. Uses the React Profiler API for accurate metrics.
 *
 * @example
 * ```tsx
 * const { recordMetric, getMetrics, clearMetrics } = usePerformanceMonitor('UserManagement');
 *
 * // Record custom metrics
 * recordMetric('api-call', 245);
 * recordMetric('render-time', 16);
 *
 * // Get performance data
 * const metrics = getMetrics();
 * console.log(metrics);
 * ```
 */

import { useRef, useState } from 'react';

/**
 * Performance metric entry
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

/**
 * Aggregated performance statistics
 */
export interface PerformanceStats {
  count: number;
  total: number;
  average: number;
  min: number;
  max: number;
  p50: number; // Median
  p95: number;
  p99: number;
}

/**
 * Performance monitoring result
 */
export interface PerformanceMonitorResult {
  metrics: Map<string, PerformanceMetric[]>;
  stats: Map<string, PerformanceStats>;
  totalRecorded: number;
}

/**
 * Configuration options for performance monitoring
 */
export interface PerformanceMonitorOptions {
  /** Maximum number of metrics to store per type */
  maxMetrics?: number;
  /** Enable console logging of metrics */
  enableLogging?: boolean;
  /** Sample rate (0-1, where 1 = 100% of events) */
  sampleRate?: number;
}

const DEFAULT_OPTIONS: Required<PerformanceMonitorOptions> = {
  maxMetrics: 100,
  enableLogging: false,
  sampleRate: 1.0,
};

/**
 * Calculate percentile from sorted array
 */
function percentile(sortedArray: number[], p: number): number {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil((p / 100) * sortedArray.length) - 1;
  return sortedArray[Math.max(0, index)];
}

/**
 * Calculate statistics from metrics
 */
function calculateStats(metrics: PerformanceMetric[]): PerformanceStats {
  if (metrics.length === 0) {
    return {
      count: 0,
      total: 0,
      average: 0,
      min: 0,
      max: 0,
      p50: 0,
      p95: 0,
      p99: 0,
    };
  }

  const values = metrics.map((m) => m.value).sort((a, b) => a - b);
  const total = values.reduce((sum, val) => sum + val, 0);

  return {
    count: metrics.length,
    total,
    average: total / metrics.length,
    min: values[0],
    max: values[values.length - 1],
    p50: percentile(values, 50),
    p95: percentile(values, 95),
    p99: percentile(values, 99),
  };
}

/**
 * Performance monitoring hook
 *
 * Tracks component performance metrics and provides utilities for
 * recording, analyzing, and exporting performance data.
 */
export function usePerformanceMonitor(
  componentName: string,
  options: PerformanceMonitorOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const metricsRef = useRef<Map<string, PerformanceMetric[]>>(new Map());
  const [, forceUpdate] = useState(0);

  /**
   * Record a performance metric
   */
  const recordMetric = (name: string, value: number, metadata?: Record<string, unknown>) => {
    // Sample rate check
    if (Math.random() > config.sampleRate) {
      return;
    }

    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    const existingMetrics = metricsRef.current.get(name) || [];
    existingMetrics.push(metric);

    // Enforce max metrics limit
    if (existingMetrics.length > config.maxMetrics) {
      existingMetrics.shift();
    }

    metricsRef.current.set(name, existingMetrics);

    // Console logging
    if (config.enableLogging) {
      console.warn(`[Performance] ${componentName}.${name}:`, value, 'ms', metadata);
    }
  };

  /**
   * Get all metrics
   */
  const getMetrics = (): PerformanceMonitorResult => {
    const stats = new Map<string, PerformanceStats>();
    let totalRecorded = 0;

    metricsRef.current.forEach((metrics, name) => {
      stats.set(name, calculateStats(metrics));
      totalRecorded += metrics.length;
    });

    return {
      metrics: new Map(metricsRef.current),
      stats,
      totalRecorded,
    };
  };

  /**
   * Get stats for a specific metric
   */
  const getMetricStats = (name: string): PerformanceStats | null => {
    const metrics = metricsRef.current.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }
    return calculateStats(metrics);
  };

  /**
   * Clear all metrics
   */
  const clearMetrics = () => {
    metricsRef.current.clear();
    forceUpdate((n) => n + 1);
  };

  /**
   * Clear metrics for a specific name
   */
  const clearMetric = (name: string) => {
    metricsRef.current.delete(name);
    forceUpdate((n) => n + 1);
  };

  /**
   * Export metrics as JSON
   */
  const exportMetrics = (): string => {
    const result = getMetrics();
    return JSON.stringify(
      {
        component: componentName,
        timestamp: new Date().toISOString(),
        metrics: Array.from(result.metrics.entries()).map(([name, metrics]) => ({
          name,
          data: metrics,
        })),
        stats: Array.from(result.stats.entries()).map(([name, stats]) => ({
          name,
          stats,
        })),
        totalRecorded: result.totalRecorded,
      },
      null,
      2
    );
  };

  /**
   * Measure execution time of a function
   */
  const measure = async <T>(name: string, fn: () => T | Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      recordMetric(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      recordMetric(name, duration, { error: true });
      throw error;
    }
  };

  /**
   * Create a performance mark
   */
  const mark = (markName: string) => {
    const fullName = `${componentName}.${markName}`;
    if (performance.mark) {
      performance.mark(fullName);
    }
    return fullName;
  };

  /**
   * Measure between two marks
   */
  const measureBetween = (name: string, startMark: string, endMark: string) => {
    if (performance.measure && performance.getEntriesByName) {
      try {
        performance.measure(name, startMark, endMark);
        const entries = performance.getEntriesByName(name);
        if (entries.length > 0) {
          const duration = entries[entries.length - 1].duration;
          recordMetric(name, duration);
          return duration;
        }
      } catch (error) {
        console.warn('Failed to measure between marks:', error);
      }
    }
    return null;
  };

  return {
    recordMetric,
    getMetrics,
    getMetricStats,
    clearMetrics,
    clearMetric,
    exportMetrics,
    measure,
    mark,
    measureBetween,
  };
}

/**
 * React Profiler callback type
 */
export interface ProfilerData {
  id: string;
  phase: 'mount' | 'update';
  actualDuration: number;
  baseDuration: number;
  startTime: number;
  commitTime: number;
}

/**
 * Hook for React Profiler integration
 */
export function useProfiler(componentName: string) {
  const { recordMetric } = usePerformanceMonitor(componentName);

  const onRender = (
    _id: string,
    phase: 'mount' | 'update',
    actualDuration: number,
    baseDuration: number,
    startTime: number,
    commitTime: number
  ) => {
    recordMetric(`render-${phase}`, actualDuration, {
      baseDuration,
      startTime,
      commitTime,
    });
  };

  return { onRender };
}
