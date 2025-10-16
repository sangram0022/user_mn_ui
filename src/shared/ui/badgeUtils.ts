/**
 * Badge Utilities
 *
 * Helper functions for working with Badge components
 */

import type { BadgeVariant } from './Badge';

/**
 * Convenience function to get badge variant from severity level
 */
export function getSeverityBadgeVariant(severity: string): BadgeVariant {
  const severityMap: Record<string, BadgeVariant> = {
    low: 'info',
    medium: 'warning',
    high: 'error',
    critical: 'critical',
    info: 'info',
    success: 'success',
    error: 'error',
    warning: 'warning',
  };

  return severityMap[severity.toLowerCase()] || 'default';
}

/**
 * Convenience function to get badge variant from status
 */
export function getStatusBadgeVariant(status: string): BadgeVariant {
  const statusMap: Record<string, BadgeVariant> = {
    active: 'success',
    inactive: 'default',
    pending: 'warning',
    suspended: 'error',
    deleted: 'error',
    approved: 'success',
    rejected: 'error',
    'in-progress': 'info',
    completed: 'success',
    failed: 'error',
  };

  return statusMap[status.toLowerCase()] || 'default';
}
