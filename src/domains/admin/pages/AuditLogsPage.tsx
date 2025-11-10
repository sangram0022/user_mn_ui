/**
 * AuditLogsPage Component (Refactored)
 * Admin page for viewing and filtering audit logs
 * 
 * REFACTORED: Extracted components and business logic
 * - useAuditLogManagement: State management and business logic
 * - QuickFilters: Quick filter buttons
 * - AuditLogFilters: Advanced search and filter controls
 * - AuditLogTable: Log list with stats
 * - AuditLogDetailModal: Detailed log view
 * - AuditLogExportModal: Export configuration
 * - Pagination: Page navigation (reused)
 */

import { useAuditLogManagement } from '../hooks/useAuditLogManagement';
import QuickFilters from '../components/QuickFilters';
import AuditLogFilters from '../components/AuditLogFilters';
import AuditLogTable from '../components/AuditLogTable';
import AuditLogDetailModal from '../components/AuditLogDetailModal';
import AuditLogExportModal from '../components/AuditLogExportModal';
import Pagination from '../components/Pagination';
import Button from '@/shared/components/ui/Button';
import ErrorAlert from '@/shared/components/ui/ErrorAlert';

export default function AuditLogsPage() {
  const {
    // Data
    logs,
    pagination,
    isLoading,
    isError,
    error,

    // Filter state
    filters,
    searchInput,
    setSearchInput,
    activeFiltersCount,

    // Modal state
    selectedLog,
    showDetailModal,
    setShowDetailModal,
    showExportModal,
    setShowExportModal,
    exportFormat,
    setExportFormat,

    // Real-time state
    realTimeMode,
    setRealTimeMode,

    // Export state
    isExporting,

    // Handlers
    handleFilterChange,
    handleSearch,
    handleClearFilters,
    handleQuickFilter,
    handleViewDetails,
    handleExport,
    refetch,
    setPage,
  } = useAuditLogManagement();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-gray-500">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorAlert
        title="Error Loading Audit Logs"
        message={error instanceof Error ? error.message : 'An unexpected error occurred'}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-600">Monitor and review system activity</p>
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
              Real-time monitoring {realTimeMode && '(60s refresh)'}
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
      <QuickFilters
        onQuickFilter={handleQuickFilter}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
      />

      {/* Advanced Filters */}
      <AuditLogFilters
        filters={filters}
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />

      {/* Logs Table with Stats */}
      <AuditLogTable
        logs={logs}
        totalLogs={pagination.total_items}
        onViewDetails={handleViewDetails}
      />

      {/* Pagination */}
      {logs.length > 0 && (
        <Pagination pagination={pagination} onPageChange={setPage} />
      )}

      {/* Detail Modal */}
      <AuditLogDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        log={selectedLog}
      />

      {/* Export Modal */}
      <AuditLogExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        exportFormat={exportFormat}
        setExportFormat={setExportFormat}
        isExporting={isExporting}
        activeFiltersCount={activeFiltersCount}
      />
    </div>
  );
}
