/**
 * Admin Audit Logs Hooks
 * React Query hooks for audit log management and export
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../services/api/queryClient';
import { adminAuditService } from '../services';
import type {
  AuditLogFilters,
  ExportAuditLogsRequest,
} from '../types';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch audit logs with filtering and pagination
 */
export const useAuditLogs = (filters?: AuditLogFilters) => {
  return useQuery({
    queryKey: queryKeys.admin.auditLogs(filters),
    queryFn: () => adminAuditService.getAuditLogs(filters),
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute for real-time monitoring
  });
};

/**
 * Get today's audit logs
 */
export const useTodaysLogs = () => {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'audit-logs', 'today'] as const,
    queryFn: () => adminAuditService.getTodaysLogs(),
    staleTime: 30000,
    refetchInterval: 60000,
  });
};

/**
 * Get critical severity logs
 */
export const useCriticalLogs = (days: number = 7) => {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'audit-logs', 'critical', days] as const,
    queryFn: () => adminAuditService.getCriticalLogs(days),
    staleTime: 60000, // 1 minute
  });
};

/**
 * Get failed login attempts
 */
export const useFailedLoginAttempts = (hours: number = 24) => {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'audit-logs', 'failed-logins', hours] as const,
    queryFn: () => adminAuditService.getFailedLoginAttempts(hours),
    staleTime: 30000,
    refetchInterval: 60000, // Monitor failed logins closely
  });
};

/**
 * Get user's action history
 */
export const useUserActionHistory = (userId: string | undefined, days: number = 30) => {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'audit-logs', 'user-history', userId, days] as const,
    queryFn: () => adminAuditService.getUserActionHistory(userId!, days),
    enabled: !!userId,
    staleTime: 60000,
  });
};

/**
 * Search audit logs
 */
export const useSearchAuditLogs = (searchTerm: string | undefined) => {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'audit-logs', 'search', searchTerm] as const,
    queryFn: () => adminAuditService.searchAuditLogs(searchTerm!),
    enabled: !!searchTerm && searchTerm.length >= 3, // Only search if 3+ chars
    staleTime: 30000,
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Export audit logs in various formats
 */
export const useExportAuditLogs = () => {
  return useMutation({
    mutationFn: async (request: ExportAuditLogsRequest) => {
      const blob = await adminAuditService.exportAuditLogs(request);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = request.format === 'xlsx' ? 'xlsx' : request.format;
      const filename = `audit-logs-export-${timestamp}.${extension}`;
      
      // Download blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    },
  });
};

/**
 * Export monthly logs helper
 */
export const useExportMonthlyLogs = () => {
  return useMutation({
    mutationFn: ({
      year,
      month,
      format,
    }: {
      year: number;
      month: number;
      format?: 'csv' | 'json' | 'xlsx' | 'pdf';
    }) => adminAuditService.exportMonthlyLogs(year, month, format),
  });
};

// ============================================================================
// Combined Monitoring Hook
// ============================================================================

/**
 * Combined hook for security monitoring dashboard
 */
export const useSecurityMonitoring = () => {
  const todaysLogs = useTodaysLogs();
  const criticalLogs = useCriticalLogs(7);
  const failedLogins = useFailedLoginAttempts(24);

  return {
    todaysLogs: todaysLogs.data,
    criticalLogs: criticalLogs.data,
    failedLogins: failedLogins.data,
    
    isLoading: todaysLogs.isLoading || criticalLogs.isLoading || failedLogins.isLoading,
    isError: todaysLogs.isError || criticalLogs.isError || failedLogins.isError,
    error: todaysLogs.error || criticalLogs.error || failedLogins.error,
    
    refetch: () => {
      todaysLogs.refetch();
      criticalLogs.refetch();
      failedLogins.refetch();
    },
  };
};

/**
 * Real-time audit log monitoring with auto-refresh
 */
export const useRealTimeAuditLogs = (filters?: AuditLogFilters, refreshInterval: number = 5000) => {
  return useQuery({
    queryKey: [...queryKeys.admin.all, 'audit-logs', 'realtime', filters] as const,
    queryFn: () => adminAuditService.getAuditLogs(filters),
    staleTime: 0, // Always consider stale for real-time
    refetchInterval: refreshInterval, // Default 5 seconds
  });
};
