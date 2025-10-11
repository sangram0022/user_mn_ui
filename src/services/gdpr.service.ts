/**
 * GDPR Compliance Service
 * Handles data export and account deletion requests
 */

import { API_ENDPOINTS } from '../config/api.config';
import { DeleteAccountRequest, DeleteAccountResponse, ExportDataRequest } from '../types/api.types';
import apiService from './api.service';

class GdprService {
  /**
   * Export user's personal data
   * @param data Export request parameters
   * @returns Blob containing exported data
   */
  async exportMyData(data: ExportDataRequest): Promise<Blob> {
    const response = await apiService.post(API_ENDPOINTS.GDPR.EXPORT_DATA, data, {
      responseType: 'blob',
    });
    return response as unknown as Blob;
  }

  /**
   * Delete user account (Right to Erasure)
   * @param data Deletion request with confirmation
   */
  async deleteMyAccount(data: DeleteAccountRequest): Promise<DeleteAccountResponse> {
    return apiService.delete<DeleteAccountResponse>(API_ENDPOINTS.GDPR.DELETE_ACCOUNT, { data });
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
