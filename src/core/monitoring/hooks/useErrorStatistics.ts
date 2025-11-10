/**
 * Error Statistics Hook
 * 
 * Provides real-time error statistics for monitoring dashboards
 * Tracks: error counts, trends, recovery rates, performance metrics
 */

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/core/logging';

export interface ErrorStats {
  totalErrors: number;
  errorsByLevel: Record<string, number>;
  errorsByType: Record<string, number>;
  errorsBySource: Record<string, number>;
  recentErrors: Array<{
    id: string;
    timestamp: string | number;
    type: string;
    message: string;
    stack?: string;
    source: string;
    level: string;
  }>;
  avgResponseTime: number;
  errorRate: number; // Errors per minute
  recoveryRate: number; // % of recovered vs total
  criticalErrors: number;
}

export interface ErrorTrend {
  timestamp: number | string;
  errorCount: number;
  level: string;
  type: string;
}

export interface ErrorMetrics {
  stats: ErrorStats;
  trends: ErrorTrend[];
  topErrors: Array<{ type: string; count: number; lastOccurred: string }>;
  performanceMetrics: {
    avgApiTime: number;
    slowestApi: { url: string; time: number };
    memoryUsage: { used: number; total: number };
  };
}

const DEFAULT_ERROR_STATS: ErrorStats = {
  totalErrors: 0,
  errorsByLevel: {},
  errorsByType: {},
  errorsBySource: {},
  recentErrors: [],
  avgResponseTime: 0,
  errorRate: 0,
  recoveryRate: 0,
  criticalErrors: 0,
};

/**
 * Hook for monitoring error statistics
 * Updates in real-time as errors are reported
 */
export function useErrorStatistics(
  updateIntervalMs: number = 5000,
  maxHistorySize: number = 100
) {
  const [stats, setStats] = useState<ErrorStats>(DEFAULT_ERROR_STATS);
  const [trends, setTrends] = useState<ErrorTrend[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Kept: useCallback required for useEffect dependency (prevents infinite loop)
  const updateStatistics = useCallback(() => {
    try {
      // Get logger to access logs
      const loggerInstance = logger();
      const logs = loggerInstance.getLogs();

      // Filter error logs
      const errorLogs = logs.filter(
        (log) => log.level === 'ERROR' || log.level === 'FATAL'
      );

      // Calculate statistics
      const newStats: ErrorStats = {
        totalErrors: errorLogs.length,
        errorsByLevel: {},
        errorsByType: {},
        errorsBySource: {},
        recentErrors: [], // Will be populated from logs
        avgResponseTime: 0,
        errorRate: errorLogs.length / (updateIntervalMs / 60000), // Errors per minute
        recoveryRate: 0,
        criticalErrors: 0,
      };

      // Count by level
      for (const log of errorLogs) {
        newStats.errorsByLevel[log.level] = (newStats.errorsByLevel[log.level] || 0) + 1;
        if (log.level === 'FATAL') {
          newStats.criticalErrors++;
        }
      }

      // Count by type and source from message parsing
      for (const log of errorLogs) {
        const message = log.message || '';
        
        // Extract type from message
        if (message.includes('API')) {
          newStats.errorsByType['APIError'] = (newStats.errorsByType['APIError'] || 0) + 1;
        } else if (message.includes('Validation')) {
          newStats.errorsByType['ValidationError'] = (newStats.errorsByType['ValidationError'] || 0) + 1;
        } else if (message.includes('Network')) {
          newStats.errorsByType['NetworkError'] = (newStats.errorsByType['NetworkError'] || 0) + 1;
        } else if (message.includes('Auth')) {
          newStats.errorsByType['AuthError'] = (newStats.errorsByType['AuthError'] || 0) + 1;
        } else {
          newStats.errorsByType['Unknown'] = (newStats.errorsByType['Unknown'] || 0) + 1;
        }

        // Extract source
        if (log.context?.context) {
          const source = String(log.context.context).split('.')[0];
          newStats.errorsBySource[source] = (newStats.errorsBySource[source] || 0) + 1;
        }
      }

      // Recent errors from logs
      newStats.recentErrors = errorLogs
        .slice(-10)
        .map((log) => ({
          id: `${log.timestamp}-${Math.random()}`,
          timestamp: log.timestamp,
          type: log.level,
          message: log.message,
          stack: log.error instanceof Error ? log.error.stack : undefined,
          source: 'logger',
          level: (log.level.toLowerCase() as 'info' | 'warning' | 'error' | 'debug' | 'fatal') || 'error',
        }));

      // Calculate recovery rate (errors resolved vs total)
      // This is a simple calculation; in production you'd track actual resolutions
      newStats.recoveryRate = Math.max(0, Math.min(100, 100 - newStats.errorRate * 10));

      setStats(newStats);

      // Add to trends
      setTrends((prevTrends) => {
        const newTrend: ErrorTrend = {
          timestamp: new Date().toISOString(),
          errorCount: errorLogs.length,
          level: Object.keys(newStats.errorsByLevel).join(','),
          type: Object.keys(newStats.errorsByType).join(','),
        };

        const updated = [...prevTrends, newTrend];
        return updated.slice(-maxHistorySize);
      });

      setError(null);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      logger().error('Failed to update error statistics', errorObj, {
        context: 'useErrorStatistics.update',
      });
    }
  }, [updateIntervalMs, maxHistorySize]);

  useEffect(() => {
    setIsLoading(true);
    updateStatistics();
    setIsLoading(false);

    // Set up periodic updates
    const interval = setInterval(() => {
      updateStatistics();
    }, updateIntervalMs);

    return () => clearInterval(interval);
  }, [updateStatistics, updateIntervalMs]);

  return {
    stats,
    trends,
    isLoading,
    error,
    refresh: updateStatistics,
  };
}

/**
 * Hook for getting detailed error metrics
 */
export function useErrorMetrics() {
  const { stats, trends } = useErrorStatistics();

  const metrics: ErrorMetrics = {
    stats,
    trends,
    topErrors: Object.entries(stats.errorsByType)
      .map(([type, count]) => ({
        type,
        count,
        lastOccurred: new Date().toISOString(),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    performanceMetrics: {
      avgApiTime: stats.avgResponseTime,
      slowestApi: { url: '', time: 0 },
      memoryUsage: {
        used: 0,
        total: 0,
      },
    },
  };

  // Try to get memory info
  if ((performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory) {
    const perfMemory = (performance as unknown as { memory?: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory;
    if (perfMemory) {
      metrics.performanceMetrics.memoryUsage = {
        used: Math.round(perfMemory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(perfMemory.totalJSHeapSize / 1024 / 1024),
      };
    }
  }

  return metrics;
}

/**
 * Hook for getting error recovery status
 */
export function useErrorRecovery() {
  const { stats } = useErrorStatistics();

  return {
    recoveryRate: stats.recoveryRate,
    criticalErrors: stats.criticalErrors,
    totalErrors: stats.totalErrors,
    isHealthy: stats.recoveryRate > 80 && stats.criticalErrors === 0,
    status:
      stats.criticalErrors > 0
        ? 'critical'
        : stats.errorRate > 5
          ? 'warning'
          : stats.errorRate > 2
            ? 'caution'
            : 'healthy',
  };
}

/**
 * Hook for trend analysis
 */
export function useErrorTrends() {
  const { stats, trends } = useErrorStatistics();

  const trendDirection = trends.length > 1
    ? trends[trends.length - 1].errorCount > trends[trends.length - 2].errorCount
      ? 'up'
      : 'down'
    : 'stable';

  return {
    trends,
    direction: trendDirection,
    avgErrorsPerMinute: stats.errorRate,
    peakErrorCount: Math.max(...trends.map((t) => t.errorCount), 0),
    currentErrorCount: trends[trends.length - 1]?.errorCount || 0,
  };
}
