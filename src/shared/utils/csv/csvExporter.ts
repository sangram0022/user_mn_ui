/**
 * CSV Export Utility
 * Reusable CSV export functionality
 */

import type { AuditLog } from '@/domains/audit-logs/types/auditLog.types';

/**
 * Escape CSV field values
 */
function escapeCSVField(field: string | number): string {
  const stringValue = String(field);

  // Wrap in quotes if contains comma, newline, or quote
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    // Escape quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Convert audit logs to CSV format
 */
export function auditLogsToCSV(logs: AuditLog[]): string {
  if (logs.length === 0) {
    return '';
  }

  // CSV Header
  const headers = ['ID', 'Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address', 'Details'];
  const csvHeader = headers.join(',');

  // CSV Rows
  const csvRows = logs.map((log) =>
    [
      escapeCSVField(log.id),
      escapeCSVField(log.timestamp),
      escapeCSVField(log.user),
      escapeCSVField(log.action),
      escapeCSVField(log.resource),
      escapeCSVField(log.status),
      escapeCSVField(log.ipAddress),
      escapeCSVField(log.details),
    ].join(',')
  );

  return [csvHeader, ...csvRows].join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'audit-logs.csv'): void {
  // Add BOM for UTF-8 encoding (ensures proper encoding in Excel)
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });

  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up
  URL.revokeObjectURL(url);
}

/**
 * Export audit logs to CSV file
 */
export function exportAuditLogsToCSV(
  logs: AuditLog[],
  filename?: string,
  dateFrom?: string,
  dateTo?: string
): void {
  const csvContent = auditLogsToCSV(logs);

  if (!csvContent) {
    console.warn('No audit logs to export');
    return;
  }

  // Generate filename with date range if provided
  let finalFilename = filename || 'audit-logs.csv';
  if (dateFrom || dateTo) {
    const from = dateFrom ? dateFrom.split('-').slice(0, 3).join('-') : 'start';
    const to = dateTo ? dateTo.split('-').slice(0, 3).join('-') : 'end';
    finalFilename = `audit-logs_${from}_to_${to}.csv`;
  }

  downloadCSV(csvContent, finalFilename);
}

/**
 * Generate timestamp string for CSV filename
 */
export function getTimestampForFilename(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}
