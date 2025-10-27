/**
 * Audit Log Filters Hook
 *
 * Client-side filtering logic for audit logs
 * Filters logs by date range, action, resource, severity, outcome, user ID
 * Supports sorting by timestamp
 *
 * Performance optimized with useMemo for large datasets
 */

import { useMemo } from 'react';
import type { AuditLogEntry } from '../../../shared/types/api-complete.types';
import type { AuditLogFilters } from '../components/AuditLogFilters';

export interface UseAuditLogFiltersProps {
  logs: AuditLogEntry[];
  filters: AuditLogFilters;
}

export interface UseAuditLogFiltersReturn {
  filteredLogs: AuditLogEntry[];
  filteredCount: number;
  totalCount: number;
}

/**
 * Apply client-side filtering and sorting to audit logs
 *
 * @param logs - Original unfiltered audit logs from backend
 * @param filters - Current filter state
 * @returns Filtered and sorted audit logs with counts
 *
 * @example
 * ```typescript
 * const { filteredLogs, filteredCount, totalCount } = useAuditLogFilters({
 *   logs: allLogs,
 *   filters: currentFilters
 * });
 * ```
 */
export function useAuditLogFilters({
  logs,
  filters,
}: UseAuditLogFiltersProps): UseAuditLogFiltersReturn {
  const filteredLogs = useMemo(() => {
    let result = [...logs];

    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      result = result.filter((log) => new Date(log.timestamp) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      result = result.filter((log) => new Date(log.timestamp) <= toDate);
    }

    // Action filter
    if (filters.action !== 'all') {
      result = result.filter((log) => log.action === filters.action);
    }

    // Resource type filter
    if (filters.resourceType !== 'all') {
      result = result.filter((log) => log.resource_type === filters.resourceType);
    }

    // Severity filter
    if (filters.severity !== 'all') {
      result = result.filter((log) => log.severity === filters.severity);
    }

    // Outcome filter
    if (filters.outcome !== 'all') {
      result = result.filter((log) => log.outcome === filters.outcome);
    }

    // User ID filter
    if (filters.userId) {
      const userIdLower = filters.userId.toLowerCase();
      result = result.filter((log) => log.user_id?.toLowerCase().includes(userIdLower));
    }

    // Sorting by timestamp
    result.sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      const comparison = aTime - bTime;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [logs, filters]);

  return {
    filteredLogs,
    filteredCount: filteredLogs.length,
    totalCount: logs.length,
  };
}

/**
 * Export audit logs to CSV format
 * Includes all filtered logs with all fields
 *
 * @param logs - Filtered audit logs to export
 * @returns CSV content as string
 *
 * @example
 * ```typescript
 * const csvContent = exportAuditLogsToCSV(filteredLogs);
 * const blob = new Blob([csvContent], { type: 'text/csv' });
 * saveAs(blob, 'audit-logs.csv');
 * ```
 */
export function exportAuditLogsToCSV(logs: AuditLogEntry[]): string {
  const headers = [
    'Audit ID',
    'User ID',
    'Action',
    'Resource Type',
    'Resource ID',
    'Severity',
    'Outcome',
    'Timestamp',
    'IP Address',
    'User Agent',
    'Metadata',
  ];

  const rows = logs.map((log) => [
    log.audit_id,
    log.user_id,
    log.action,
    log.resource_type,
    log.resource_id,
    log.severity,
    log.outcome,
    log.timestamp,
    log.ip_address,
    log.user_agent,
    JSON.stringify(log.metadata),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download filtered audit logs as CSV file
 *
 * @param logs - Filtered audit logs to download
 * @param filename - Output filename (default: 'audit-logs.csv')
 *
 * @example
 * ```typescript
 * downloadAuditLogsAsCSV(filteredLogs, 'critical-errors.csv');
 * ```
 */
export function downloadAuditLogsAsCSV(logs: AuditLogEntry[], filename = 'audit-logs.csv'): void {
  const csvContent = exportAuditLogsToCSV(logs);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get summary statistics from filtered audit logs
 *
 * @param logs - Filtered audit logs
 * @returns Summary statistics
 *
 * @example
 * ```typescript
 * const stats = getAuditLogStats(filteredLogs);
 * console.log(`Success rate: ${stats.successRate}%`);
 * ```
 */
export function getAuditLogStats(logs: AuditLogEntry[]): {
  total: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  bySeverity: Record<string, number>;
  byAction: Record<string, number>;
  byOutcome: Record<string, number>;
} {
  const successCount = logs.filter((log) => log.outcome === 'success').length;
  const failureCount = logs.filter((log) => log.outcome === 'failure').length;

  const bySeverity: Record<string, number> = {};
  const byAction: Record<string, number> = {};
  const byOutcome: Record<string, number> = {};

  logs.forEach((log) => {
    // Count by severity
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;

    // Count by action
    byAction[log.action] = (byAction[log.action] || 0) + 1;

    // Count by outcome (skip nulls)
    if (log.outcome) {
      byOutcome[log.outcome] = (byOutcome[log.outcome] || 0) + 1;
    }
  });

  return {
    total: logs.length,
    successCount,
    failureCount,
    successRate: logs.length > 0 ? Math.round((successCount / logs.length) * 100) : 0,
    bySeverity,
    byAction,
    byOutcome,
  };
}
