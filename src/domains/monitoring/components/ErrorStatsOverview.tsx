import type React from 'react';
import styles from '../pages/ErrorDashboard.module.css';

interface ErrorStatsOverviewProps {
  totalErrors: number;
  criticalErrors: number;
  errorRate: number;
  recoveryRate: number;
  isLoading?: boolean;
}

export const ErrorStatsOverview: React.FC<ErrorStatsOverviewProps> = ({
  totalErrors,
  criticalErrors,
  errorRate,
  recoveryRate,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className={styles.metricsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.metricCard} style={{ opacity: 0.6 }}>
            <div className={styles.metricLabel}>Loading...</div>
            <div className={styles.metricValue}>--</div>
          </div>
        ))}
      </div>
    );
  }

  const getMetricClass = (value: number, type: 'total' | 'critical' | 'rate' | 'recovery') => {
    if (type === 'critical' && value > 10) return 'critical';
    if (type === 'rate' && value > 1) return 'warning';
    if (type === 'recovery' && value < 50) return 'warning';
    if (type === 'recovery' && value < 30) return 'critical';
    return 'success';
  };

  return (
    <div className={styles.metricsGrid}>
      <div className={`${styles.metricCard} ${styles[getMetricClass(totalErrors, 'total')]}`}>
        <div className={styles.metricLabel}>Total Errors</div>
        <div className={styles.metricValue}>{totalErrors.toLocaleString()}</div>
        <div className={styles.metricDescription}>Cumulative error count</div>
      </div>

      <div className={`${styles.metricCard} ${styles[getMetricClass(criticalErrors, 'critical')]}`}>
        <div className={styles.metricLabel}>Critical Errors</div>
        <div className={styles.metricValue}>{criticalErrors}</div>
        <div className={styles.metricDescription}>Errors requiring immediate action</div>
      </div>

      <div className={`${styles.metricCard} ${styles[getMetricClass(errorRate, 'rate')]}`}>
        <div className={styles.metricLabel}>Error Rate</div>
        <div className={styles.metricValue}>{errorRate.toFixed(2)}</div>
        <div className={styles.metricUnit}>errors per minute</div>
        <div className={styles.metricDescription}>Current error frequency</div>
      </div>

      <div className={`${styles.metricCard} ${styles[getMetricClass(recoveryRate, 'recovery')]}`}>
        <div className={styles.metricLabel}>Recovery Rate</div>
        <div className={styles.metricValue}>{recoveryRate}%</div>
        <div className={styles.metricDescription}>Percentage of recovered errors</div>
      </div>
    </div>
  );
};
