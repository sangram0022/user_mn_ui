import type React from 'react';
import styles from '../pages/ErrorDashboard.module.css';

interface PerformanceMetricsCardProps {
  avgResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  activeConnections: number;
  isLoading?: boolean;
}

export const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({
  avgResponseTime,
  memoryUsage,
  cpuUsage,
  activeConnections,
  isLoading = false,
}) => {
  const getHealthStatus = (responseTime: number, memory: number, cpu: number) => {
    if (responseTime < 100 && memory < 70 && cpu < 70) return 'healthy';
    if (responseTime < 300 && memory < 85 && cpu < 85) return 'caution';
    return 'warning';
  };

  const status = getHealthStatus(avgResponseTime, memoryUsage, cpuUsage);
  const statusColors = {
    healthy: '#4a4',
    caution: '#f80',
    warning: '#f44',
  };

  const getMetricStatus = (value: number, thresholdWarn: number, thresholdCritical: number) => {
    if (value < thresholdWarn) return 'healthy';
    if (value < thresholdCritical) return 'caution';
    return 'critical';
  };

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Performance Metrics</h3>
      {isLoading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
          Loading performance data...
        </div>
      ) : (
        <div style={{ padding: '16px' }}>
          {/* Health Status */}
          <div
            style={{
              padding: '12px',
              background: `${statusColors[status]}20`,
              border: `1px solid ${statusColors[status]}`,
              borderRadius: '4px',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600, color: statusColors[status] }}>
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Response Time */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', marginBottom: '4px' }}>
                AVG RESPONSE
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                {avgResponseTime}
                <span style={{ fontSize: '12px', color: '#999' }}>ms</span>
              </div>
              <div
                style={{
                  height: '4px',
                  background: '#eee',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min((avgResponseTime / 500) * 100, 100)}%`,
                    background:
                      getMetricStatus(avgResponseTime, 100, 300) === 'healthy'
                        ? '#4a4'
                        : getMetricStatus(avgResponseTime, 100, 300) === 'caution'
                          ? '#f80'
                          : '#f44',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>Target: &lt;100ms</div>
            </div>

            {/* Memory Usage */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', marginBottom: '4px' }}>
                MEMORY USAGE
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                {memoryUsage}
                <span style={{ fontSize: '12px', color: '#999' }}>%</span>
              </div>
              <div
                style={{
                  height: '4px',
                  background: '#eee',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${memoryUsage}%`,
                    background:
                      getMetricStatus(memoryUsage, 70, 85) === 'healthy'
                        ? '#4a4'
                        : getMetricStatus(memoryUsage, 70, 85) === 'caution'
                          ? '#f80'
                          : '#f44',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>Max: 100%</div>
            </div>

            {/* CPU Usage */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', marginBottom: '4px' }}>
                CPU USAGE
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                {cpuUsage}
                <span style={{ fontSize: '12px', color: '#999' }}>%</span>
              </div>
              <div
                style={{
                  height: '4px',
                  background: '#eee',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  marginBottom: '4px',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${cpuUsage}%`,
                    background:
                      getMetricStatus(cpuUsage, 70, 85) === 'healthy'
                        ? '#4a4'
                        : getMetricStatus(cpuUsage, 70, 85) === 'caution'
                          ? '#f80'
                          : '#f44',
                  }}
                />
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>Max: 100%</div>
            </div>

            {/* Active Connections */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#999', marginBottom: '4px' }}>
                ACTIVE CONNECTIONS
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>
                {activeConnections.toLocaleString()}
              </div>
              <div style={{ fontSize: '11px', color: '#999' }}>Current load</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
