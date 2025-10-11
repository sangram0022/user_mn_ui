/**
 * Audit Service
 * Handles audit log queries and summary statistics
 */

import { API_ENDPOINTS } from '../config/api.config';
import { AuditLog, AuditLogQueryParams, AuditSummary, PaginatedResponse } from '../types/api.types';
import apiService from './api.service';

class AuditService {
  /**
   * Query audit logs with filters
   * @param params Query parameters for filtering audit logs
   */
  async getAuditLogs(params?: AuditLogQueryParams): Promise<PaginatedResponse<AuditLog>> {
    return apiService.get<PaginatedResponse<AuditLog>>(API_ENDPOINTS.AUDIT.LOGS, { params });
  }

  /**
   * Get audit summary statistics
   */
  async getAuditSummary(): Promise<AuditSummary> {
    return apiService.get<AuditSummary>(API_ENDPOINTS.AUDIT.SUMMARY);
  }

  /**
   * Get audit logs for a specific user
   * @param userId User ID to filter audit logs
   * @param params Additional query parameters
   */
  async getUserAuditLogs(
    userId: string,
    params?: Omit<AuditLogQueryParams, 'user_id'>
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.getAuditLogs({ ...params, user_id: userId });
  }

  /**
   * Get audit logs by action type
   * @param action Action type to filter
   * @param params Additional query parameters
   */
  async getAuditLogsByAction(
    action: string,
    params?: Omit<AuditLogQueryParams, 'action'>
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.getAuditLogs({ ...params, action });
  }

  /**
   * Get audit logs by severity
   * @param severity Severity level to filter
   * @param params Additional query parameters
   */
  async getAuditLogsBySeverity(
    severity: string,
    params?: Omit<AuditLogQueryParams, 'severity'>
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.getAuditLogs({ ...params, severity });
  }

  /**
   * Get audit logs within a date range
   * @param startDate Start date (ISO 8601)
   * @param endDate End date (ISO 8601)
   * @param params Additional query parameters
   */
  async getAuditLogsByDateRange(
    startDate: string,
    endDate: string,
    params?: Omit<AuditLogQueryParams, 'start_date' | 'end_date'>
  ): Promise<PaginatedResponse<AuditLog>> {
    return this.getAuditLogs({ ...params, start_date: startDate, end_date: endDate });
  }

  /**
   * Export audit logs as CSV
   * @param params Query parameters for filtering
   */
  async exportAuditLogs(params?: AuditLogQueryParams): Promise<Blob> {
    const response = await apiService.get(`${API_ENDPOINTS.AUDIT.LOGS}/export`, {
      params,
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }
}

export default new AuditService();
