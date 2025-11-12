/**
 * useAuditLogManagement Hook
 * Manages audit log fetching, filtering, pagination, and real-time updates
 */

import { useState, useEffect } from 'react';
import { useAuditLogs, useExportAuditLogs } from './index';
import type { AuditLogFilters, ExportFormat, AuditLog } from '../types';
import { INTERVAL_TIMING } from '@/core/constants';

const PAGE_SIZE = 10;

export function useAuditLogManagement() {
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(PAGE_SIZE);

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

  // Fetch audit logs
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
    }, INTERVAL_TIMING.HEALTH_CHECK); // Use centralized constant (60s)

    return () => clearInterval(interval);
  }, [realTimeMode, refetch]);

  // Filter handlers
  const handleFilterChange = (
    key: keyof AuditLogFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    setPage(1);
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

  // Modal handlers
  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log);
    setShowDetailModal(true);
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
          if (data.success) {
            setShowExportModal(false);
          }
        },
      }
    );
  };

  // Calculate pagination info
  const pagination = {
    page: logsData?.pagination?.page || 1,
    page_size: logsData?.pagination?.page_size || pageSize,
    total_items: logsData?.pagination?.total_items || 0,
    total_pages: logsData?.pagination?.total_pages || 1,
    has_prev: (logsData?.pagination?.page || 1) > 1,
    has_next: (logsData?.pagination?.page || 1) < (logsData?.pagination?.total_pages || 1),
  };

  const startIndex = (pagination.page - 1) * pagination.page_size;
  const endIndex = startIndex + (logsData?.logs?.length || 0);

  // Count active filters
  const activeFiltersCount = Object.keys(filters).length + (appliedSearch ? 1 : 0);

  return {
    // Data
    logs: logsData?.logs || [],
    pagination,
    isLoading,
    isError,
    error,

    // Filter state
    filters,
    searchInput,
    setSearchInput,
    appliedSearch,
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

    // Computed values
    startIndex,
    endIndex,
  };
}
