/**
 * AuditLogTable Component
 * Displays audit logs in a table format with stats
 */

import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
import type { AuditLog, AuditSeverity } from '../types';

interface AuditLogTableProps {
  logs: AuditLog[];
  totalLogs: number;
  onViewDetails: (log: AuditLog) => void;
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

export default function AuditLogTable({
  logs,
  totalLogs,
  onViewDetails,
}: AuditLogTableProps) {
  const criticalCount = logs.filter((log) => log.severity === 'critical').length;
  const highCount = logs.filter((log) => log.severity === 'high').length;
  const failedLoginsCount = logs.filter((log) => log.action === 'login.failed').length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-1 text-sm text-gray-600">Total Logs</div>
          <div className="text-3xl font-bold text-gray-900">{totalLogs}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-1 text-sm text-gray-600">Critical</div>
          <div className="text-3xl font-bold text-red-600">{criticalCount}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-1 text-sm text-gray-600">High</div>
          <div className="text-3xl font-bold text-orange-600">{highCount}</div>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <div className="mb-1 text-sm text-gray-600">Failed Logins</div>
          <div className="text-3xl font-bold text-yellow-600">{failedLoginsCount}</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Timestamp
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  User ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Resource Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Resource ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Severity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Outcome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center">
                    <p className="text-sm text-gray-500">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.audit_id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <span className="flex items-center gap-2">
                        <span>{getActionIcon(log.action)}</span>
                        <span className="text-gray-900">{log.action}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="text-gray-900">{log.user_id}</div>
                      <div className="text-xs text-gray-500">{log.ip_address}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                      {log.resource_type}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {log.resource_id || 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Badge variant={getSeverityBadge(log.severity)}>
                        {log.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Badge variant={log.outcome === null ? 'secondary' : 'primary'}>
                        {log.outcome || 'N/A'}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(log)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
