/**
 * Admin Export Hooks
 * React hooks for exporting data (users, audit logs, roles)
 */

import { useMutation } from '@tanstack/react-query';
import adminExportService from '../services/adminExportService';
import type { ExportFormat, ExportFilters } from '../services/adminExportService';

// ============================================================================
// Export Mutation Hooks
// ============================================================================

/**
 * Export users to file
 */
export const useExportUsers = () => {
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
  });
};

/**
 * Export audit logs to file
 */
export const useExportAuditLogs = () => {
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
  });
};

/**
 * Export roles to file
 */
export const useExportRoles = () => {
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
  });
};
