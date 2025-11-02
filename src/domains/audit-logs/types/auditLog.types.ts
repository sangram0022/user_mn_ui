/**
 * Audit Log Types
 * Centralized type definitions for audit logging
 */

/**
 * Audit log entry
 */
export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'failed' | 'warning';
  ipAddress: string;
  details: string;
  userId?: string;
}

/**
 * Audit log filters
 */
export interface AuditFilters {
  dateFrom: string;
  dateTo: string;
  user: string;
  action: string;
  status: 'all' | 'success' | 'failed' | 'warning';
}

/**
 * Audit statistics
 */
export interface AuditStatistics {
  totalLogs: number;
  successCount: number;
  failedCount: number;
  warningCount: number;
  successRate: number;
}

/**
 * Paginated audit logs response
 */
export interface PaginatedAuditLogs {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}
