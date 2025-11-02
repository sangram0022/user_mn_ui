/**
 * Audit Log Filter Utilities
 * Reusable filtering functions for audit logs
 */

import type { AuditLog, AuditFilters } from '@/domains/audit-logs/types/auditLog.types';

/**
 * Filter audit logs based on criteria
 */
export function filterAuditLogs(logs: AuditLog[], filters: AuditFilters): AuditLog[] {
  return logs.filter((log) => {
    // Date range filter
    if (filters.dateFrom && filters.dateTo) {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      if (logDate < fromDate || logDate > toDate) {
        return false;
      }
    }

    // User filter
    if (filters.user && !log.user.toLowerCase().includes(filters.user.toLowerCase())) {
      return false;
    }

    // Action filter
    if (filters.action && log.action !== filters.action) {
      return false;
    }

    // Status filter
    if (filters.status !== 'all' && log.status !== filters.status) {
      return false;
    }

    return true;
  });
}

/**
 * Get unique users from audit logs
 */
export function getUniqueUsers(logs: AuditLog[]): string[] {
  const users = new Set<string>();
  logs.forEach((log) => {
    if (log.user) {
      users.add(log.user);
    }
  });
  return Array.from(users).sort();
}

/**
 * Get unique actions from audit logs
 */
export function getUniqueActions(logs: AuditLog[]): string[] {
  const actions = new Set<string>();
  logs.forEach((log) => {
    if (log.action) {
      actions.add(log.action);
    }
  });
  return Array.from(actions).sort();
}

/**
 * Sort audit logs by timestamp (newest first)
 */
export function sortByTimestamp(logs: AuditLog[]): AuditLog[] {
  return [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Get logs for a specific date range
 */
export function getLogsByDateRange(logs: AuditLog[], fromDate: string, toDate: string): AuditLog[] {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  return logs.filter((log) => {
    const logDate = new Date(log.timestamp);
    return logDate >= from && logDate <= to;
  });
}

/**
 * Get logs by status
 */
export function getLogsByStatus(
  logs: AuditLog[],
  status: 'success' | 'failed' | 'warning'
): AuditLog[] {
  return logs.filter((log) => log.status === status);
}

/**
 * Get logs by user
 */
export function getLogsByUser(logs: AuditLog[], user: string): AuditLog[] {
  return logs.filter((log) => log.user.toLowerCase() === user.toLowerCase());
}

/**
 * Get logs by action
 */
export function getLogsByAction(logs: AuditLog[], action: string): AuditLog[] {
  return logs.filter((log) => log.action === action);
}
