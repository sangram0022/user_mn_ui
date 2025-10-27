/**
 * GDPR Data Export Component
 *
 * Allows users to export their personal data in compliance with GDPR
 * Supports JSON and CSV formats
 *
 * Backend API: POST /profile/gdpr/export
 */

import { Info } from 'lucide-react';
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
    <div className="bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-primary)] rounded-lg shadow p-6">
      <div className="border-l-4 border-[var(--color-primary)] pl-4 mb-6">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
          Export Your Data
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
          Download a copy of all your personal data stored in our system. This includes your profile
          information, activity history, and more.
        </p>
      </div>

      <div className="space-y-6">
        {/* Format Selection */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-2">
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
                className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
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
                className="mr-2 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                CSV (spreadsheet-friendly)
              </span>
            </label>
          </div>
        </div>

        {/* Include Options */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-2">
            Include in Export
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeAuditLogs}
                onChange={(e) => setOptions({ ...options, includeAuditLogs: e.target.checked })}
                className="mr-2 text-[var(--color-primary)] focus:ring-[color:var(--color-primary)] rounded"
              />
              <span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                Audit logs (activity history)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.includeLoginHistory}
                onChange={(e) => setOptions({ ...options, includeLoginHistory: e.target.checked })}
                className="mr-2 text-[var(--color-primary)] focus:ring-[color:var(--color-primary)] rounded"
              />
              <span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                Login history
              </span>
            </label>
          </div>
        </div>

        {/* Export Button */}
        <div className="pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => exportData()}
            disabled={loading}
            className="btn btn-primary btn-lg w-full sm:w-auto"
          >
            {loading ? 'Preparing Export...' : 'Download My Data'}
          </button>
          <p className="mt-2 text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]">
            The export may take a few moments to prepare. Your download will start automatically
            when ready.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-[var(--color-primary-light)] dark:bg-[var(--color-primary)]/20 border border-[var(--color-primary)] dark:border-[var(--color-primary)] rounded-md p-4">
          <div className="flex">
            <Info
              className="icon-md text-[var(--color-primary)] dark:text-[var(--color-primary)] mr-2 flex-shrink-0"
              aria-hidden="true"
            />
            <div className="text-sm text-[var(--color-primary)] dark:text-[var(--color-primary)]">
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
