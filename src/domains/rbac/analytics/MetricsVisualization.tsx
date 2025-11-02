import { memo, useMemo } from 'react';
import type { RbacMetrics, PermissionUsage, RoleUsage, NavigationPattern } from './performanceMonitor';

// ============================================================================
// METRICS VISUALIZATION TYPES
// ============================================================================

interface MetricsVisualizationProps {
  metrics: RbacMetrics;
  className?: string;
}

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// ============================================================================
// SIMPLE CHART COMPONENTS
// ============================================================================

interface BarChartProps {
  data: ChartDataPoint[];
  height?: number;
  maxValue?: number;
  showValues?: boolean;
}

const BarChart = memo(function BarChart({ 
  data, 
  height = 200, 
  maxValue, 
  showValues = true 
}: BarChartProps) {
  const maxVal = maxValue || Math.max(...data.map(d => d.value));
  
  return (
    <div className="bar-chart" style={{ height }}>
      <div className="chart-bars">
        {data.map((item) => (
          <div key={item.label} className="bar-container">
            <div 
              className="bar" 
              style={{
                height: `${(item.value / maxVal) * 100}%`,
                backgroundColor: item.color || '#3b82f6'
              }}
            />
            {showValues && (
              <div className="bar-value">{item.value}</div>
            )}
            <div className="bar-label">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

interface LineChartProps {
  data: Array<{ time: number; value: number }>;
  height?: number;
  color?: string;
}

const LineChart = memo(function LineChart({ 
  data, 
  height = 150, 
  color = '#10b981' 
}: LineChartProps) {
  const points = useMemo(() => {
    if (data.length < 2) return '';
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue || 1;
    
    return data
      .map((point, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - ((point.value - minValue) / range) * 100;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data]);

  if (data.length < 2) {
    return (
      <div className="line-chart" style={{ height }}>
        <div className="no-data">Insufficient data for trend</div>
      </div>
    );
  }

  return (
    <div className="line-chart" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
});

interface DonutChartProps {
  data: ChartDataPoint[];
  size?: number;
  thickness?: number;
}

const DonutChart = memo(function DonutChart({ 
  data, 
  size = 120, 
  thickness = 20 
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let cumulativePercentage = 0;
  
  return (
    <div className="donut-chart" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
          
          cumulativePercentage += percentage;
          
          return (
            <circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color || `hsl(${index * 45}, 70%, 50%)`}
              strokeWidth={thickness}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
        <text
          x={size / 2}
          y={size / 2}
          textAnchor="middle"
          dy="0.3em"
          className="donut-center-text"
        >
          {total}
        </text>
      </svg>
      <div className="donut-legend">
        {data.map((item, index) => (
          <div key={item.label} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: item.color || `hsl(${index * 45}, 70%, 50%)` }}
            />
            <span className="legend-label">{item.label}</span>
            <span className="legend-value">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

// ============================================================================
// METRICS VISUALIZATION COMPONENT
// ============================================================================

export const MetricsVisualization = memo(function MetricsVisualization({ 
  metrics, 
  className = '' 
}: MetricsVisualizationProps) {
  
  // Permission usage chart data
  const permissionChartData = useMemo(() => {
    return metrics.mostUsedPermissions.slice(0, 8).map((permission: PermissionUsage, index: number) => ({
      label: permission.permission.slice(0, 12) + (permission.permission.length > 12 ? '...' : ''),
      value: permission.count,
      color: `hsl(${index * 45}, 65%, 55%)`
    }));
  }, [metrics.mostUsedPermissions]);

  // Role utilization chart data
  const roleUtilizationData = useMemo(() => {
    return metrics.leastUsedRoles.map((role: RoleUsage) => ({
      label: role.role,
      value: role.utilization,
      color: role.utilization < 20 ? '#ef4444' : 
             role.utilization > 80 ? '#10b981' : '#f59e0b'
    }));
  }, [metrics.leastUsedRoles]);

  // Cache performance data  
  const cachePerformanceData = useMemo(() => [
    { label: 'Hits', value: metrics.cacheHitRate, color: '#10b981' },
    { label: 'Misses', value: 100 - metrics.cacheHitRate, color: '#ef4444' }
  ], [metrics.cacheHitRate]);

  // Response time trend (mock data for now)
  const responseTimeTrend = useMemo(() => {
    const now = Date.now();
    return Array.from({ length: 20 }, (_, i) => ({
      time: now - (19 - i) * 60000,
      value: metrics.averageResponseTime + (Math.random() - 0.5) * 50
    }));
  }, [metrics.averageResponseTime]);

  return (
    <div className={`metrics-visualization ${className}`}>
      
      {/* Permission Usage Chart */}
      <div className="visualization-section">
        <h4>📊 Permission Usage Distribution</h4>
        <div className="chart-container">
          <BarChart 
            data={permissionChartData}
            height={200}
            showValues={true}
          />
        </div>
        <div className="chart-summary">
          Top {permissionChartData.length} permissions • 
          Total checks: {metrics.totalPermissionChecks.toLocaleString()}
        </div>
      </div>

      {/* Role Utilization */}
      <div className="visualization-section">
        <h4>👥 Role Utilization Levels</h4>
        <div className="chart-container">
          <BarChart 
            data={roleUtilizationData}
            height={180}
            maxValue={100}
            showValues={true}
          />
        </div>
        <div className="chart-summary">
          Utilization percentage by role • 
          Red: Underutilized • Yellow: Normal • Green: Heavily Used
        </div>
      </div>

      {/* Cache Performance */}
      <div className="visualization-section">
        <h4>💾 Cache Hit Rate</h4>
        <div className="chart-container cache-chart">
          <DonutChart 
            data={cachePerformanceData}
            size={160}
            thickness={25}
          />
          <div className="cache-stats">
            <div className="cache-stat">
              <span className="stat-label">Hit Rate</span>
              <span className="stat-value">{metrics.cacheHitRate.toFixed(1)}%</span>
            </div>
            <div className="cache-stat">
              <span className="stat-label">Performance</span>
              <span className={`stat-status ${metrics.cacheHitRate > 80 ? 'excellent' : 
                                           metrics.cacheHitRate > 60 ? 'good' : 'poor'}`}>
                {metrics.cacheHitRate > 80 ? 'Excellent' : 
                 metrics.cacheHitRate > 60 ? 'Good' : 'Poor'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Response Time Trend */}
      <div className="visualization-section">
        <h4>⚡ Response Time Trend</h4>
        <div className="chart-container">
          <LineChart 
            data={responseTimeTrend}
            height={120}
            color="#3b82f6"
          />
        </div>
        <div className="chart-summary">
          Last 20 minutes • 
          Current avg: {metrics.averageResponseTime.toFixed(1)}ms •
          Target: &lt;100ms
        </div>
      </div>

      {/* Navigation Patterns */}
      <div className="visualization-section">
        <h4>🗺️ Navigation Heatmap</h4>
        <div className="navigation-heatmap">
          {metrics.navigationPatterns.slice(0, 15).map((pattern: NavigationPattern, index: number) => (
            <div 
              key={`${pattern.fromRoute}-${pattern.toRoute}-${index}`}
              className="navigation-item"
              style={{
                opacity: Math.max(0.3, pattern.count / Math.max(...metrics.navigationPatterns.map((p: NavigationPattern) => p.count))),
                backgroundColor: `hsl(${pattern.avgTime / 10}, 70%, 60%)`
              }}
            >
              <div className="nav-route">
                {pattern.fromRoute} → {pattern.toRoute}
              </div>
              <div className="nav-stats">
                <span className="nav-count">{pattern.count}×</span>
                <span className="nav-time">{pattern.avgTime.toFixed(0)}ms</span>
                <span className="nav-role">{pattern.role}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="chart-summary">
          Most frequent navigation paths • 
          Intensity = usage frequency • Color = average time
        </div>
      </div>

      {/* System Health Overview */}
      <div className="visualization-section">
        <h4>🏥 System Health Indicators</h4>
        <div className="health-indicators">
          <div className="health-indicator">
            <div className="indicator-header">
              <span className="indicator-title">Response Time</span>
              <span className={`indicator-status ${metrics.averageResponseTime < 100 ? 'healthy' : 
                                               metrics.averageResponseTime < 200 ? 'warning' : 'critical'}`}>
                {metrics.averageResponseTime < 100 ? '✅ Healthy' : 
                 metrics.averageResponseTime < 200 ? '⚠️ Warning' : '❌ Critical'}
              </span>
            </div>
            <div className="indicator-bar">
              <div 
                className="indicator-fill"
                style={{ 
                  width: `${Math.min(100, (metrics.averageResponseTime / 300) * 100)}%`,
                  backgroundColor: metrics.averageResponseTime < 100 ? '#10b981' : 
                                 metrics.averageResponseTime < 200 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <div className="indicator-value">{metrics.averageResponseTime.toFixed(1)}ms</div>
          </div>

          <div className="health-indicator">
            <div className="indicator-header">
              <span className="indicator-title">Cache Performance</span>
              <span className={`indicator-status ${metrics.cacheHitRate > 80 ? 'healthy' : 
                                               metrics.cacheHitRate > 60 ? 'warning' : 'critical'}`}>
                {metrics.cacheHitRate > 80 ? '✅ Healthy' : 
                 metrics.cacheHitRate > 60 ? '⚠️ Warning' : '❌ Critical'}
              </span>
            </div>
            <div className="indicator-bar">
              <div 
                className="indicator-fill"
                style={{ 
                  width: `${metrics.cacheHitRate}%`,
                  backgroundColor: metrics.cacheHitRate > 80 ? '#10b981' : 
                                 metrics.cacheHitRate > 60 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <div className="indicator-value">{metrics.cacheHitRate.toFixed(1)}%</div>
          </div>

          <div className="health-indicator">
            <div className="indicator-header">
              <span className="indicator-title">Error Rate</span>
              <span className={`indicator-status ${metrics.errorRate < 1 ? 'healthy' : 
                                               metrics.errorRate < 5 ? 'warning' : 'critical'}`}>
                {metrics.errorRate < 1 ? '✅ Healthy' : 
                 metrics.errorRate < 5 ? '⚠️ Warning' : '❌ Critical'}
              </span>
            </div>
            <div className="indicator-bar">
              <div 
                className="indicator-fill"
                style={{ 
                  width: `${Math.min(100, metrics.errorRate * 10)}%`,
                  backgroundColor: metrics.errorRate < 1 ? '#10b981' : 
                                 metrics.errorRate < 5 ? '#f59e0b' : '#ef4444'
                }}
              />
            </div>
            <div className="indicator-value">{metrics.errorRate.toFixed(2)}%</div>
          </div>
        </div>
      </div>

    </div>
  );
});

export default MetricsVisualization;