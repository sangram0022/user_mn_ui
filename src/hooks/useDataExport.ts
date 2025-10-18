/**
 * Data Export Hook
 * Provides utilities for exporting data in various formats
 */

type ExportableData = Record<string, unknown>;

interface UseDataExportReturn {
  exportToCSV: (data: ExportableData[], filename: string) => void;
  exportToJSON: (data: ExportableData[], filename: string) => void;
  exportToTXT: (data: string, filename: string) => void;
}

/**
 * Convert array of objects to CSV string
 */
const convertToCSV = (data: ExportableData[]): string => {
  if (data.length === 0) return '';

  // Get headers
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  // Get rows
  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value ?? '');
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Download blob as file
 */
const downloadBlob = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Hook for exporting data in different formats
 *
 * @example
 * ```tsx
 * const { exportToCSV, exportToJSON } = useDataExport();
 *
 * const handleExport = () => {
 *   exportToCSV(users, 'users-export.csv');
 * };
 * ```
 */
export const useDataExport = (): UseDataExportReturn => {
  const exportToCSV = (data: ExportableData[], filename: string) => {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename.endsWith('.csv') ? filename : `${filename}.csv`);
  };

  const exportToJSON = (data: ExportableData[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    downloadBlob(blob, filename.endsWith('.json') ? filename : `${filename}.json`);
  };

  const exportToTXT = (data: string, filename: string) => {
    const blob = new Blob([data], { type: 'text/plain;charset=utf-8;' });
    downloadBlob(blob, filename.endsWith('.txt') ? filename : `${filename}.txt`);
  };

  return { exportToCSV, exportToJSON, exportToTXT };
};

export default useDataExport;
