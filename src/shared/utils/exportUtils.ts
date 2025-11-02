/**
 * Export Utilities - Single Responsibility Principle
 * Handles data export to various formats (CSV, JSON, Excel)
 * Following SOLID principles and clean code practices
 */

// ============================================================================
// Types
// ============================================================================

export type ExportFormat = 'csv' | 'json' | 'excel';

export interface ExportOptions {
  filename: string;
  data: unknown[];
  format: ExportFormat;
  headers?: string[];
}

// ============================================================================
// Core Export Functions (Single Responsibility)
// ============================================================================

/**
 * Main export function - delegates to specific format handlers
 * Open/Closed Principle: Easy to extend with new formats
 */
export function exportData(options: ExportOptions): void {
  const { format, data, filename, headers } = options;

  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  switch (format) {
    case 'csv':
      exportToCSV(data, filename, headers);
      break;
    case 'json':
      exportToJSON(data, filename);
      break;
    case 'excel':
      exportToExcel(data, filename, headers);
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

// ============================================================================
// CSV Export
// ============================================================================

/**
 * Export data to CSV format
 * Standard CSV with proper escaping and UTF-8 encoding
 */
function exportToCSV(data: unknown[], filename: string, headers?: string[]): void {
  const csvContent = generateCSV(data, headers);
  const blob = new Blob([csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  downloadFile(blob, `${filename}.csv`);
}

/**
 * Generate CSV content from data array
 * Handles proper escaping of special characters
 */
function generateCSV(data: unknown[], headers?: string[]): string {
  const rows: string[] = [];

  // Add headers if provided
  if (headers && headers.length > 0) {
    rows.push(headers.map(h => escapeCSVValue(h)).join(','));
  } else if (data.length > 0) {
    // Auto-generate headers from first object
    const firstItem = data[0] as Record<string, unknown>;
    rows.push(Object.keys(firstItem).map(k => escapeCSVValue(k)).join(','));
  }

  // Add data rows
  data.forEach(item => {
    const record = item as Record<string, unknown>;
    const values = Object.values(record).map(value => {
      if (value instanceof Date) {
        return escapeCSVValue(value.toISOString());
      }
      return escapeCSVValue(String(value ?? ''));
    });
    rows.push(values.join(','));
  });

  return rows.join('\n');
}

/**
 * Escape CSV value - wrap in quotes if contains special characters
 */
function escapeCSVValue(value: string): string {
  if (!value) return '""';
  
  // Check if value needs escaping
  const needsEscaping = /[",\n\r]/.test(value);
  
  if (needsEscaping) {
    // Escape double quotes by doubling them
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  
  return value;
}

// ============================================================================
// JSON Export
// ============================================================================

/**
 * Export data to JSON format
 * Pretty-printed for readability
 */
function exportToJSON(data: unknown[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { 
    type: 'application/json;charset=utf-8;' 
  });
  downloadFile(blob, `${filename}.json`);
}

// ============================================================================
// Excel Export (Tab-delimited with UTF-8 BOM)
// ============================================================================

/**
 * Export data to Excel-compatible format
 * Uses tab-delimited format with UTF-8 BOM for proper Excel import
 * This ensures correct encoding in Excel without additional import steps
 */
function exportToExcel(data: unknown[], filename: string, headers?: string[]): void {
  const excelContent = generateExcelContent(data, headers);
  
  // UTF-8 BOM ensures Excel recognizes encoding correctly
  const BOM = '\uFEFF';
  const contentWithBOM = BOM + excelContent;
  
  const blob = new Blob([contentWithBOM], { 
    type: 'application/vnd.ms-excel;charset=utf-8;' 
  });
  
  downloadFile(blob, `${filename}.xls`);
}

/**
 * Generate Excel-compatible content (tab-delimited)
 * Excel prefers tabs over commas for better cell separation
 */
function generateExcelContent(data: unknown[], headers?: string[]): string {
  const rows: string[] = [];
  const DELIMITER = '\t';

  // Add headers
  if (headers && headers.length > 0) {
    rows.push(headers.map(h => escapeExcelValue(h)).join(DELIMITER));
  } else if (data.length > 0) {
    const firstItem = data[0] as Record<string, unknown>;
    rows.push(Object.keys(firstItem).map(k => escapeExcelValue(k)).join(DELIMITER));
  }

  // Add data rows
  data.forEach(item => {
    const record = item as Record<string, unknown>;
    const values = Object.values(record).map(value => {
      if (value instanceof Date) {
        return escapeExcelValue(formatDateForExcel(value));
      }
      if (typeof value === 'number') {
        return String(value);
      }
      return escapeExcelValue(String(value ?? ''));
    });
    rows.push(values.join(DELIMITER));
  });

  return rows.join('\n');
}

/**
 * Escape value for Excel
 * Handle special characters and formulas
 */
function escapeExcelValue(value: string): string {
  if (!value) return '';
  
  // Prevent formula injection (security)
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  
  // Escape tabs and newlines
  return value
    .replace(/\t/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
}

/**
 * Format date for Excel
 * Excel-friendly date format
 */
function formatDateForExcel(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// ============================================================================
// File Download Utility (DRY - Don't Repeat Yourself)
// ============================================================================

/**
 * Trigger file download in browser
 * Works cross-browser with proper cleanup
 */
function downloadFile(blob: Blob, filename: string): void {
  // Create temporary URL for blob
  const url = window.URL.createObjectURL(blob);
  
  // Create temporary link element
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  
  // Revoke URL after a short delay to ensure download starts
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate filename with timestamp
 * Ensures unique filenames
 */
export function generateFilename(prefix: string): string {
  const timestamp = new Date().toISOString().split('T')[0];
  return `${prefix}-${timestamp}`;
}

/**
 * Validate export data
 * Throws error if data is invalid
 */
export function validateExportData(data: unknown[]): void {
  if (!Array.isArray(data)) {
    throw new Error('Export data must be an array');
  }
  
  if (data.length === 0) {
    throw new Error('No data to export');
  }
  
  if (typeof data[0] !== 'object' || data[0] === null) {
    throw new Error('Export data must contain objects');
  }
}

/**
 * Format data for export
 * Transforms complex objects to export-friendly format
 */
export function formatExportData<T extends Record<string, unknown>>(
  data: T[],
  fieldMapper?: Record<keyof T, string>
): Record<string, unknown>[] {
  return data.map(item => {
    const formatted: Record<string, unknown> = {};
    
    Object.entries(item).forEach(([key, value]) => {
      const displayKey = fieldMapper?.[key as keyof T] || key;
      
      if (value instanceof Date) {
        formatted[displayKey] = value.toLocaleDateString();
      } else if (typeof value === 'boolean') {
        formatted[displayKey] = value ? 'Yes' : 'No';
      } else if (Array.isArray(value)) {
        formatted[displayKey] = value.join(', ');
      } else {
        formatted[displayKey] = value;
      }
    });
    
    return formatted;
  });
}
