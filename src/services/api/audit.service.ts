/**
 * Audit Logging API Service
 * Reference: API_DOCUMENTATION_COMPLETE.md - Audit Logging APIs
 */

import { apiClient } from '@lib/api/client';
import type { AuditLog, AuditLogsQuery, AuditSummary } from '@shared/types';
import { logger } from '@shared/utils/logger';

/**
 * Audit Service
 * Handles audit logging and compliance tracking
 */
export class AuditService {
  /**
   * Query Audit Logs
   * GET /audit/logs
   *
   * Retrieve audit logs with advanced filtering and pagination.
   *
   * @param params - Query parameters for filtering and pagination
   * @returns Array of audit logs
   *
   * @example
   * const logs = await auditService.getAuditLogs({
   *   skip: 0,
   *   limit: 20,
   *   user_id: 'user-123',
   *   action: 'UPDATE_PROFILE',
   *   start_date: '2025-10-01T00:00:00Z',
   *   end_date: '2025-10-31T23:59:59Z'
   * });
   */
  async getAuditLogs(params?: AuditLogsQuery): Promise<AuditLog[]> {
    try {
      logger.debug('[AuditService] Fetching audit logs', { params });

      const logs = await apiClient.getAuditLogs(params);

      logger.info('[AuditService] Audit logs fetched successfully', {
        count: logs.length,
      });

      return logs;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuditService] Failed to fetch audit logs', error);
      } else {
        logger.error('[AuditService] Failed to fetch audit logs');
      }
      throw error;
    }
  }

  /**
   * Get Audit Summary
   * GET /audit/summary
   *
   * Retrieve aggregate audit statistics and summary.
   *
   * @param options - Summary options
   * @returns Audit summary data
   *
   * @example
   * const summary = await auditService.getAuditSummary({
   *   startDate: '2025-10-01T00:00:00Z',
   *   endDate: '2025-10-31T23:59:59Z',
   *   groupBy: 'action'
   * });
   */
  async getAuditSummary(options?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'action' | 'user_id' | 'resource_type';
  }): Promise<AuditSummary> {
    try {
      logger.debug('[AuditService] Fetching audit summary', { options });

      const summary = await apiClient.getAuditSummary();

      logger.info('[AuditService] Audit summary fetched successfully', {
        totalLogs: summary.total_logs,
        securityEvents: summary.security_events,
      });

      return summary;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuditService] Failed to fetch audit summary', error);
      } else {
        logger.error('[AuditService] Failed to fetch audit summary');
      }
      throw error;
    }
  }

  /**
   * Get Logs by User
   *
   * Retrieve all audit logs for a specific user.
   *
   * @param userId - User ID to filter by
   * @param params - Additional query parameters
   * @returns Array of audit logs for the user
   *
   * @example
   * const userLogs = await auditService.getLogsByUser('user-123', { limit: 50 });
   */
  async getLogsByUser(userId: string, params?: Partial<AuditLogsQuery>): Promise<AuditLog[]> {
    try {
      logger.debug('[AuditService] Fetching logs for user', { userId });

      const logs = await this.getAuditLogs({
        user_id: userId,
        ...params,
      });

      logger.info('[AuditService] User logs fetched successfully', {
        userId,
        count: logs.length,
      });

      return logs;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuditService] Failed to fetch user logs', error);
      } else {
        logger.error('[AuditService] Failed to fetch user logs');
      }
      throw error;
    }
  }

  /**
   * Get Logs by Action
   *
   * Retrieve all audit logs for a specific action type.
   *
   * @param action - Action type to filter by
   * @param params - Additional query parameters
   * @returns Array of audit logs for the action
   *
   * @example
   * const deleteLogs = await auditService.getLogsByAction('DELETE_USER');
   */
  async getLogsByAction(action: string, params?: Partial<AuditLogsQuery>): Promise<AuditLog[]> {
    try {
      logger.debug('[AuditService] Fetching logs for action', { action });

      const logs = await this.getAuditLogs({
        action,
        ...params,
      });

      logger.info('[AuditService] Action logs fetched successfully', {
        action,
        count: logs.length,
      });

      return logs;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuditService] Failed to fetch action logs', error);
      } else {
        logger.error('[AuditService] Failed to fetch action logs');
      }
      throw error;
    }
  }

  /**
   * Get Logs by Date Range
   *
   * Retrieve audit logs for a specific date range.
   *
   * @param startDate - Start date (ISO 8601 format)
   * @param endDate - End date (ISO 8601 format)
   * @param params - Additional query parameters
   * @returns Array of audit logs in date range
   *
   * @example
   * const logs = await auditService.getLogsByDateRange(
   *   '2025-10-01T00:00:00Z',
   *   '2025-10-31T23:59:59Z'
   * );
   */
  async getLogsByDateRange(
    startDate: string,
    endDate: string,
    params?: Partial<AuditLogsQuery>
  ): Promise<AuditLog[]> {
    try {
      logger.debug('[AuditService] Fetching logs for date range', { startDate, endDate });

      const logs = await this.getAuditLogs({
        start_date: startDate,
        end_date: endDate,
        ...params,
      });

      logger.info('[AuditService] Date range logs fetched successfully', {
        count: logs.length,
        dateRange: `${startDate} to ${endDate}`,
      });

      return logs;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuditService] Failed to fetch date range logs', error);
      } else {
        logger.error('[AuditService] Failed to fetch date range logs');
      }
      throw error;
    }
  }

  /**
   * Get Failed Logs
   *
   * Retrieve all failed audit logs (errors/failures).
   *
   * @param params - Additional query parameters
   * @returns Array of failed audit logs
   *
   * @example
   * const failedLogs = await auditService.getFailedLogs({ limit: 100 });
   */
  async getFailedLogs(params?: Partial<AuditLogsQuery>): Promise<AuditLog[]> {
    try {
      logger.debug('[AuditService] Fetching failed logs');

      const logs = await this.getAuditLogs({
        action: 'ERROR',
        ...params,
      });

      logger.info('[AuditService] Failed logs fetched successfully', {
        count: logs.length,
      });

      return logs;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuditService] Failed to fetch failed logs', error);
      } else {
        logger.error('[AuditService] Failed to fetch failed logs');
      }
      throw error;
    }
  }

  /**
   * Export Audit Logs
   *
   * Export audit logs to file (JSON or CSV format).
   *
   * @param format - Export format ('json' or 'csv')
   * @param params - Query parameters for filtering
   * @returns Exported file content or download URL
   *
   * @example
   * const csv = await auditService.exportAuditLogs('csv', {
   *   start_date: '2025-10-01T00:00:00Z',
   *   end_date: '2025-10-31T23:59:59Z'
   * });
   */
  async exportAuditLogs(
    format: 'json' | 'csv' = 'json',
    params?: Partial<AuditLogsQuery>
  ): Promise<Blob | string> {
    try {
      logger.debug('[AuditService] Exporting audit logs', { format });

      const logs = await this.getAuditLogs(params);

      if (format === 'json') {
        const jsonBlob = new Blob([JSON.stringify(logs, null, 2)], {
          type: 'application/json',
        });
        return jsonBlob;
      } else if (format === 'csv') {
        // Convert to CSV
        const headers = [
          'Log ID',
          'Timestamp',
          'User ID',
          'Action',
          'Resource',
          'Resource ID',
          'IP Address',
        ];
        const rows = logs.map((log) => [
          log.log_id,
          log.timestamp,
          log.user_id,
          log.action,
          log.resource,
          log.resource_id,
          log.ip_address,
        ]);

        const csvContent = [
          headers.join(','),
          ...rows.map((row) =>
            row
              .map((cell) =>
                typeof cell === 'string' && cell.includes(',')
                  ? `"${cell.replace(/"/g, '""')}"`
                  : cell
              )
              .join(',')
          ),
        ].join('\n');

        const csvBlob = new Blob([csvContent], { type: 'text/csv' });
        return csvBlob;
      }

      throw new Error(`Unsupported export format: ${format}`);
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuditService] Failed to export audit logs', error);
      } else {
        logger.error('[AuditService] Failed to export audit logs');
      }
      throw error;
    }
  }

  /**
   * Get Compliance Report
   *
   * Generate compliance report based on audit logs.
   *
   * @param reportType - Type of compliance report
   * @returns Compliance report data
   *
   * @example
   * const report = await auditService.getComplianceReport('gdpr');
   */
  async getComplianceReport(reportType: 'gdpr' | 'audit' | 'security' = 'audit') {
    try {
      logger.debug('[AuditService] Generating compliance report', { reportType });

      const summary = await this.getAuditSummary();

      logger.info('[AuditService] Compliance report generated successfully', { reportType });

      return {
        reportType,
        generatedAt: new Date().toISOString(),
        summary,
      };
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[AuditService] Failed to generate compliance report', error);
      } else {
        logger.error('[AuditService] Failed to generate compliance report');
      }
      throw error;
    }
  }
}

export const auditService = new AuditService();

export default auditService;
