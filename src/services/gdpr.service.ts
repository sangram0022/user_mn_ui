/**
 * GDPR Compliance Service
 * Handles data export and account deletion requests
 * Refactored to use unified apiClient from lib/api/client.ts
 */

import { API_ENDPOINTS } from '@config/api.config';
import { apiClient } from '@lib/api/client';
import type {
  DeleteAccountRequest,
  DeleteAccountResponse,
  ExportDataRequest,
} from '../types/api.types';

class GdprService {
  /**
   * Export user's personal data
   * @param data Export request parameters
   * @returns Blob containing exported data
   */
  async exportMyData(data: ExportDataRequest): Promise<Blob> {
    // Use apiClient.execute with custom handling for blob response
    const url = `${API_ENDPOINTS.GDPR.EXPORT_DATA}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('access_token') || ''}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Delete user account (Right to Erasure)
   * @param data Deletion request with confirmation
   */
  async deleteMyAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    return apiClient.execute<DeleteAccountResponse>(API_ENDPOINTS.GDPR.DELETE_ACCOUNT, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  /**
   * Download exported data file
   * @param blob Blob containing exported data
   * @param format Export format (json or csv)
   */
  downloadExportedData(blob: Blob, format: 'json' | 'csv' = 'json'): void {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `my-data-export-${timestamp}.${format}`;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.setAttribute('aria-label', `Download ${filename}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Request data export and automatically download
   * @param options Export options
   */
  async exportAndDownload(options: ExportDataRequest): Promise<void> {
    const blob = await this.exportMyData(options);
    this.downloadExportedData(blob, options.format);
  }

  /**
   * Validate deletion confirmation text
   * @param confirmation User-entered confirmation text
   */
  validateDeletionConfirmation(confirmation: string): boolean {
    return confirmation.trim().toUpperCase() === 'DELETE MY ACCOUNT';
  }

  /**
   * Get GDPR compliance information
   */
  getComplianceInfo(): {
    rightToAccess: string;
    rightToErasure: string;
    dataRetention: string;
  } {
    return {
      rightToAccess: 'You have the right to access your personal data at any time.',
      rightToErasure: 'You have the right to request deletion of your account and data.',
      dataRetention: 'Data is retained according to legal requirements and business needs.',
    };
  }
}

export default new GdprService();
