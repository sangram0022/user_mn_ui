// ============================================================================
// RBAC ANALYTICS MODULE EXPORTS
// ============================================================================

// Core Analytics
export {
  rbacPerformanceMonitor,
  rbacAnalyticsCollector,
  useRbacAnalytics,
  useRbacPerformance
} from './performanceMonitor';

import {
  rbacPerformanceMonitor,
  rbacAnalyticsCollector
} from './performanceMonitor';

export type {
  RbacMetrics,
  OperationMetric,
  PermissionUsage,
  RoleUsage,
  NavigationPattern,
  RbacAnalyticsEvent
} from './performanceMonitor';

// Analytics Context & Hooks
export { RbacAnalyticsProvider } from './analyticsContext';

export {
  RbacAnalyticsContext,
  useRbacAnalyticsContext,
  useAnalyticsTracker,
  usePerformanceMetrics,
  useUsageAnalytics
} from './analyticsHooks';

export type { RbacAnalyticsContextValue } from './analyticsHooks';

// Analytics Components
export {
  RbacAnalyticsDashboard,
  RbacAnalyticsWidget
} from './RbacAnalytics';

export { MetricsVisualization } from './MetricsVisualization';

// ============================================================================
// QUICK ACCESS UTILITIES
// ============================================================================

/**
 * Quick setup for RBAC Analytics in your app
 */
export const setupRbacAnalytics = () => {
  console.log('🚀 RBAC Analytics initialized');
  console.log('📊 Performance monitoring active');
  console.log('🔍 Real-time metrics collection started');
  
  return {
    performanceMonitor: rbacPerformanceMonitor,
    analyticsCollector: rbacAnalyticsCollector,
    status: 'active'
  };
};

/**
 * Get current analytics summary
 */
export const getAnalyticsSummary = () => {
  const metrics = rbacAnalyticsCollector.calculateMetrics();
  const operations = rbacPerformanceMonitor.getAllOperations();
  
  return {
    timestamp: new Date().toISOString(),
    totalPermissionChecks: metrics.totalPermissionChecks,
    averageResponseTime: metrics.averageResponseTime,
    cacheHitRate: metrics.cacheHitRate,
    uniqueUsers: metrics.uniqueUsers,
    errorRate: metrics.errorRate,
    trackedOperations: operations.length,
    systemHealth: {
      responseTime: metrics.averageResponseTime < 100 ? 'excellent' : 
                   metrics.averageResponseTime < 200 ? 'good' : 'poor',
      cachePerformance: metrics.cacheHitRate > 80 ? 'excellent' : 
                       metrics.cacheHitRate > 60 ? 'good' : 'poor',
      errorRate: metrics.errorRate < 1 ? 'excellent' : 
                metrics.errorRate < 5 ? 'acceptable' : 'poor'
    }
  };
};