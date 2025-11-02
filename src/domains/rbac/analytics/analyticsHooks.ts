import { useCallback, useContext, createContext } from 'react';
import type { RbacMetrics, OperationMetric, RbacAnalyticsEvent } from './performanceMonitor';

export interface RbacAnalyticsContextValue {
  // Analytics Data
  metrics: RbacMetrics | null;
  isLoading: boolean;
  
  // Performance Data  
  operations: string[];
  slowestOperations: OperationMetric[];
  
  // Tracking Functions
  track: (event: Omit<RbacAnalyticsEvent, 'timestamp'>) => void;
  trackOperation: <T>(operation: string, userId: string, fn: () => Promise<T>) => Promise<T>;
  trackSync: <T>(operation: string, userId: string, fn: () => T) => T;
  getOperationStats: (operation: string) => {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
    recentTrend: 'improving' | 'stable' | 'degrading';
  };
  
  // Utility Functions
  clearAnalytics: () => void;
  exportMetrics: () => string;
}

// ============================================================================
// ANALYTICS CONTEXT
// ============================================================================

export const RbacAnalyticsContext = createContext<RbacAnalyticsContextValue | undefined>(undefined);

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

/**
 * Hook to access RBAC Analytics context
 * Must be used within RbacAnalyticsProvider
 */
export function useRbacAnalyticsContext(): RbacAnalyticsContextValue {
  const context = useContext(RbacAnalyticsContext);
  
  if (context === undefined) {
    throw new Error('useRbacAnalyticsContext must be used within a RbacAnalyticsProvider');
  }
  
  return context;
}

/**
 * Hook for tracking RBAC permission checks with analytics
 */
export function useAnalyticsTracker() {
  const { track, trackOperation, trackSync } = useRbacAnalyticsContext();

  // Track permission check
  const trackPermissionCheck = useCallback((
    userId: string,
    role: string,
    permission: string,
    result: boolean,
    duration?: number
  ) => {
    track({
      type: 'permission_check',
      userId,
      role,
      data: { permission, result },
      duration,
      success: true
    });
  }, [track]);

  // Track role access
  const trackRoleAccess = useCallback((
    userId: string,
    role: string,
    resource: string,
    granted: boolean
  ) => {
    track({
      type: 'role_access',
      userId,
      role,
      data: { resource, granted },
      success: granted
    });
  }, [track]);

  // Track navigation
  const trackNavigation = useCallback((
    userId: string,
    role: string,
    fromRoute: string,
    toRoute: string,
    duration?: number
  ) => {
    track({
      type: 'navigation',
      userId,
      role,
      data: { from: fromRoute, to: toRoute },
      duration,
      success: true
    });
  }, [track]);

  // Track cache operation
  const trackCacheOperation = useCallback((
    userId: string,
    role: string,
    operation: 'hit' | 'miss' | 'set' | 'clear',
    key: string
  ) => {
    track({
      type: 'cache_operation',
      userId,
      role,
      data: { operation, key, hit: operation === 'hit' },
      success: true
    });
  }, [track]);

  // Track error
  const trackError = useCallback((
    userId: string,
    role: string,
    error: string,
    context: string
  ) => {
    track({
      type: 'error',
      userId,
      role,
      data: { error, context },
      success: false
    });
  }, [track]);

  return {
    trackPermissionCheck,
    trackRoleAccess,
    trackNavigation,
    trackCacheOperation,
    trackError,
    trackOperation,
    trackSync
  };
}

/**
 * Hook for accessing performance metrics
 */
export function usePerformanceMetrics() {
  const { metrics, operations, slowestOperations, getOperationStats } = useRbacAnalyticsContext();

  // Get performance summary
  const getPerformanceSummary = useCallback(() => {
    if (!metrics) return null;

    return {
      // Response Time Metrics
      avgPermissionCheckTime: metrics.permissionCheckTime,
      avgResponseTime: metrics.averageResponseTime,
      
      // Cache Performance
      cacheHitRate: metrics.cacheHitRate,
      
      // System Health
      errorRate: metrics.errorRate,
      uptime: metrics.uptime,
      
      // Usage Stats
      totalChecks: metrics.totalPermissionChecks,
      uniqueUsers: metrics.uniqueUsers,
      
      // Top Issues
      slowestOperations: slowestOperations.slice(0, 5),
      mostUsedPermissions: metrics.mostUsedPermissions.slice(0, 5),
      leastUsedRoles: metrics.leastUsedRoles
    };
  }, [metrics, slowestOperations]);

  // Check if system is healthy
  const isSystemHealthy = useCallback(() => {
    if (!metrics) return true;

    const healthChecks = {
      responseTime: metrics.averageResponseTime < 100, // < 100ms
      cachePerformance: metrics.cacheHitRate > 80, // > 80% hit rate
      errorRate: metrics.errorRate < 5, // < 5% error rate
      memoryUsage: metrics.memoryUsage < 500 * 1024 * 1024 // < 500MB
    };

    return Object.values(healthChecks).every(check => check);
  }, [metrics]);

  // Get performance alerts
  const getPerformanceAlerts = useCallback(() => {
    if (!metrics) return [];

    const alerts: Array<{
      level: 'warning' | 'error' | 'critical';
      message: string;
      metric: string;
      value: number;
      threshold: number;
    }> = [];

    // Response time alerts
    if (metrics.averageResponseTime > 200) {
      alerts.push({
        level: metrics.averageResponseTime > 500 ? 'critical' : 'warning',
        message: 'High average response time detected',
        metric: 'averageResponseTime',
        value: metrics.averageResponseTime,
        threshold: 200
      });
    }

    // Cache performance alerts
    if (metrics.cacheHitRate < 70) {
      alerts.push({
        level: metrics.cacheHitRate < 50 ? 'error' : 'warning',
        message: 'Low cache hit rate detected',
        metric: 'cacheHitRate',
        value: metrics.cacheHitRate,
        threshold: 70
      });
    }

    // Error rate alerts
    if (metrics.errorRate > 3) {
      alerts.push({
        level: metrics.errorRate > 10 ? 'critical' : 'error',
        message: 'High error rate detected',
        metric: 'errorRate',
        value: metrics.errorRate,
        threshold: 3
      });
    }

    return alerts;
  }, [metrics]);

  return {
    performanceSummary: getPerformanceSummary(),
    isSystemHealthy: isSystemHealthy(),
    performanceAlerts: getPerformanceAlerts(),
    getOperationStats,
    operations,
    slowestOperations
  };
}

/**
 * Hook for usage analytics
 */
export function useUsageAnalytics() {
  const { metrics } = useRbacAnalyticsContext();

  // Get usage trends
  const getUsageTrends = useCallback(() => {
    if (!metrics) return null;

    return {
      // Permission Usage
      topPermissions: metrics.mostUsedPermissions.slice(0, 10),
      underutilizedRoles: metrics.leastUsedRoles,
      
      // User Activity
      activeUsers: metrics.uniqueUsers,
      totalInteractions: metrics.totalPermissionChecks,
      
      // Navigation Patterns
      popularRoutes: metrics.navigationPatterns
        .slice(0, 10)
        .map(pattern => ({
          route: `${pattern.fromRoute} → ${pattern.toRoute}`,
          count: pattern.count,
          avgTime: pattern.avgTime,
          role: pattern.role
        })),
        
      // Session Metrics
      avgSessionDuration: metrics.sessionDuration,
      bounceRate: metrics.bounceRate
    };
  }, [metrics]);

  // Get role utilization report
  const getRoleUtilization = useCallback(() => {
    if (!metrics) return [];

    return metrics.leastUsedRoles.map(role => ({
      role: role.role,
      utilization: role.utilization,
      activeUsers: role.activeUsers,
      permissionChecks: role.permissionChecks,
      status: role.utilization < 20 ? 'underutilized' : 
              role.utilization > 80 ? 'heavily_used' : 'normal'
    }));
  }, [metrics]);

  return {
    usageTrends: getUsageTrends(),
    roleUtilization: getRoleUtilization()
  };
}