/**
 * AuditLogExportModal Component
 * Modal for exporting audit logs in various formats
 */

import Button from '@/shared/components/ui/Button';
import type { ExportFormat } from '../types';

const EXPORT_FORMATS: ExportFormat[] = ['csv', 'json', 'xlsx', 'pdf'];

interface AuditLogExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  exportFormat: ExportFormat;
  setExportFormat: (format: ExportFormat) => void;
  isExporting: boolean;
  activeFiltersCount: number;
}

export default function AuditLogExportModal({
  isOpen,
  onClose,
  onExport,
  exportFormat,
  setExportFormat,
  isExporting,
  activeFiltersCount,
}: AuditLogExportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="m-4 w-full max-w-md animate-scale-in rounded-lg bg-white shadow-xl">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Export Audit Logs</h2>
        </div>

        <div className="space-y-4 p-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Export Format
            </label>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {EXPORT_FORMATS.map((format) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              {activeFiltersCount > 0 ? (
                <>
                  Export will include logs matching current filters ({activeFiltersCount}{' '}
                  active).
                </>
              ) : (
                'Export will include all audit logs.'
              )}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={onExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>
    </div>
  );
}
