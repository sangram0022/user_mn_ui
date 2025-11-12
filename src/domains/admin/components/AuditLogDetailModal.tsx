/**
 * AuditLogDetailModal Component
 * Shows detailed information about a single audit log entry
 */

import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import type { AuditLog, AuditSeverity } from '../types';

interface AuditLogDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  log: AuditLog | null;
}

const getSeverityBadge = (
  severity: AuditSeverity
): 'success' | 'info' | 'warning' | 'danger' => {
  switch (severity) {
    case 'critical':
      return 'danger';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    case 'low':
      return 'success';
    default:
      return 'info';
  }
};

const getActionIcon = (action: string): string => {
  if (action.includes('create')) return '➕';
  if (action.includes('update')) return '✏️';
  if (action.includes('delete')) return '🗑️';
  if (action.includes('approve')) return '✅';
  if (action.includes('reject')) return '❌';
  if (action.includes('login')) return '🔐';
  if (action.includes('logout')) return '🚪';
  return '📝';
};

const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

export default function AuditLogDetailModal({
  isOpen,
  onClose,
  log,
}: AuditLogDetailModalProps) {
  if (!isOpen || !log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="m-4 max-h-[90vh] w-full max-w-4xl animate-scale-in overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-900">Audit Log Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <span className="text-2xl">×</span>
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Summary */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Audit ID</p>
                <p className="font-mono text-sm text-gray-900">{log.audit_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Timestamp</p>
                <p className="text-sm text-gray-900">{formatTimestamp(log.timestamp)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Action</p>
                <p className="text-sm text-gray-900">
                  {getActionIcon(log.action)} {log.action}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Resource Type</p>
                <p className="text-sm text-gray-900">{log.resource_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Resource ID</p>
                <p className="font-mono text-sm text-gray-900">{log.resource_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Severity</p>
                <Badge variant={getSeverityBadge(log.severity)}>
                  {log.severity.toUpperCase()}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Outcome</p>
                <Badge variant={log.outcome === null ? 'secondary' : 'primary'}>
                  {log.outcome || 'N/A'}
                </Badge>
              </div>
            </div>
          </div>

          {/* User Information */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">User ID</p>
                <p className="font-mono text-sm text-gray-900">{log.user_id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">IP Address</p>
                <p className="font-mono text-sm text-gray-900">{log.ip_address}</p>
              </div>
              {log.user_agent && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">User Agent</p>
                  <p className="break-all text-sm text-gray-900">{log.user_agent}</p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata JSON */}
          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold text-gray-900">Metadata</h3>
              <pre className="overflow-auto rounded border border-gray-200 bg-gray-50 p-4 text-xs">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
