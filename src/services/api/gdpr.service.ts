/**
 * GDPR Compliance API Service
 * Reference: API_DOCUMENTATION_COMPLETE.md - GDPR Compliance APIs
 */

import { apiClient } from '@lib/api/client';
import type { GDPRDeleteResponse, GDPRExportResponse, GDPRExportStatus } from '@shared/types';
import { logger } from '@shared/utils/logger';

/**
 * GDPR Service
 * Handles GDPR-related operations for data export and account deletion
 * Implements GDPR Article 15 (Right of Access) and Article 17 (Right to Erasure)
 */
export class GDPRService {
  /**
   * Export User Data
   * POST /gdpr/export/my-data
   *
   * Export all personal data associated with the authenticated user.
   * Implements GDPR Article 15 - Right of Access
   *
   * @param options - Export options
   * @returns Export response with ID and status
   *
   * @example
   * const exportData = await gdprService.exportMyData({
   *   format: 'json',
   *   includeAuditLogs: true,
   *   includeMetadata: true
   * });
   */
  async exportMyData(options?: {
    format?: 'json' | 'csv';
    includeAuditLogs?: boolean;
    includeMetadata?: boolean;
  }): Promise<GDPRExportResponse> {
    try {
      logger.debug('[GDPRService] Requesting data export', { options });

      const response = await apiClient.requestGDPRExport();

      logger.info('[GDPRService] Data export request successful', {
        exportId: response.export_id,
      });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[GDPRService] Failed to request data export', error);
      } else {
        logger.error('[GDPRService] Failed to request data export');
      }
      throw error;
    }
  }

  /**
   * Check Export Status
   * GET /gdpr/export/status/{export_id}
   *
   * Check the status of a data export request.
   *
   * @param exportId - Export ID from export request
   * @returns Export status and download link (if complete)
   *
   * @example
   * const status = await gdprService.checkExportStatus('export-123');
   * if (status.status === 'completed') {
   *   window.location.href = status.download_url;
   * }
   */
  async checkExportStatus(exportId: string): Promise<GDPRExportStatus> {
    try {
      logger.debug('[GDPRService] Checking export status', { exportId });

      const status = await apiClient.getGDPRExportStatus(exportId);

      logger.info('[GDPRService] Export status retrieved', {
        exportId,
        status: status.status,
        progress: status.progress,
      });

      return status;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[GDPRService] Failed to check export status', error);
      } else {
        logger.error('[GDPRService] Failed to check export status');
      }
      throw error;
    }
  }

  /**
   * Delete Account (Right to Erasure)
   * DELETE /gdpr/delete/my-account
   *
   * Permanently delete user account and all personal data.
   * Implements GDPR Article 17 - Right to Erasure (Right to be Forgotten)
   *
   * **WARNING:** This action is PERMANENT and IRREVERSIBLE!
   *
   * @param password - Current password for confirmation
   * @param confirmation - Confirmation string (must be 'DELETE MY ACCOUNT' to confirm)
   * @param reason - Optional reason for deletion
   * @returns Deletion scheduled response
   *
   * @example
   * const result = await gdprService.deleteMyAccount(
   *   'CurrentPassword123!',
   *   'DELETE MY ACCOUNT',
   *   'No longer needed'
   * );
   * // Account will be deleted after 24-hour grace period
   */
  async deleteMyAccount(
    password: string,
    confirmation: string,
    reason?: string
  ): Promise<GDPRDeleteResponse> {
    try {
      logger.warn('[GDPRService] Account deletion requested');

      // Validate confirmation string for safety
      if (confirmation !== 'DELETE MY ACCOUNT') {
        throw new Error(
          'Invalid confirmation string. Must type exactly "DELETE MY ACCOUNT" to confirm.'
        );
      }

      const response = await apiClient.requestGDPRDelete({
        password,
        confirmation,
        reason,
      });

      logger.warn('[GDPRService] Account deletion scheduled', {
        userId: response.user_id,
        scheduledAt: response.deletion_scheduled_at,
      });

      return response;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[GDPRService] Failed to delete account', error);
      } else {
        logger.error('[GDPRService] Failed to delete account');
      }
      throw error;
    }
  }

  /**
   * Cancel Account Deletion
   *
   * Cancel a scheduled account deletion during the grace period.
   *
   * @returns Cancellation result
   *
   * @example
   * const result = await gdprService.cancelAccountDeletion();
   */
  async cancelAccountDeletion() {
    try {
      logger.info('[GDPRService] Cancelling account deletion');

      const result = await apiClient.execute('/gdpr/cancel-deletion', {
        method: 'POST',
      });

      logger.info('[GDPRService] Account deletion cancelled successfully');

      return result;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[GDPRService] Failed to cancel account deletion', error);
      } else {
        logger.error('[GDPRService] Failed to cancel account deletion');
      }
      throw error;
    }
  }

  /**
   * Get GDPR Compliance Status
   *
   * Check GDPR compliance status for current user.
   *
   * @returns GDPR status information
   *
   * @example
   * const status = await gdprService.getComplianceStatus();
   */
  async getComplianceStatus() {
    try {
      logger.debug('[GDPRService] Fetching GDPR compliance status');

      const status = await apiClient.execute('/gdpr/compliance-status');

      logger.info('[GDPRService] GDPR compliance status retrieved');

      return status;
    } catch (error) {
      if (error instanceof Error) {
        logger.error('[GDPRService] Failed to fetch compliance status', error);
      } else {
        logger.error('[GDPRService] Failed to fetch compliance status');
      }
      throw error;
    }
  }
}

export const gdprService = new GDPRService();

export default gdprService;
