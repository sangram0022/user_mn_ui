/**
 * Bulk Operations Service
 * Handles bulk user creation and validation operations
 */

import { API_ENDPOINTS } from '../config/api.config';
import { BulkCreateRequest, BulkOperationResponse } from '../types/api.types';
import apiService from './api.service';

class BulkService {
  /**
   * Create multiple users in bulk
   * @param data Bulk creation request with user items
   */
  async createUsers(data: BulkCreateRequest): Promise<BulkOperationResponse> {
    return apiService.post<BulkOperationResponse>(API_ENDPOINTS.BULK.CREATE_USERS, data);
  }

  /**
   * Validate user data before bulk creation
   * @param data Bulk creation request with user items to validate
   */
  async validateUsers(data: BulkCreateRequest): Promise<BulkOperationResponse> {
    return apiService.post<BulkOperationResponse>(API_ENDPOINTS.BULK.VALIDATE_USERS, data);
  }

  /**
   * Parse CSV file and convert to bulk user items
   * @param file CSV file containing user data
   * @returns Array of bulk user items
   */
  async parseCsvFile(file: File): Promise<BulkCreateRequest['items']> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const csv = event.target?.result as string;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map((h) => h.trim());

          const items = lines
            .slice(1)
            .filter((line) => line.trim())
            .map((line) => {
              const values = line.split(',').map((v) => v.trim());
              const item: unknown = {};

              headers.forEach((header, index) => {
                item[header] = values[index];
              });

              return item;
            });

          resolve(items);
        } catch {
          reject(new Error('Failed to parse CSV file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  /**
   * Download bulk operation results as CSV
   * @param result Bulk operation response
   * @param filename Output filename
   */
  downloadResultsAsCsv(result: BulkOperationResponse, filename: string = 'bulk-results.csv'): void {
    const headers = ['Status', 'Email', 'Error'];
    const rows = [headers.join(',')];

    // Add successful items
    for (let i = 0; i < result.successful; i++) {
      rows.push(`success,user${i}@example.com,`);
    }

    // Add failed items
    result.errors.forEach((error) => {
      rows.push(`failed,${error.email || 'unknown'},${error.message || 'Unknown error'}`);
    });

    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

export default new BulkService();
