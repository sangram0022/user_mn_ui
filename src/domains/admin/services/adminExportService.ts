/**
 * Admin Export Service
 * Handle exports for users, audit logs, and roles
 * 
 * Response Format:
 * Export endpoints return Blob (binary file data) directly.
 * Other endpoints follow ApiResponse<T> format.
 * 
 * Supported formats: CSV, Excel, JSON
 * 
 * Endpoints implemented:
 * - GET /api/v1/admin/export/users (export users to CSV/Excel/JSON)
 * - GET /api/v1/admin/export/audit-logs (export audit logs to CSV/Excel/JSON)
 * - GET /api/v1/admin/export/roles (export roles to CSV/Excel/JSON)
 * 
 * @see {ApiResponse} @/core/api/types
 */

import { apiDownload } from '@/core/api/apiHelpers';
import { API_PREFIXES } from '../../../services/api/common';

const API_PREFIX = API_PREFIXES.ADMIN_EXPORT;

export type ExportFormat = 'csv' | 'excel' | 'json';

export interface ExportFilters {
  // User export filters
  status?: string;
  role?: string;
  search?: string;
  
  // Audit log export filters
  action?: string;
  user_id?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
  
  // Date range
  date_from?: string;
  date_to?: string;
}

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export users to specified format
 * GET /api/v1/admin/export/users?format=csv
 */
export const exportUsers = async (
  format: ExportFormat = 'csv',
  filters?: ExportFilters
): Promise<Blob> => {
  const allFilters = {
    format,
    ...filters,
  };
  
  return apiDownload(`${API_PREFIX}/users`, allFilters as Record<string, unknown>);
};

/**
 * Export audit logs to specified format
 * GET /api/v1/admin/export/audit-logs?format=csv
 */
export const exportAuditLogs = async (
  format: ExportFormat = 'csv',
  filters?: ExportFilters
): Promise<Blob> => {
  const allFilters = {
    format,
    ...filters,
  };
  
  return apiDownload(`${API_PREFIX}/audit-logs`, allFilters as Record<string, unknown>);
};

/**
 * Export roles to specified format
 * GET /api/v1/admin/export/roles?format=csv
 */
export const exportRoles = async (
  format: ExportFormat = 'csv',
  filters?: ExportFilters
): Promise<Blob> => {
  const allFilters = {
    format,
    ...filters,
  };
  
  return apiDownload(`${API_PREFIX}/roles`, allFilters as Record<string, unknown>);
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Download blob as file
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Generate filename with timestamp
 */
export const generateExportFilename = (
  type: 'users' | 'audit-logs' | 'roles',
  format: ExportFormat
): string => {
  const timestamp = new Date().toISOString().split('T')[0];
  const extension = format === 'excel' ? 'xlsx' : format;
  return `${type}-export-${timestamp}.${extension}`;
};

// Export all as default object
const adminExportService = {
  exportUsers,
  exportAuditLogs,
  exportRoles,
  downloadBlob,
  generateExportFilename,
};

export default adminExportService;
