/**
 * Admin Audit Logs Service
 * API calls for audit log management and export
 * 
 * Endpoints implemented:
 * - GET  /api/v1/admin/audit-logs (list audit logs)
 * - GET  /api/v1/admin/export/audit-logs (export audit logs)
 */

import { apiClient } from '../../../services/api/apiClient';
import type {
  AuditLog,
  AuditLogFilters,
  AuditLogsResponse,
  ExportAuditLogsRequest,
} from '../types';

const API_PREFIX = '/api/v1/admin/audit-logs';

/**
 * Backend returns array with different field names (audit_id, user_id, etc.)
 * Frontend expects wrapped response with (log_id, actor.user_id, etc.)
 * This adapter handles both formats and normalizes field names
 */
function adaptAuditLogsResponse(response: unknown): AuditLogsResponse {
  // If it's already in the correct format, return as is
  if (response && typeof response === 'object' && 'logs' in response) {
    return response as AuditLogsResponse;
  }
  
  // If it's an array (backend returns array), wrap it in the expected response format
  if (Array.isArray(response)) {
    // Backend returns logs in the correct format already
    const logs: AuditLog[] = response as AuditLog[];

    return {
      logs,
      pagination: {
        page: 1,
        page_size: logs.length,
        total_items: logs.length,
        total_pages: 1,
        has_next: false,
        has_prev: false,
      },
      filters_applied: {},
      summary: {
        total_logs_in_period: logs.length,
        by_severity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0,
        },
        by_action: {},
      },
    };
  }
  
  // Fallback: empty response
  return {
    logs: [],
    pagination: {
      page: 1,
      page_size: 0,
      total_items: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false,
    },
    filters_applied: {},
    summary: {
      total_logs_in_period: 0,
      by_severity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      by_action: {},
    },
  };
}

// ============================================================================
// Audit Log Endpoints
// ============================================================================

/**
 * GET /api/v1/admin/audit-logs
 * List audit logs with filtering, pagination, and search
 */
export const getAuditLogs = async (filters?: AuditLogFilters): Promise<AuditLogsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, String(v)));
        } else {
          queryParams.append(key, String(value));
        }
      }
    });
  }
  
  const queryString = queryParams.toString();
  const url = queryString ? `${API_PREFIX}?${queryString}` : API_PREFIX;
  
  const response = await apiClient.get<AuditLogsResponse>(url);
  // Backend returns array with different field names, use adapter
  return adaptAuditLogsResponse(response.data);
};

/**
 * GET /api/v1/admin/export/audit-logs?format=csv
 * Export audit logs in various formats (CSV, JSON, PDF, XLSX)
 */
export const exportAuditLogs = async (
  request: ExportAuditLogsRequest
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', request.format);
  
  // Add filters to query params
  if (request.filters) {
    Object.entries(request.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await apiClient.get(
    `/api/v1/admin/export/audit-logs?${params.toString()}`,
    {
      responseType: 'blob',
    }
  );
  
  return response.data;
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get today's audit logs
 */
export const getTodaysLogs = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return getAuditLogs({
    start_date: today.toISOString(),
    sort_by: 'timestamp',
    sort_order: 'desc',
  });
};

/**
 * Get critical severity logs
 */
export const getCriticalLogs = (days: number = 7) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return getAuditLogs({
    start_date: startDate.toISOString(),
    severity: 'critical',
    sort_by: 'timestamp',
    sort_order: 'desc',
  });
};

/**
 * Get failed login attempts
 */
export const getFailedLoginAttempts = (hours: number = 24) => {
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hours);
  
  return getAuditLogs({
    start_date: startDate.toISOString(),
    action: 'login.failed',
    sort_by: 'timestamp',
    sort_order: 'desc',
  });
};

/**
 * Get user's action history
 */
export const getUserActionHistory = (userId: string, days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return getAuditLogs({
    actor_id: userId,
    start_date: startDate.toISOString(),
    page_size: 100,
    sort_by: 'timestamp',
    sort_order: 'desc',
  });
};

/**
 * Search audit logs
 */
export const searchAuditLogs = (searchTerm: string) => {
  return getAuditLogs({
    search: searchTerm,
    page_size: 100,
  });
};

/**
 * Export monthly audit logs
 */
export const exportMonthlyLogs = async (year: number, month: number, format: 'csv' | 'json' | 'xlsx' | 'pdf' = 'csv') => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return exportAuditLogs({
    format,
    filters: {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    },
  });
};

// Export all as default object
const adminAuditService = {
  getAuditLogs,
  exportAuditLogs,
  getTodaysLogs,
  getCriticalLogs,
  getFailedLoginAttempts,
  getUserActionHistory,
  searchAuditLogs,
  exportMonthlyLogs,
};

export default adminAuditService;
