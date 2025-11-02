/**
 * Audit Log Calculation Utilities
 * Reusable calculation functions for audit statistics
 */

import type { AuditLog, AuditStatistics } from '@/domains/audit-logs/types/auditLog.types';

/**
 * Calculate audit statistics from logs
 */
export function calculateAuditStatistics(logs: AuditLog[]): AuditStatistics {
  const total = logs.length;
  const successCount = logs.filter((log) => log.status === 'success').length;
  const failedCount = logs.filter((log) => log.status === 'failed').length;
  const warningCount = logs.filter((log) => log.status === 'warning').length;

  const successRate = total > 0 ? (successCount / total) * 100 : 0;

  return {
    totalLogs: total,
    successCount,
    failedCount,
    warningCount,
    successRate: Math.round(successRate * 10) / 10, // Round to 1 decimal place
  };
}

/**
 * Get status distribution percentages
 */
export function getStatusDistribution(logs: AuditLog[]): Record<string, number> {
  const stats = calculateAuditStatistics(logs);
  const total = stats.totalLogs;

  if (total === 0) {
    return { success: 0, failed: 0, warning: 0 };
  }

  return {
    success: Math.round((stats.successCount / total) * 100),
    failed: Math.round((stats.failedCount / total) * 100),
    warning: Math.round((stats.warningCount / total) * 100),
  };
}

/**
 * Get action frequency count
 */
export function getActionFrequency(logs: AuditLog[]): Record<string, number> {
  const frequency: Record<string, number> = {};

  logs.forEach((log) => {
    frequency[log.action] = (frequency[log.action] || 0) + 1;
  });

  return frequency;
}

/**
 * Get user activity count
 */
export function getUserActivityCount(logs: AuditLog[]): Record<string, number> {
  const activity: Record<string, number> = {};

  logs.forEach((log) => {
    activity[log.user] = (activity[log.user] || 0) + 1;
  });

  return activity;
}

/**
 * Get hourly trend data
 */
export function getHourlyTrend(
  logs: AuditLog[]
): Array<{ hour: number; count: number; successes: number; failures: number }> {
  const hourlyData: Record<
    number,
    { count: number; successes: number; failures: number }
  > = {};

  // Initialize 24 hours
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { count: 0, successes: 0, failures: 0 };
  }

  // Count logs by hour
  logs.forEach((log) => {
    const date = new Date(log.timestamp);
    const hour = date.getHours();

    if (hourlyData[hour]) {
      hourlyData[hour].count++;
      if (log.status === 'success') {
        hourlyData[hour].successes++;
      } else if (log.status === 'failed') {
        hourlyData[hour].failures++;
      }
    }
  });

  // Convert to array
  return Object.entries(hourlyData).map(([hour, data]) => ({
    hour: parseInt(hour, 10),
    ...data,
  }));
}

/**
 * Get daily trend data
 */
export function getDailyTrend(logs: AuditLog[]): Array<{ date: string; count: number }> {
  const dailyData: Record<string, number> = {};

  logs.forEach((log) => {
    const date = new Date(log.timestamp).toISOString().split('T')[0];
    dailyData[date] = (dailyData[date] || 0) + 1;
  });

  return Object.entries(dailyData)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Calculate average time between events (in seconds)
 */
export function getAverageTimeBetweenEvents(logs: AuditLog[]): number {
  if (logs.length < 2) {
    return 0;
  }

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let totalTime = 0;
  for (let i = 1; i < sortedLogs.length; i++) {
    const current = new Date(sortedLogs[i].timestamp).getTime();
    const previous = new Date(sortedLogs[i - 1].timestamp).getTime();
    totalTime += current - previous;
  }

  return Math.round(totalTime / (logs.length - 1) / 1000); // Convert to seconds
}
