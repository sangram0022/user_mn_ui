import { memo } from 'react';
import { 
  usePerformanceMetrics, 
  useUsageAnalytics
} from './analyticsHooks';

// Add types for analytics data
interface PerformanceAlert {
  level: 'warning' | 'error' | 'critical';
  message: string;
  metric: string;
  value: number;
  threshold: number;
}

interface Permission {
  permission: string;
  count: number;
  uniqueUsers: number;
  avgResponseTime: number;
}

interface Route {
  route: string;
  count: number;
  avgTime: number;
  role: string;
}

interface RoleUtilization {
  role: string;
  utilization: number;
  activeUsers: number;
  permissionChecks: number;
  status: string;
}

interface SlowOperation {
  operation: string;
  duration: number;
  timestamp: number;
  userId: string;
  success: boolean;
}

// ============================================================================
// RBAC ANALYTICS DASHBOARD COMPONENT
// ============================================================================

interface RbacAnalyticsDashboardProps {
  className?: string;
}

/**
 * Real-time RBAC Analytics Dashboard
 * Displays comprehensive system performance and usage metrics
 */
export const RbacAnalyticsDashboard = memo(function RbacAnalyticsDashboard({ 
  className = '' 
}: RbacAnalyticsDashboardProps) {
  const { 
    performanceSummary, 
    isSystemHealthy, 
    performanceAlerts 
  } = usePerformanceMetrics();
  
  const { 
    usageTrends, 
    roleUtilization 
  } = useUsageAnalytics();



  if (!performanceSummary && !usageTrends) {
    return (
      <div className={`rbac-analytics-dashboard ${className}`}>
        <div className="analytics-loading">
          <div className="loading-spinner" />
          <p>Loading RBAC Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rbac-analytics-dashboard ${className}`}>
      {/* Header */}
      <div className="analytics-header">
        <h2>🚀 RBAC Analytics Dashboard</h2>
        <div className={`system-health ${isSystemHealthy ? 'healthy' : 'warning'}`}>
          <span className="health-indicator" />
          {isSystemHealthy ? 'System Healthy' : 'Performance Issues'}
        </div>
      </div>

      {/* Performance Alerts */}
      {performanceAlerts.length > 0 && (
        <div className="performance-alerts">
          <h3>⚠️ Performance Alerts</h3>
          <div className="alerts-grid">
            {performanceAlerts.map((alert: PerformanceAlert, index: number) => (
              <div key={index} className={`alert alert-${alert.level}`}>
                <div className="alert-header">
                  <span className={`alert-icon alert-${alert.level}`} />
                  <span className="alert-level">{alert.level.toUpperCase()}</span>
                </div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-details">
                  {alert.metric}: {alert.value.toFixed(1)} 
                  (threshold: {alert.threshold})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Summary */}
      {performanceSummary && (
        <div className="performance-summary">
          <h3>⚡ Performance Overview</h3>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Avg Response Time</div>
              <div className="metric-value">
                {performanceSummary.avgResponseTime.toFixed(1)}ms
              </div>
              <div className="metric-status">
                {performanceSummary.avgResponseTime < 100 ? '✅ Excellent' : 
                 performanceSummary.avgResponseTime < 200 ? '⚠️ Good' : '❌ Slow'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Cache Hit Rate</div>
              <div className="metric-value">
                {performanceSummary.cacheHitRate.toFixed(1)}%
              </div>
              <div className="metric-status">
                {performanceSummary.cacheHitRate > 80 ? '✅ Excellent' : 
                 performanceSummary.cacheHitRate > 60 ? '⚠️ Good' : '❌ Poor'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Error Rate</div>
              <div className="metric-value">
                {performanceSummary.errorRate.toFixed(2)}%
              </div>
              <div className="metric-status">
                {performanceSummary.errorRate < 1 ? '✅ Excellent' : 
                 performanceSummary.errorRate < 5 ? '⚠️ Acceptable' : '❌ High'}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Total Checks</div>
              <div className="metric-value">
                {performanceSummary.totalChecks.toLocaleString()}
              </div>
              <div className="metric-status">Last Hour</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Active Users</div>
              <div className="metric-value">
                {performanceSummary.uniqueUsers}
              </div>
              <div className="metric-status">Current Session</div>
            </div>

            <div className="metric-card">
              <div className="metric-label">System Uptime</div>
              <div className="metric-value">
                {(performanceSummary.uptime / (1000 * 60)).toFixed(0)}m
              </div>
              <div className="metric-status">Running</div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Analytics */}
      {usageTrends && (
        <div className="usage-analytics">
          <h3>📊 Usage Analytics</h3>
          
          {/* Top Permissions */}
          <div className="analytics-section">
            <h4>Most Used Permissions</h4>
            <div className="permission-list">
              {usageTrends.topPermissions.map((permission: Permission, index: number) => (
                <div key={permission.permission} className="permission-item">
                  <div className="permission-rank">#{index + 1}</div>
                  <div className="permission-name">{permission.permission}</div>
                  <div className="permission-stats">
                    <span className="permission-count">{permission.count} checks</span>
                    <span className="permission-users">{permission.uniqueUsers} users</span>
                    <span className="permission-time">
                      {permission.avgResponseTime.toFixed(1)}ms avg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Patterns */}
          <div className="analytics-section">
            <h4>Popular Navigation Routes</h4>
            <div className="route-list">
              {usageTrends.popularRoutes.map((route: Route, index: number) => (
                <div key={`${route.route}-${index}`} className="route-item">
                  <div className="route-path">{route.route}</div>
                  <div className="route-stats">
                    <span className="route-count">{route.count} times</span>
                    <span className="route-role">Role: {route.role}</span>
                    <span className="route-time">{route.avgTime.toFixed(0)}ms avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Role Utilization */}
      {roleUtilization && roleUtilization.length > 0 && (
        <div className="role-utilization">
          <h3>👥 Role Utilization</h3>
          <div className="role-grid">
            {roleUtilization.map((role: RoleUtilization) => (
              <div key={role.role} className={`role-card role-${role.status}`}>
                <div className="role-header">
                  <span className="role-name">{role.role}</span>
                  <span className={`role-status status-${role.status}`}>
                    {role.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="role-metrics">
                  <div className="role-metric">
                    <span className="metric-label">Utilization</span>
                    <span className="metric-value">{role.utilization}%</span>
                  </div>
                  <div className="role-metric">
                    <span className="metric-label">Active Users</span>
                    <span className="metric-value">{role.activeUsers}</span>
                  </div>
                  <div className="role-metric">
                    <span className="metric-label">Permission Checks</span>
                    <span className="metric-value">{role.permissionChecks}</span>
                  </div>
                </div>
                <div className="utilization-bar">
                  <div 
                    className="utilization-fill" 
                    style={{ width: `${Math.min(100, role.utilization)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slowest Operations */}
      {performanceSummary?.slowestOperations && performanceSummary.slowestOperations.length > 0 && (
        <div className="slow-operations">
          <h3>🐌 Slowest Operations</h3>
          <div className="operations-list">
            {performanceSummary.slowestOperations.map((op: SlowOperation, index: number) => (
              <div key={`${op.operation}-${op.timestamp}-${index}`} className="operation-item">
                <div className="operation-rank">#{index + 1}</div>
                <div className="operation-details">
                  <div className="operation-name">{op.operation}</div>
                  <div className="operation-stats">
                    <span className="operation-time">{op.duration.toFixed(1)}ms</span>
                    <span className="operation-user">User: {op.userId}</span>
                    <span className={`operation-status ${op.success ? 'success' : 'failed'}`}>
                      {op.success ? '✅ Success' : '❌ Failed'}
                    </span>
                  </div>
                </div>
                <div className="operation-timestamp">
                  {new Date(op.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="analytics-footer">
        <div className="update-info">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
        <div className="data-retention">
          Data retention: 24 hours • Real-time updates
        </div>
      </div>
    </div>
  );
});

// ============================================================================
// COMPACT ANALYTICS WIDGET
// ============================================================================

interface RbacAnalyticsWidgetProps {
  className?: string;
}

/**
 * Compact RBAC Analytics Widget for sidebar/header display
 */
export const RbacAnalyticsWidget = memo(function RbacAnalyticsWidget({ 
  className = '' 
}: RbacAnalyticsWidgetProps) {
  const { performanceSummary, isSystemHealthy, performanceAlerts } = usePerformanceMetrics();

  if (!performanceSummary) {
    return (
      <div className={`rbac-analytics-widget ${className}`}>
        <div className="widget-loading">⚡</div>
      </div>
    );
  }

  const alertLevel = performanceAlerts.length > 0 
    ? performanceAlerts.reduce((highest: string, alert: PerformanceAlert) => {
        const levels = { warning: 1, error: 2, critical: 3 };
        return levels[alert.level as keyof typeof levels] > levels[highest as keyof typeof levels] ? alert.level : highest;
      }, 'warning')
    : null;

  return (
    <div className={`rbac-analytics-widget ${className}`}>
      <div className="widget-header">
        <span className="widget-title">RBAC</span>
        <div className={`health-indicator ${isSystemHealthy ? 'healthy' : 'warning'}`}>
          {isSystemHealthy ? '✅' : '⚠️'}
        </div>
      </div>

      <div className="widget-metrics">
        <div className="widget-metric">
          <span className="metric-value">{performanceSummary.avgResponseTime.toFixed(0)}</span>
          <span className="metric-unit">ms</span>
        </div>
        <div className="widget-metric">
          <span className="metric-value">{performanceSummary.cacheHitRate.toFixed(0)}</span>
          <span className="metric-unit">%</span>
        </div>
        <div className="widget-metric">
          <span className="metric-value">{performanceSummary.uniqueUsers}</span>
          <span className="metric-unit">users</span>
        </div>
      </div>

      {alertLevel && (
        <div className={`widget-alert alert-${alertLevel}`}>
          <span className="alert-icon">⚠️</span>
          <span className="alert-count">{performanceAlerts.length}</span>
        </div>
      )}
    </div>
  );
});

export default RbacAnalyticsDashboard;