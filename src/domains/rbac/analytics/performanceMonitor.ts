import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// RBAC ANALYTICS TYPES
// ============================================================================

export interface RbacMetrics {
  // Performance Metrics
  permissionCheckTime: number;
  cacheHitRate: number;
  averageResponseTime: number;
  slowestOperations: OperationMetric[];
  
  // Usage Analytics
  totalPermissionChecks: number;
  uniqueUsers: number;
  mostUsedPermissions: PermissionUsage[];
  leastUsedRoles: RoleUsage[];
  
  // User Behavior
  navigationPatterns: NavigationPattern[];
  sessionDuration: number;
  bounceRate: number;
  
  // System Health
  memoryUsage: number;
  cacheSize: number;
  errorRate: number;
  uptime: number;
}

export interface OperationMetric {
  operation: string;
  duration: number;
  timestamp: number;
  userId: string;
  success: boolean;
}

export interface PermissionUsage {
  permission: string;
  count: number;
  uniqueUsers: number;
  avgResponseTime: number;
  lastUsed: number;
}

export interface RoleUsage {
  role: string;
  activeUsers: number;
  permissionChecks: number;
  utilization: number; // 0-100%
}

export interface NavigationPattern {
  fromRoute: string;
  toRoute: string;
  count: number;
  avgTime: number;
  role: string;
}

export interface RbacAnalyticsEvent {
  type: 'permission_check' | 'role_access' | 'navigation' | 'error' | 'cache_operation';
  timestamp: number;
  userId: string;
  role: string;
  data: Record<string, unknown>;
  duration?: number;
  success: boolean;
}

// ============================================================================
// RBAC PERFORMANCE MONITOR
// ============================================================================

class RbacPerformanceMonitor {
  private metrics: Map<string, OperationMetric[]> = new Map();
  private readonly maxMetricsPerOperation = 1000;
  private readonly metricsRetentionHours = 24;

  // Track operation performance
  trackOperation<T>(
    operation: string,
    userId: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    
    return fn()
      .then((result) => {
        this.recordMetric(operation, userId, startTime, true);
        return result;
      })
      .catch((error) => {
        this.recordMetric(operation, userId, startTime, false);
        throw error;
      });
  }

  // Track synchronous operations
  trackSync<T>(
    operation: string,
    userId: string,
    fn: () => T
  ): T {
    const startTime = performance.now();
    
    try {
      const result = fn();
      this.recordMetric(operation, userId, startTime, true);
      return result;
    } catch (error) {
      this.recordMetric(operation, userId, startTime, false);
      throw error;
    }
  }

  private recordMetric(
    operation: string,
    userId: string,
    startTime: number,
    success: boolean
  ): void {
    const duration = performance.now() - startTime;
    const metric: OperationMetric = {
      operation,
      duration,
      timestamp: Date.now(),
      userId,
      success
    };

    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }

    const operationMetrics = this.metrics.get(operation)!;
    operationMetrics.push(metric);

    // Keep only recent metrics
    if (operationMetrics.length > this.maxMetricsPerOperation) {
      operationMetrics.shift();
    }

    // Clean old metrics
    this.cleanOldMetrics();
  }

  private cleanOldMetrics(): void {
    const cutoffTime = Date.now() - (this.metricsRetentionHours * 60 * 60 * 1000);
    
    for (const [operation, metrics] of this.metrics.entries()) {
      const filteredMetrics = metrics.filter(m => m.timestamp > cutoffTime);
      this.metrics.set(operation, filteredMetrics);
    }
  }

  // Get performance statistics
  getOperationStats(operation: string): {
    count: number;
    avgDuration: number;
    minDuration: number;
    maxDuration: number;
    successRate: number;
    recentTrend: 'improving' | 'stable' | 'degrading';
  } {
    const metrics = this.metrics.get(operation) || [];
    
    if (metrics.length === 0) {
      return {
        count: 0,
        avgDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        recentTrend: 'stable'
      };
    }

    const durations = metrics.map(m => m.duration);
    const successCount = metrics.filter(m => m.success).length;
    
    // Calculate trend (compare last 25% vs previous 25%)
    const quarterSize = Math.floor(metrics.length / 4);
    const recentMetrics = metrics.slice(-quarterSize);
    const previousMetrics = metrics.slice(-quarterSize * 2, -quarterSize);
    
    let recentTrend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (recentMetrics.length > 0 && previousMetrics.length > 0) {
      const recentAvg = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
      const previousAvg = previousMetrics.reduce((sum, m) => sum + m.duration, 0) / previousMetrics.length;
      
      const improvementThreshold = 0.1; // 10% improvement/degradation
      if (recentAvg < previousAvg * (1 - improvementThreshold)) {
        recentTrend = 'improving';
      } else if (recentAvg > previousAvg * (1 + improvementThreshold)) {
        recentTrend = 'degrading';
      }
    }

    return {
      count: metrics.length,
      avgDuration: durations.reduce((sum, d) => sum + d, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: (successCount / metrics.length) * 100,
      recentTrend
    };
  }

  // Get all tracked operations
  getAllOperations(): string[] {
    return Array.from(this.metrics.keys());
  }

  // Get slowest operations
  getSlowestOperations(limit: number = 10): OperationMetric[] {
    const allMetrics: OperationMetric[] = [];
    
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics);
    }

    return allMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  // Clear all metrics
  clear(): void {
    this.metrics.clear();
  }
}

// ============================================================================
// RBAC ANALYTICS COLLECTOR
// ============================================================================

class RbacAnalyticsCollector {
  private events: RbacAnalyticsEvent[] = [];
  private readonly maxEvents = 10000;
  private readonly retentionHours = 48;
  private subscribers: ((metrics: RbacMetrics) => void)[] = [];

  // Record analytics event
  track(event: Omit<RbacAnalyticsEvent, 'timestamp'>): void {
    const fullEvent: RbacAnalyticsEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(fullEvent);

    // Keep events within limits
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Clean old events
    this.cleanOldEvents();

    // Notify subscribers of new metrics
    this.notifySubscribers();
  }

  private cleanOldEvents(): void {
    const cutoffTime = Date.now() - (this.retentionHours * 60 * 60 * 1000);
    this.events = this.events.filter(e => e.timestamp > cutoffTime);
  }

  // Subscribe to metrics updates
  subscribe(callback: (metrics: RbacMetrics) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(): void {
    const metrics = this.calculateMetrics();
    this.subscribers.forEach(callback => callback(metrics));
  }

  // Calculate current metrics
  calculateMetrics(): RbacMetrics {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp > hourAgo);

    // Permission check metrics
    const permissionEvents = recentEvents.filter(e => e.type === 'permission_check');
    const totalPermissionChecks = permissionEvents.length;
    const avgPermissionTime = permissionEvents.length > 0 
      ? permissionEvents.reduce((sum, e) => sum + (e.duration || 0), 0) / permissionEvents.length
      : 0;

    // Cache metrics
    const cacheEvents = recentEvents.filter(e => e.type === 'cache_operation');
    const cacheHits = cacheEvents.filter(e => e.data.hit === true).length;
    const cacheHitRate = cacheEvents.length > 0 ? (cacheHits / cacheEvents.length) * 100 : 0;

    // User metrics
    const uniqueUsers = [...new Set(recentEvents.map(e => e.userId))].length;

    // Permission usage statistics
    const permissionUsage = this.calculatePermissionUsage(recentEvents);
    const roleUsage = this.calculateRoleUsage(recentEvents);
    
    // Navigation patterns
    const navigationPatterns = this.calculateNavigationPatterns(recentEvents);

    // Error rate
    const errorEvents = recentEvents.filter(e => e.success === false);
    const errorRate = recentEvents.length > 0 ? (errorEvents.length / recentEvents.length) * 100 : 0;

    return {
      // Performance Metrics
      permissionCheckTime: avgPermissionTime,
      cacheHitRate,
      averageResponseTime: avgPermissionTime,
      slowestOperations: [], // Will be populated by performance monitor
      
      // Usage Analytics
      totalPermissionChecks,
      uniqueUsers,
      mostUsedPermissions: permissionUsage.slice(0, 10),
      leastUsedRoles: roleUsage.slice(-5),
      
      // User Behavior
      navigationPatterns: navigationPatterns.slice(0, 20),
      sessionDuration: this.calculateAvgSessionDuration(),
      bounceRate: 0, // TODO: Calculate based on navigation patterns
      
      // System Health
      memoryUsage: 0, // TODO: Implement memory tracking
      cacheSize: 0, // TODO: Get from cache implementation
      errorRate,
      uptime: now - (this.events[0]?.timestamp || now)
    };
  }

  private calculatePermissionUsage(events: RbacAnalyticsEvent[]): PermissionUsage[] {
    const permissionMap = new Map<string, {
      count: number;
      users: Set<string>;
      totalTime: number;
      lastUsed: number;
    }>();

    events
      .filter(e => e.type === 'permission_check')
      .forEach(event => {
        const permission = String(event.data.permission || 'unknown');
        if (!permissionMap.has(permission)) {
          permissionMap.set(permission, {
            count: 0,
            users: new Set(),
            totalTime: 0,
            lastUsed: 0
          });
        }

        const data = permissionMap.get(permission)!;
        data.count++;
        data.users.add(event.userId);
        data.totalTime += event.duration || 0;
        data.lastUsed = Math.max(data.lastUsed, event.timestamp);
      });

    return Array.from(permissionMap.entries())
      .map(([permission, data]) => ({
        permission,
        count: data.count,
        uniqueUsers: data.users.size,
        avgResponseTime: data.count > 0 ? data.totalTime / data.count : 0,
        lastUsed: data.lastUsed
      }))
      .sort((a, b) => b.count - a.count);
  }

  private calculateRoleUsage(events: RbacAnalyticsEvent[]): RoleUsage[] {
    const roleMap = new Map<string, {
      users: Set<string>;
      permissionChecks: number;
    }>();

    events.forEach(event => {
      if (!roleMap.has(event.role)) {
        roleMap.set(event.role, {
          users: new Set(),
          permissionChecks: 0
        });
      }

      const data = roleMap.get(event.role)!;
      data.users.add(event.userId);
      if (event.type === 'permission_check') {
        data.permissionChecks++;
      }
    });

    return Array.from(roleMap.entries())
      .map(([role, data]) => ({
        role,
        activeUsers: data.users.size,
        permissionChecks: data.permissionChecks,
        utilization: data.permissionChecks > 0 ? Math.min(100, data.permissionChecks / 10) : 0
      }))
      .sort((a, b) => a.utilization - b.utilization);
  }

  private calculateNavigationPatterns(events: RbacAnalyticsEvent[]): NavigationPattern[] {
    const navigationEvents = events.filter(e => e.type === 'navigation');
    const patternMap = new Map<string, {
      count: number;
      totalTime: number;
      role: string;
    }>();

    navigationEvents.forEach(event => {
      const key = `${event.data.from}->${event.data.to}`;
      if (!patternMap.has(key)) {
        patternMap.set(key, {
          count: 0,
          totalTime: 0,
          role: event.role
        });
      }

      const data = patternMap.get(key)!;
      data.count++;
      data.totalTime += event.duration || 0;
    });

    return Array.from(patternMap.entries())
      .map(([pattern, data]) => {
        const [fromRoute, toRoute] = pattern.split('->');
        return {
          fromRoute,
          toRoute,
          count: data.count,
          avgTime: data.count > 0 ? data.totalTime / data.count : 0,
          role: data.role
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  private calculateAvgSessionDuration(): number {
    // TODO: Implement session duration calculation
    return 0;
  }

  // Get raw events for debugging
  getEvents(): RbacAnalyticsEvent[] {
    return [...this.events];
  }

  // Clear all analytics data
  clear(): void {
    this.events = [];
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

export const rbacPerformanceMonitor = new RbacPerformanceMonitor();
export const rbacAnalyticsCollector = new RbacAnalyticsCollector();

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * Hook for accessing real-time RBAC analytics
 */
export function useRbacAnalytics() {
  const [metrics, setMetrics] = useState<RbacMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial metrics calculation
    const initialMetrics = rbacAnalyticsCollector.calculateMetrics();
    setMetrics(initialMetrics);
    setIsLoading(false);

    // Subscribe to updates
    const unsubscribe = rbacAnalyticsCollector.subscribe((newMetrics) => {
      setMetrics(newMetrics);
    });

    return unsubscribe;
  }, []);

  // Track analytics event
  const track = useCallback((event: Omit<RbacAnalyticsEvent, 'timestamp'>) => {
    rbacAnalyticsCollector.track(event);
  }, []);

  return {
    metrics,
    isLoading,
    track
  };
}

/**
 * Hook for performance monitoring
 */
export function useRbacPerformance() {
  const [performanceData, setPerformanceData] = useState<{
    operations: string[];
    slowestOperations: OperationMetric[];
  }>({
    operations: [],
    slowestOperations: []
  });

  useEffect(() => {
    const updatePerformanceData = () => {
      const operations = rbacPerformanceMonitor.getAllOperations();
      const slowestOperations = rbacPerformanceMonitor.getSlowestOperations(10);
      
      setPerformanceData({
        operations,
        slowestOperations
      });
    };

    // Update immediately
    updatePerformanceData();

    // Update every 5 seconds
    const interval = setInterval(updatePerformanceData, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get stats for specific operation
  const getOperationStats = useCallback((operation: string) => {
    return rbacPerformanceMonitor.getOperationStats(operation);
  }, []);

  // Track operation performance
  const trackOperation = useCallback(<T,>(
    operation: string,
    userId: string,
    fn: () => Promise<T>
  ): Promise<T> => {
    return rbacPerformanceMonitor.trackOperation(operation, userId, fn);
  }, []);

  const trackSync = useCallback(<T,>(
    operation: string,
    userId: string,
    fn: () => T
  ): T => {
    return rbacPerformanceMonitor.trackSync(operation, userId, fn);
  }, []);

  return {
    ...performanceData,
    getOperationStats,
    trackOperation,
    trackSync
  };
}