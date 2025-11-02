import type React from 'react';
import styles from '../pages/ErrorDashboard.module.css';

interface TrendPoint {
  timestamp: number;
  errorCount: number;
  level: 'info' | 'warning' | 'error' | 'fatal';
  type: string;
}

interface ErrorTrendsChartProps {
  trends: TrendPoint[];
  isLoading?: boolean;
}

export const ErrorTrendsChart: React.FC<ErrorTrendsChartProps> = ({ trends, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Error Trends (24h)</h3>
        <div className={styles.chartContainer} style={{ opacity: 0.6 }}>
          <div>Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (!trends || trends.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Error Trends (24h)</h3>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateText}>No trend data available</div>
        </div>
      </div>
    );
  }

  // Calculate max error count for scaling
  const maxErrors = Math.max(...trends.map((t) => t.errorCount), 1);

  // Group trends into reasonable number of bars (max 24 for hourly)
  const displayTrends = trends.slice(-24);

  // Calculate bar heights as percentages
  const chartBars = displayTrends.map((trend, index) => {
    const height = (trend.errorCount / maxErrors) * 100;
    const isHighError = trend.level === 'error' || trend.level === 'fatal';

    return {
      id: `trend-${index}`,
      height: Math.max(height, 5), // Minimum height for visibility
      errorCount: trend.errorCount,
      timestamp: trend.timestamp,
      isHighError,
      level: trend.level,
    };
  });

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>Error Trends (24h)</h3>
      <div className={styles.chartContainer}>
        {chartBars.map((bar) => (
          <div
            key={bar.id}
            className={styles.chartBar}
            style={{
              height: `${bar.height}%`,
              backgroundColor: bar.isHighError ? '#f44' : '#08f',
              opacity: bar.isHighError ? 1 : 0.7,
            }}
            title={`${bar.errorCount} errors at ${new Date(bar.timestamp).toLocaleTimeString()}`}
          />
        ))}
      </div>
      <div style={{ marginTop: '8px', fontSize: '12px', color: '#999', textAlign: 'center' }}>
        Showing last 24 hours • Max: {maxErrors} errors/interval
      </div>
    </div>
  );
};
