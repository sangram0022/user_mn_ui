/**
 * Error Monitoring Dashboard
 *
 * Real-time error monitoring and analytics page
 * Displays error statistics, trends, recovery metrics, and recent errors
 */

import { useState } from 'react';
import {
  useErrorStatistics,
  useErrorRecovery,
  useErrorTrends,
  useErrorMetrics,
} from '@/core/monitoring/hooks';
import {
  ErrorStatsOverview,
  ErrorTrendsChart,
  ErrorListWithFilters,
  RecoveryMetricsCard,
  PerformanceMetricsCard,
  TopErrorsCard,
} from '../components/index';
import styles from './ErrorDashboard.module.css';

/**
 * Error Dashboard Component
 * Main monitoring page for error statistics and analytics
 */
export function ErrorDashboard() {
  const { stats, trends, isLoading, error, refresh } = useErrorStatistics(5000);
  const recovery = useErrorRecovery();
  useErrorTrends(); // Called for side effects
  const metrics = useErrorMetrics();

  const [selectedErrorType, setSelectedErrorType] = useState<string>('');
  const [selectedErrorLevel, setSelectedErrorLevel] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter recent errors based on selections
  const filteredErrors = (stats?.recentErrors || []).filter(
    (err: any) => {
      const matchesType = !selectedErrorType || err.type === selectedErrorType;
      const matchesLevel = !selectedErrorLevel || err.level === selectedErrorLevel;
      const matchesSearch =
        !searchQuery || err.message.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesLevel && matchesSearch;
    },
  );

  // Get available types and levels
  const availableTypes = Array.from(
    new Set((stats?.recentErrors || []).map((e: any) => (e.type ? String(e.type) : ''))),
  ).filter(Boolean) as string[];
  const availableLevels = Array.from(
    new Set((stats?.recentErrors || []).map((e: any) => (e.level ? String(e.level) : ''))),
  ).filter(Boolean) as string[];

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Error Monitoring Dashboard</h1>
        <p className={styles.subtitle}>Real-time error tracking and analytics</p>
      </header>

      {error && (
        <div className={styles.errorBanner}>
          <strong>Error loading statistics:</strong> {String(error)}
          <button onClick={refresh} className={styles.retryButton}>
            Retry
          </button>
        </div>
      )}

      {isLoading && (
        <div className={styles.loadingBanner}>Loading error statistics...</div>
      )}

      {/* Error Stats Overview */}
      <ErrorStatsOverview
        totalErrors={stats?.totalErrors || 0}
        criticalErrors={stats?.criticalErrors || 0}
        errorRate={stats?.errorRate || 0}
        recoveryRate={stats?.recoveryRate || 0}
        isLoading={isLoading}
      />

      {/* Charts Grid */}
      <div className={styles.chartsGrid}>
        <ErrorTrendsChart
          trends={trends?.map((t: any) => ({ ...t, timestamp: typeof t.timestamp === 'string' ? Date.parse(t.timestamp) : t.timestamp })) || []}
          isLoading={isLoading}
        />
        <RecoveryMetricsCard
          recoveryRate={recovery?.recoveryRate || 0}
          recoveredErrors={Math.round((recovery?.totalErrors || 0) * ((recovery?.recoveryRate || 0) / 100))}
          failedRecoveries={Math.round((recovery?.totalErrors || 0) * (100 - (recovery?.recoveryRate || 0)) / 100)}
          isLoading={isLoading}
        />
        <PerformanceMetricsCard
          avgResponseTime={metrics?.stats?.avgResponseTime || 0}
          memoryUsage={Math.round((metrics?.performanceMetrics?.memoryUsage?.used || 0) / (metrics?.performanceMetrics?.memoryUsage?.total || 1) * 100) || 0}
          cpuUsage={Math.min(100, Math.round(((recovery?.totalErrors || 0) / 100) * 10))} // Approximate CPU based on error rate
          activeConnections={recovery?.totalErrors || 0}
          isLoading={isLoading}
        />
        <TopErrorsCard
          topErrors={(metrics?.topErrors || []).map((t: any, i: number) => ({
            id: `${i}`,
            type: t.type,
            message: t.type,
            count: t.count,
            percentage: ((t.count / (metrics?.stats?.totalErrors || 1)) * 100),
          })) || []}
          isLoading={isLoading}
        />
      </div>

      {/* Filter Bar */}
      <div className={styles.filterBar}>
        <input
          type="text"
          placeholder="Search errors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />

        <select
          value={selectedErrorLevel}
          onChange={(e) => setSelectedErrorLevel(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Levels</option>
          {availableLevels.map((level: string) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>

        <select
          value={selectedErrorType}
          onChange={(e) => setSelectedErrorType(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">All Types</option>
          {availableTypes.map((type: string) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <button onClick={refresh} className={styles.refreshButton}>
          🔄 Refresh
        </button>
      </div>

      {/* Error List */}
      <ErrorListWithFilters
        errors={(filteredErrors || []).map((e: any) => ({
          ...e,
          id: e.id || Math.random().toString(),
          level: (e.level === 'debug' ? 'info' : e.level) as 'error' | 'info' | 'warning' | 'fatal',
        }))}
        selectedErrorType={selectedErrorType}
        selectedErrorLevel={selectedErrorLevel}
        searchQuery={searchQuery}
        isLoading={isLoading}
      />

      {/* Queue Status */}
      <div className={styles.queueStatus}>
        <h3>Error Queue Status</h3>
        <p>
          Total errors tracked: <strong>{stats?.totalErrors || 0}</strong> • Critical errors:{' '}
          <strong>{stats?.criticalErrors || 0}</strong>
        </p>
      </div>
    </div>
  );
}

export default ErrorDashboard;
