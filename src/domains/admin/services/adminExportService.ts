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

import { apiClient } from '../../../services/api/apiClient';
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
  const params = new URLSearchParams();
  params.append('format', format);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await apiClient.get(`${API_PREFIX}/users?${params.toString()}`, {
    responseType: 'blob',
  });
  
  return response.data;
};

/**
 * Export audit logs to specified format
 * GET /api/v1/admin/export/audit-logs?format=csv
 */
export const exportAuditLogs = async (
  format: ExportFormat = 'csv',
  filters?: ExportFilters
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', format);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await apiClient.get(`${API_PREFIX}/audit-logs?${params.toString()}`, {
    responseType: 'blob',
  });
  
  return response.data;
};

/**
 * Export roles to specified format
 * GET /api/v1/admin/export/roles?format=csv
 */
export const exportRoles = async (
  format: ExportFormat = 'csv',
  filters?: ExportFilters
): Promise<Blob> => {
  const params = new URLSearchParams();
  params.append('format', format);
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }
  
  const response = await apiClient.get(`${API_PREFIX}/roles?${params.toString()}`, {
    responseType: 'blob',
  });
  
  return response.data;
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
