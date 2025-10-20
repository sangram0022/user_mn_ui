/**
 * Admin Audit Log Page
 *
 * Comprehensive audit trail interface with advanced filtering and export capabilities.
 * Shows system activity, user actions, and security events.
 *
 * Integration Pattern (Step 4):
 * - Uses AuditLogFilters component for advanced filtering UI
 * - Uses useAuditLogFilters hook for client-side filtering and statistics
 * - Uses useApiCall hook for automatic loading states and error handling
 * - Client-side filtering for instant results (loads all logs)
 * - CSV export functionality for audit compliance
 *
 * React 19: No manual memoization needed - React Compiler optimizes automatically
 */

import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Download,
  Eye,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { useAuth } from '@domains/auth/context/AuthContext';
import { useApiCall } from '@hooks/useApiCall';
import { apiClient } from '@lib/api/client';
import { PageMetadata } from '@shared/components/PageMetadata';
import { Badge, getSeverityBadgeVariant } from '@shared/components/ui/Badge';
import { Skeleton } from '@shared/components/ui/Skeleton';
import type { AuditLog } from '@shared/types';
import type { AuditLogEntry } from '@shared/types/api-backend.types';
import Breadcrumb from '@shared/ui/Breadcrumb';
import { formatDateTime, formatTimestamp } from '@shared/utils';
import {
  AuditLogFilters,
  type AuditLogFilters as AuditLogFiltersType,
} from '../components/AuditLogFilters';
import {
  downloadAuditLogsAsCSV,
  getAuditLogStats,
  useAuditLogFilters,
} from '../hooks/useAuditLogFilters';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get icon for severity level
 */
const getSeverityIcon = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'error':
      return <AlertCircle className="w-3 h-3" />;
    case 'warning':
      return <AlertTriangle className="w-3 h-3" />;
    case 'info':
      return <Info className="w-3 h-3" />;
    case 'success':
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <Info className="w-3 h-3" />;
  }
};

// ============================================================================
// Sub-Components
// ============================================================================

interface AuditLogRowProps {
  log: AuditLogEntry;
  onViewDetails: (log: AuditLogEntry) => void;
}

function AuditLogRow({ log, onViewDetails }: AuditLogRowProps) {
  const { date, time } = formatTimestamp(log.timestamp);

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {date}
        <div className="text-xs text-gray-500 dark:text-gray-400">{time}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge
          variant={getSeverityBadgeVariant(log.severity)}
          icon={getSeverityIcon(log.severity)}
          size="sm"
          aria-label={`${log.severity} severity`}
        >
          {log.severity}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
        {log.action.replace(/_/g, ' ')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {log.resource_type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={log.outcome === 'success' ? 'success' : 'error'} size="sm">
          {log.outcome}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
        {log.user_id || <span className="text-gray-400 dark:text-gray-500">System</span>}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onViewDetails(log)}
          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded p-1"
          aria-label={`View details for ${log.action} on ${log.resource_type}`}
          title="View log details"
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
        </button>
      </td>
    </tr>
  );
}

interface DetailsModalProps {
  log: AuditLogEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

function DetailsModal({ log, isOpen, onClose }: DetailsModalProps) {
  if (!isOpen || !log) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 id="modal-title" className="text-lg font-medium text-gray-900 dark:text-white">
                Audit Log Details
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Audit ID
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {log.audit_id}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Severity
                  </h4>
                  <Badge
                    variant={getSeverityBadgeVariant(log.severity)}
                    icon={getSeverityIcon(log.severity)}
                    size="sm"
                  >
                    {log.severity}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Action
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {log.action.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Outcome
                  </h4>
                  <Badge variant={log.outcome === 'success' ? 'success' : 'error'} size="sm">
                    {log.outcome}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resource Type
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{log.resource_type}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Resource ID
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100">{log.resource_id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User ID
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {log.user_id || 'System'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Timestamp
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDateTime(log.timestamp)}
                  </p>
                </div>
              </div>

              {log.ip_address && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IP Address
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                    {log.ip_address}
                  </p>
                </div>
              )}

              {log.user_agent && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    User Agent
                  </h4>
                  <p className="text-sm text-gray-900 dark:text-gray-100 break-all">
                    {log.user_agent}
                  </p>
                </div>
              )}

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Metadata
                  </h4>
                  <pre className="text-sm text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-auto max-h-48">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function AdminAuditLogPage() {
  const { hasPermission } = useAuth();

  // State
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [filters, setFilters] = useState<AuditLogFiltersType>({
    dateFrom: '',
    dateTo: '',
    action: 'all',
    resourceType: 'all',
    severity: 'all',
    outcome: 'all',
    userId: '',
    sortOrder: 'desc',
  });
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // API calls with useApiCall hook
  const { loading, execute } = useApiCall<AuditLog[]>();

  // Client-side filtering and statistics
  const { filteredLogs, filteredCount, totalCount } = useAuditLogFilters({
    logs,
    filters,
  });

  const stats = getAuditLogStats(filteredLogs);

  // Check permissions
  const canViewAuditLogs = hasPermission('admin') || hasPermission('audit:read');

  // ============================================================================
  // Data Loading
  // ============================================================================

  const loadAuditLogs = async () => {
    if (!canViewAuditLogs) return;

    // Load all logs for client-side filtering (up to reasonable limit)
    const response = await execute(
      () =>
        apiClient.getAuditLogs({
          limit: 1000, // Load last 1000 logs
        }),
      {
        showErrorToast: true,
      }
    );

    if (response) {
      // Map AuditLog to AuditLogEntry format expected by filters
      const mappedLogs: AuditLogEntry[] = response.map((log: AuditLog) => ({
        audit_id: log.log_id,
        user_id: log.user_id,
        action: log.action as AuditLogEntry['action'],
        resource_type: log.resource,
        resource_id: log.resource_id,
        severity: 'info' as AuditLogEntry['severity'], // Default severity if not provided
        timestamp: log.timestamp,
        metadata: log.details || {},
        outcome: 'success' as AuditLogEntry['outcome'], // Default outcome if not provided
        ip_address: log.ip_address,
        user_agent: log.user_agent,
      }));
      setLogs(mappedLogs);
    }
  };

  // ============================================================================
  // Action Handlers
  // ============================================================================

  const handleFilterChange = (newFilters: AuditLogFiltersType) => {
    setFilters(newFilters);
  };

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log);
    setIsDetailsModalOpen(true);
  };

  const handleExportCSV = () => {
    const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    downloadAuditLogsAsCSV(filteredLogs, filename);
  };

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    loadAuditLogs();
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  if (!canViewAuditLogs) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <PageMetadata
          title="Access Denied"
          description="You do not have permission to view this page"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">
              You don&apos;t have permission to view audit logs
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMetadata
        title="Audit Logs"
        description="View and analyze system audit logs with advanced filtering"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Breadcrumb />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  System activity and security events
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleExportCSV}
                  disabled={filteredCount === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label="Export filtered audit logs to CSV"
                >
                  <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                  Export CSV
                </button>
                <button
                  onClick={loadAuditLogs}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  aria-label={loading ? 'Refreshing audit logs' : 'Refresh audit logs'}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Events
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {filteredCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <CheckCircle
                  className="w-8 h-8 text-green-600 dark:text-green-400"
                  aria-hidden="true"
                />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Success</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.successCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <AlertCircle
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Failures</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.failureCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center">
                <AlertTriangle
                  className="w-8 h-8 text-yellow-600 dark:text-yellow-400"
                  aria-hidden="true"
                />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Success Rate
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {stats.successRate}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <AuditLogFilters
            onFilterChange={handleFilterChange}
            totalCount={totalCount}
            filteredCount={filteredCount}
          />

          {/* Logs Table */}
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Audit Events ({filteredCount} of {totalCount})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Severity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Action
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Resource
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      Outcome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {loading ? (
                    Array.from({ length: 10 }, (_, i) => `skeleton-${i}`).map((key) => (
                      <tr key={key}>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-16" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-32" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-24" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-6 w-16" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-20" />
                        </td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-8" />
                        </td>
                      </tr>
                    ))
                  ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <AuditLogRow key={log.audit_id} log={log} onViewDetails={handleViewDetails} />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Activity
                          className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4"
                          aria-hidden="true"
                        />
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No audit logs found
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          No events match your current filter criteria.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        <DetailsModal
          log={selectedLog}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedLog(null);
          }}
        />
      </div>
    </>
  );
}
