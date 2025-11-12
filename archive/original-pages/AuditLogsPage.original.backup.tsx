import { useState, useEffect } from 'react';
import { useAuditLogs, useExportAuditLogs } from '../hooks';
import type {
  AuditLogFilters,
  AuditSeverity,
  ExportFormat,
  AuditLog,
} from '../types';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';
import ErrorAlert from '../../../shared/components/ui/ErrorAlert';

const SEVERITY_OPTIONS: AuditSeverity[] = ['low', 'medium', 'high', 'critical'];
const EXPORT_FORMATS: ExportFormat[] = ['csv', 'json', 'xlsx', 'pdf'];

const ACTION_OPTIONS = [
  'user.create',
  'user.update',
  'user.delete',
  'user.approve',
  'user.reject',
  'role.create',
  'role.update',
  'role.delete',
  'login.success',
  'login.failed',
  'logout',
];

const RESOURCE_OPTIONS = [
  'users',
  'roles',
  'analytics',
  'audit_logs',
  'settings',
  'reports',
  'notifications',
];

const PAGE_SIZE = 10;
const REAL_TIME_REFRESH_INTERVAL = 5000; // 5 seconds

export default function AuditLogsPage() {
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);

  // Filter states
  const [filters, setFilters] = useState<AuditLogFilters>({});
  
  // Search state - separate input from applied search
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');

  // Modal states
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('csv');

  // Real-time monitoring
  const [realTimeMode, setRealTimeMode] = useState(false);

  // Fetch audit logs - use appliedSearch instead of direct searchTerm
  const {
    data: logsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAuditLogs({
    ...filters,
    search: appliedSearch || undefined,
    page,
    page_size: pageSize,
  });

  const { mutate: exportLogs, isPending: isExporting } = useExportAuditLogs();

  // Real-time monitoring effect
  useEffect(() => {
    if (!realTimeMode) return;

    const interval = setInterval(() => {
      refetch();
    }, REAL_TIME_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [realTimeMode, refetch]);

  // Helper functions
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

  // Handlers
  const handleFilterChange = (
    key: keyof AuditLogFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filter changes
  };

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    setPage(1); // Reset to first page when searching
  };

  const handleClearFilters = () => {
    setFilters({});
    setSearchInput('');
    setAppliedSearch('');
    setPage(1);
  };

  const handleQuickFilter = (type: 'today' | 'critical' | 'failed_logins') => {
    if (type === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      handleFilterChange('start_date', today.toISOString());
    } else if (type === 'critical') {
      handleFilterChange('severity', 'critical');
    } else if (type === 'failed_logins') {
      setFilters({
        action: 'login.failed',
      });
      setPage(1);
    }
  };

  const handleExport = () => {
    exportLogs(
      { 
        format: exportFormat, 
        filters: {
          ...filters,
          search: appliedSearch || undefined,
        }
      },
      {
        onSuccess: (data) => {
          // File download is handled automatically by the hook
          if (data.success) {
            setShowExportModal(false);
          }
        },
      }
    );
  };

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const formatTimestamp = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate pagination info
  const totalPages = logsData?.pagination?.total_pages || 1;
  const totalLogs = logsData?.pagination?.total_items || 0;
  const startIndex = ((logsData?.pagination?.page || 1) - 1) * (logsData?.pagination?.page_size || pageSize);
  const endIndex = startIndex + (logsData?.logs?.length || 0);

  // Count active filters - include appliedSearch
  const activeFiltersCount = Object.keys(filters).length + (appliedSearch ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-sm text-gray-600 mt-1">
            Monitor and review system activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={realTimeMode}
              onChange={(e) => setRealTimeMode(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              Real-time monitoring {realTimeMode && '(5s refresh)'}
            </span>
          </label>
          <Button
            variant="secondary"
            onClick={() => setShowExportModal(true)}
            disabled={isExporting}
          >
            Export Logs
          </Button>
          <Button variant="secondary" onClick={() => refetch()}>
            🔄 Refresh
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('today')}
        >
          Today's Logs
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('critical')}
        >
          Critical Only
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('failed_logins')}
        >
          Failed Logins
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Clear All Filters ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Advanced Filters
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={filters.start_date?.slice(0, 16) || ''}
              onChange={(e) =>
                handleFilterChange(
                  'start_date',
                  e.target.value ? new Date(e.target.value).toISOString() : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="datetime-local"
              value={filters.end_date?.slice(0, 16) || ''}
              onChange={(e) =>
                handleFilterChange(
                  'end_date',
                  e.target.value ? new Date(e.target.value).toISOString() : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Action */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <select
              value={filters.action || ''}
              onChange={(e) =>
                handleFilterChange('action', e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Actions</option>
              {ACTION_OPTIONS.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>

          {/* Resource */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resource
            </label>
            <select
              value={filters.resource || ''}
              onChange={(e) =>
                handleFilterChange('resource', e.target.value || undefined)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Resources</option>
              {RESOURCE_OPTIONS.map((resource) => (
                <option key={resource} value={resource}>
                  {resource}
                </option>
              ))}
            </select>
          </div>

          {/* Severity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={filters.severity || ''}
              onChange={(e) =>
                handleFilterChange(
                  'severity',
                  e.target.value ? (e.target.value as AuditSeverity) : undefined
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="">All Severities</option>
              {SEVERITY_OPTIONS.map((severity) => (
                <option key={severity} value={severity}>
                  {severity.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Result - REMOVED (not in AuditLogFilters) */}

          {/* Actor ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actor ID
            </label>
            <input
              type="text"
              value={filters.actor_id || ''}
              onChange={(e) =>
                handleFilterChange('actor_id', e.target.value || undefined)
              }
              placeholder="Actor ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Logs
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search logs..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button 
                size="sm" 
                onClick={handleSearch}
                disabled={isLoading}
              >
                🔍 Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading logs...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <ErrorAlert
          message={error?.message || 'Failed to load audit logs. Please try again.'}
          title="Error Loading Logs"
          variant="danger"
          action={{
            label: 'Retry',
            onClick: () => refetch(),
          }}
        />
      )}

      {/* Stats Cards */}
      {!isLoading && !isError && logsData?.logs && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Logs</div>
            <div className="text-3xl font-bold text-gray-900">{totalLogs}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Critical</div>
            <div className="text-3xl font-bold text-red-600">
              {logsData.logs.filter(log => log.severity === 'critical').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">High</div>
            <div className="text-3xl font-bold text-orange-600">
              {logsData.logs.filter(log => log.severity === 'high').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Failed Logins</div>
            <div className="text-3xl font-bold text-yellow-600">
              {logsData.logs.filter(log => log.action === 'login.failed').length}
            </div>
          </div>
        </div>
      )}

      {/* Logs Table */}
      {!isLoading && !isError && (
        <>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resource ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Outcome
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logsData?.logs?.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-500">
                          No audit logs found
                        </p>
                      </td>
                    </tr>
                  ) : (
                    logsData?.logs?.map((log) => (
                      <tr key={log.audit_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <span className="flex items-center gap-2">
                            <span>{getActionIcon(log.action)}</span>
                            <span className="text-gray-900">{log.action}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="text-gray-900">{log.user_id}</div>
                          <div className="text-gray-500 text-xs">
                            {log.ip_address}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {log.resource_type}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {log.resource_id || 'N/A'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Badge variant={getSeverityBadge(log.severity)}>
                            {log.severity.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Badge variant={log.outcome === null ? 'secondary' : 'primary'}>
                            {log.outcome || 'N/A'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(log)}
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

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{totalLogs}</span> logs
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                First
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!logsData?.pagination?.has_prev}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!logsData?.pagination?.has_next}
              >
                Next
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
              >
                Last
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedLog && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4 animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Audit Log Details
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Summary */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Summary
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">Audit ID</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedLog.audit_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Timestamp</p>
                    <p className="text-sm text-gray-900">
                      {formatTimestamp(selectedLog.timestamp)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Action</p>
                    <p className="text-sm text-gray-900">
                      {getActionIcon(selectedLog.action)} {selectedLog.action}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Resource Type</p>
                    <p className="text-sm text-gray-900">
                      {selectedLog.resource_type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Resource ID</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedLog.resource_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Severity</p>
                    <Badge variant={getSeverityBadge(selectedLog.severity)}>
                      {selectedLog.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Outcome</p>
                    <Badge variant={selectedLog.outcome === null ? 'secondary' : 'primary'}>
                      {selectedLog.outcome || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  User Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500">User ID</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedLog.user_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">IP Address</p>
                    <p className="text-sm text-gray-900 font-mono">
                      {selectedLog.ip_address}
                    </p>
                  </div>
                  {selectedLog.user_agent && (
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">User Agent</p>
                      <p className="text-sm text-gray-900 break-all">
                        {selectedLog.user_agent}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata JSON */}
              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Metadata
                  </h3>
                  <pre className="bg-gray-50 border border-gray-200 rounded p-4 overflow-auto text-xs">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
              <Button onClick={() => setShowDetailModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 animate-scale-in">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Export Audit Logs
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {EXPORT_FORMATS.map((format) => (
                    <option key={format} value={format}>
                      {format.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {activeFiltersCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Export will include {activeFiltersCount}{' '}
                    active filter(s)
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowExportModal(false)}
                disabled={isExporting}
              >
                Cancel
              </Button>
              <Button onClick={handleExport} disabled={isExporting}>
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
