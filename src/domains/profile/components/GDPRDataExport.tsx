/**
 * GDPR Data Export Component
 *
 * Allows users to export their personal data in compliance with GDPR
 * Supports JSON and CSV formats
 *
 * Backend API: POST /profile/gdpr/export
 */

import { useState } from 'react';
import { useAsyncOperation } from '../../../hooks/useAsyncOperation';
import { useToast } from '../../../hooks/useToast';
import { apiClient } from '../../../lib/api/client';
import type { GDPRExportResponse } from '../../../shared/types/api-backend.types';
import { getDisplayErrorMessage } from '../../../shared/utils/errorMapper';

type ExportFormat = 'json' | 'csv';

interface ExportOptions {
  format: ExportFormat;
  includeAuditLogs: boolean;
  includeLoginHistory: boolean;
}

export function GDPRDataExport() {
  const { toast } = useToast();
  const [options, setOptions] = useState<ExportOptions>({
    format: 'json',
    includeAuditLogs: true,
    includeLoginHistory: true,
  });

  const { execute: exportData, loading } = useAsyncOperation<GDPRExportResponse>(
    async () => {
      const response = await apiClient.post<GDPRExportResponse>(apiClient.endpoints.GDPR_EXPORT, {
        format: options.format,
        include_audit_logs: options.includeAuditLogs,
        include_login_history: options.includeLoginHistory,
      });
      return response;
    },
    {
      onSuccess: (data) => {
        // Download the exported data
        downloadExport(data, options.format);
        toast({
          type: 'success',
          message: 'Your data has been exported successfully.',
        });
      },
      onError: (error) => {
        toast({
          type: 'error',
          message: getDisplayErrorMessage(error),
        });
      },
    }
  );

  const downloadExport = (data: GDPRExportResponse, format: ExportFormat) => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `gdpr-export-${timestamp}.${format}`;

    let content: string;
    let mimeType: string;

    if (format === 'json') {
      content = JSON.stringify(data.data, null, 2);
      mimeType = 'application/json';
    } else {
      // CSV format - flatten the data structure
      content = convertToCSV(data.data);
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: Record<string, unknown>): string => {
    const lines: string[] = ['Section,Key,Value'];

    const flattenObject = (obj: unknown, section = ''): void => {
      if (typeof obj !== 'object' || obj === null) {
        lines.push(`"${section}","","${String(obj).replace(/"/g, '""')}"`);
        return;
      }

      Object.entries(obj).forEach(([key, value]) => {
        const newSection = section ? `${section}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenObject(value, newSection);
        } else if (Array.isArray(value)) {
          lines.push(`"${newSection}","","${value.length} items"`);
        } else {
          lines.push(`"${newSection}","${key}","${String(value).replace(/"/g, '""')}"`);
        }
      });
    };

    flattenObject(data);
    return lines.join('\n');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="border-l-4 border-blue-500 pl-4 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Export Your Data
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Download a copy of all your personal data stored in our system. This includes your profile
          information, activity history, and more.
        </p>
      </div>

      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Export Format
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="json"
                checked={options.format === 'json'}
                onChange={(e) => setOptions({ ...options, format: e.target.value as ExportFormat })}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                JSON (machine-readable)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="format"
                value="csv"
                checked={options.format === 'csv'}
                onChange={(e) => setOptions({ ...options, format: e.target.value as ExportFormat })}
                className="mr-2 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                CSV (spreadsheet-friendly)
              </span>
            </label>
          </div>
        </div>

        {/* Include Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Include in Export
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeAuditLogs}
                onChange={(e) => setOptions({ ...options, includeAuditLogs: e.target.checked })}
                className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Audit logs (activity history)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeLoginHistory}
                onChange={(e) => setOptions({ ...options, includeLoginHistory: e.target.checked })}
                className="mr-2 text-blue-600 focus:ring-blue-500 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Login history</span>
            </label>
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => exportData()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Preparing Export...' : 'Download My Data'}
          </button>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            The export may take a few moments to prepare. Your download will start automatically
            when ready.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-medium mb-1">About GDPR Data Export</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>This export includes all personal data we store about you</li>
                <li>The export is generated in real-time and is always up-to-date</li>
                <li>You can export your data as many times as you need</li>
                <li>This is your right under GDPR Article 20 (Data Portability)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
