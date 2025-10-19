/**
 * Audit Service
 * Handles audit log queries and summary statistics
 * Refactored to use unified apiClient from lib/api/client.ts
 */

import { API_ENDPOINTS } from '@config/api.config';
import { apiClient } from '@lib/api/client';
import type {
  AuditLog,
  AuditLogQueryParams,
  AuditSummary,
  PaginatedResponse,
} from '../types/api.types';

class AuditService {
  /**
   * Query audit logs with filters
   * @param params Query parameters for filtering audit logs
   */
  async getAuditLogs(params?: AuditLogQueryParams): Promise<PaginatedResponse<AuditLog>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    const path = query ? `${API_ENDPOINTS.AUDIT.LOGS}?${query}` : API_ENDPOINTS.AUDIT.LOGS;

    return apiClient.execute<PaginatedResponse<AuditLog>>(path);
  }

  /**
   * Get audit summary statistics
   */
  async getAuditSummary(): Promise<AuditSummary> {
    return apiClient.execute<AuditSummary>(API_ENDPOINTS.AUDIT.SUMMARY);
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
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
    }

    const query = searchParams.toString();
    const path = query
      ? `${API_ENDPOINTS.AUDIT.LOGS}/export?${query}`
      : `${API_ENDPOINTS.AUDIT.LOGS}/export`;

    // Fetch blob response directly
    const response = await fetch(path, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }
}

export default new AuditService();
