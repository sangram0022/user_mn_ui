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
import { PageMetadata } from '@shared/components/PageMetadata';
import { Badge, getSeverityBadgeVariant } from '@shared/components/ui/Badge';
import { Skeleton } from '@shared/components/ui/Skeleton';
import type { AuditLogEntry, AuditLogsResponse } from '@shared/types/api-complete.types';
import Breadcrumb from '@shared/ui/Breadcrumb';
import { formatDateTime, formatTimestamp } from '@shared/utils';
import { auditService } from '../../../services/api';
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
      return <AlertCircle className="icon-xs" />;
    case 'warning':
      return <AlertTriangle className="icon-xs" />;
    case 'info':
      return <Info className="icon-xs" />;
    case 'success':
      return <CheckCircle className="icon-xs" />;
    default:
      return <Info className="icon-xs" />;
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
    <tr className="hover:bg-[color:var(--color-background-secondary)] dark:hover:bg-[var(--color-surface-primary)] transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)]">
        {date}
        <div className="text-xs text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
          {time}
        </div>
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
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)]">
        {log.action.replace(/_/g, ' ')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)]">
        {log.resource_type}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={log.outcome === 'success' ? 'success' : 'error'} size="sm">
          {log.outcome}
        </Badge>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)]">
        {log.user_id || (
          <span className="text-[color:var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]">
            System
          </span>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onViewDetails(log)}
          className="text-[color:var(--color-primary)] hover:text-[var(--color-primary)] dark:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[color:var(--color-primary)] focus:ring-offset-1 rounded w-8 h-8 max-md:w-11 max-md:h-11 flex items-center justify-center"
          aria-label={`View details for ${log.action} on ${log.resource_type}`}
          title="View log details"
        >
          <Eye className="icon-sm max-md:icon-md" aria-hidden="true" />
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
          className="fixed inset-0 bg-[var(--color-surface-secondary)] bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3
                id="modal-title"
                className="text-lg font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]"
              >
                Audit Log Details
              </h3>
              <button
                onClick={onClose}
                className="text-[color:var(--color-text-tertiary)] hover:text-[color:var(--color-text-secondary)] dark:hover:text-[var(--color-text-tertiary)]"
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
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
                    Audit ID
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)] font-mono">
                    {log.audit_id}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
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
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
                    Action
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)]">
                    {log.action.replace(/_/g, ' ')}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
                    Outcome
                  </h4>
                  <Badge variant={log.outcome === 'success' ? 'success' : 'error'} size="sm">
                    {log.outcome}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
                    Resource Type
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)]">
                    {log.resource_type}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
                    Resource ID
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)]">
                    {log.resource_id}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
                    User ID
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)]">
                    {log.user_id || 'System'}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
                    Timestamp
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)]">
                    {formatDateTime(log.timestamp)}
                  </p>
                </div>
              </div>

              {log.ip_address && (
                <div>
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
                    IP Address
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)] font-mono">
                    {log.ip_address}
                  </p>
                </div>
              )}

              {log.user_agent && (
                <div>
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
                    User Agent
                  </h4>
                  <p className="text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)] break-all">
                    {log.user_agent}
                  </p>
                </div>
              )}

              {log.metadata && Object.keys(log.metadata).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[color:var(--color-text-tertiary)] mb-1">
                    Metadata
                  </h4>
                  <pre className="text-sm text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)] bg-[color:var(--color-background-secondary)] dark:bg-[color:var(--color-background-tertiary)] p-3 rounded-md overflow-auto max-h-48">
                    {JSON.stringify(log.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[color:var(--color-background-secondary)] dark:bg-[var(--color-surface-primary)] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-[color:var(--color-border-primary)] dark:border-[var(--color-border)] shadow-sm px-4 py-2 bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] text-base font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)] hover:bg-[color:var(--color-background-secondary)] dark:hover:bg-[var(--color-surface-primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[color:var(--color-primary)] sm:w-auto sm:text-sm"
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
  const { loading, execute } = useApiCall<AuditLogsResponse>();

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
        auditService.queryAuditLogs({
          page: 1,
          limit: 1000, // Load last 1000 logs
        }),
      {
        showErrorToast: true,
      }
    );

    if (response) {
      // Use the items array from AuditLogsResponse
      setLogs(response.items);
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
      <div className="page-wrapper">
        <div className="container-narrow">
          <PageMetadata
            title="Access Denied"
            description="You do not have permission to view this page"
          />
          <div className="bg-[color:var(--color-error-50)] dark:bg-[var(--color-error)]/20 border border-[color:var(--color-error)] dark:border-[var(--color-error)] rounded-lg p-4">
            <p className="text-[var(--color-error)] dark:text-[var(--color-error)]">
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

      <div className="page-wrapper">
        <div className="container-full">
          {/* Header */}
          <div className="mb-8">
            <Breadcrumb />
            <div className="mt-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                  Audit Logs
                </h1>
                <p className="text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] mt-1">
                  System activity and security events
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleExportCSV}
                  disabled={filteredCount === 0}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-[var(--color-text-primary)] bg-[color:var(--color-primary)] hover:bg-[color:var(--color-primary-700)] disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
                  aria-label="Export filtered audit logs to CSV"
                >
                  <Download className="icon-sm mr-2" aria-hidden="true" />
                  Export CSV
                </button>
                <button
                  onClick={loadAuditLogs}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-[color:var(--color-border-primary)] dark:border-[var(--color-border)] rounded-md shadow-sm text-sm font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-secondary)] bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] hover:bg-[color:var(--color-background-secondary)] dark:hover:bg-[var(--color-surface-primary)] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
                  aria-label={loading ? 'Refreshing audit logs' : 'Refresh audit logs'}
                >
                  <RefreshCw
                    className={`icon-sm mr-2 ${loading ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg shadow-sm border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] p-6">
              <div className="flex items-center">
                <Activity
                  className="icon-xl text-[color:var(--color-primary)] dark:text-[var(--color-primary)]"
                  aria-hidden="true"
                />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    Total Events
                  </p>
                  <p className="text-2xl font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                    {filteredCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg shadow-sm border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] p-6">
              <div className="flex items-center">
                <CheckCircle
                  className="icon-xl text-[color:var(--color-success)] dark:text-[var(--color-success)]"
                  aria-hidden="true"
                />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    Success
                  </p>
                  <p className="text-2xl font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                    {stats.successCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg shadow-sm border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] p-6">
              <div className="flex items-center">
                <AlertCircle
                  className="icon-xl text-[color:var(--color-error)] dark:text-[var(--color-error)]"
                  aria-hidden="true"
                />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    Failures
                  </p>
                  <p className="text-2xl font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                    {stats.failureCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] rounded-lg shadow-sm border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] p-6">
              <div className="flex items-center">
                <AlertTriangle
                  className="icon-xl text-[color:var(--color-warning)] dark:text-[var(--color-warning)]"
                  aria-hidden="true"
                />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                    Success Rate
                  </p>
                  <p className="text-2xl font-semibold text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
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
          <div className="bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] shadow-sm rounded-lg border border-[color:var(--color-border-primary)] dark:border-[color:var(--color-border-secondary)] overflow-hidden">
            <div className="px-6 py-4 border-b border-[color:var(--color-border-primary)] dark:border-[var(--color-border)]">
              <h3 className="text-lg font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                Audit Events ({filteredCount} of {totalCount})
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--color-border)] dark:divide-[var(--color-border)]">
                <thead className="bg-[color:var(--color-background-secondary)] dark:bg-[var(--color-surface-primary)]">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] uppercase tracking-wider"
                    >
                      Timestamp
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] uppercase tracking-wider"
                    >
                      Severity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] uppercase tracking-wider"
                    >
                      Action
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] uppercase tracking-wider"
                    >
                      Resource
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] uppercase tracking-wider"
                    >
                      Outcome
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-[color:var(--color-text-secondary)] dark:text-[color:var(--color-text-tertiary)] uppercase tracking-wider"
                    >
                      User
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--color-surface-primary)] dark:bg-[color:var(--color-background-elevated)] divide-y divide-[var(--color-border)] dark:divide-[var(--color-border)]">
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
                          className="w-12 h-12 text-[color:var(--color-text-tertiary)] dark:text-[color:var(--color-text-secondary)] mx-auto mb-4"
                          aria-hidden="true"
                        />
                        <h3 className="text-lg font-medium text-[color:var(--color-text-primary)] dark:text-[var(--color-text-primary)] mb-2">
                          No audit logs found
                        </h3>
                        <p className="text-[color:var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
                          No events match your current filter criteria.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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
      </div>
    </>
  );
}
