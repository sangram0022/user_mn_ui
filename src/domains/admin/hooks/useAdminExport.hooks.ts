/**
 * Admin Export Hooks
 * React hooks for exporting data (users, audit logs, roles)
 */

import { useMutation } from '@tanstack/react-query';
import { useStandardErrorHandler } from '@/shared/hooks/useStandardErrorHandler';
import { useToast } from '@/hooks/useToast';
import adminExportService from '../services/adminExportService';
import type { ExportFormat, ExportFilters } from '../services/adminExportService';

// ============================================================================
// Export Mutation Hooks
// ============================================================================

/**
 * Export users to file
 */
export const useExportUsers = () => {
  const handleError = useStandardErrorHandler();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      format,
      filters,
    }: {
      format: ExportFormat;
      filters?: ExportFilters;
    }) => {
      const blob = await adminExportService.exportUsers(format, filters);
      const filename = adminExportService.generateExportFilename('users', format);
      adminExportService.downloadBlob(blob, filename);
      return { success: true, filename };
    },
    onSuccess: (data) => {
      toast.success(`Users exported successfully to ${data.filename}`);
    },
    onError: (error) => {
      handleError(error, {
        context: { operation: 'exportUsers' },
      });
    },
  });
};

/**
 * Export audit logs to file
 */
export const useExportAuditLogs = () => {
  const handleError = useStandardErrorHandler();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      format,
      filters,
    }: {
      format: ExportFormat;
      filters?: ExportFilters;
    }) => {
      const blob = await adminExportService.exportAuditLogs(format, filters);
      const filename = adminExportService.generateExportFilename('audit-logs', format);
      adminExportService.downloadBlob(blob, filename);
      return { success: true, filename };
    },
    onSuccess: (data) => {
      toast.success(`Audit logs exported successfully to ${data.filename}`);
    },
    onError: (error) => {
      handleError(error, {
        context: { operation: 'exportAuditLogs' },
      });
    },
  });
};

/**
 * Export roles to file
 */
export const useExportRoles = () => {
  const handleError = useStandardErrorHandler();
  const toast = useToast();

  return useMutation({
    mutationFn: async ({
      format,
      filters,
    }: {
      format: ExportFormat;
      filters?: ExportFilters;
    }) => {
      const blob = await adminExportService.exportRoles(format, filters);
      const filename = adminExportService.generateExportFilename('roles', format);
      adminExportService.downloadBlob(blob, filename);
      return { success: true, filename };
    },
    onSuccess: (data) => {
      toast.success(`Roles exported successfully to ${data.filename}`);
    },
    onError: (error) => {
      handleError(error, {
        context: { operation: 'exportRoles' },
      });
    },
  });
};
