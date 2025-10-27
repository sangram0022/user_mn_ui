/**
 * Audit Log Filters Component
 *
 * Provides comprehensive UI-side filtering for audit logs
 * Features:
 * - Date range filter (from/to)
 * - Action filter
 * - Resource type filter
 * - Severity filter
 * - Outcome filter
 * - User ID filter
 * - Sort by timestamp
 *
 * Backend API: GET /audit/logs
 */

import { useState } from 'react';

type AuditSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
type AuditOutcome = 'success' | 'failure';

export interface AuditLogFilters {
  dateFrom: string;
  dateTo: string;
  action: string | 'all';
  resourceType: string | 'all';
  severity: AuditSeverity | 'all';
  outcome: AuditOutcome | 'all';
  userId: string;
  sortOrder: 'asc' | 'desc';
}

export interface AuditLogFiltersProps {
  onFilterChange: (filters: AuditLogFilters) => void;
  totalCount: number;
  filteredCount: number;
}

const defaultFilters: AuditLogFilters = {
  dateFrom: '',
  dateTo: '',
  action: 'all',
  resourceType: 'all',
  severity: 'all',
  outcome: 'all',
  userId: '',
  sortOrder: 'desc',
};

// Common audit actions from backend API
const AUDIT_ACTIONS = [
  'USER_LOGIN',
  'USER_LOGOUT',
  'USER_CREATED',
  'USER_UPDATED',
  'USER_DELETED',
  'PROFILE_UPDATED',
  'PASSWORD_CHANGED',
  'PASSWORD_RESET',
  'EMAIL_VERIFIED',
  'ROLE_ASSIGNED',
  'ROLE_REVOKED',
] as const;

// Common resource types
const RESOURCE_TYPES = ['user', 'role', 'profile', 'audit_log', 'session', 'token'];

export function AuditLogFilters({
  onFilterChange,
  totalCount,
  filteredCount,
}: AuditLogFiltersProps) {
  const [filters, setFilters] = useState<AuditLogFilters>(defaultFilters);

  const handleFilterChange = (updates: Partial<AuditLogFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.dateFrom !== '' ||
    filters.dateTo !== '' ||
    filters.action !== 'all' ||
    filters.resourceType !== 'all' ||
    filters.severity !== 'all' ||
    filters.outcome !== 'all' ||
    filters.userId !== '';

  return (
    <div className="bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-primary)] rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
          Audit Log Filters
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            Showing {filteredCount} of {totalCount} logs
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-[color:var(--color-primary)] hover:text-[color:var(--color-primary-700)] dark:text-[var(--color-primary)] dark:hover:text-[var(--color-primary)]"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Date From */}
        <div>
          <label
            htmlFor="date-from"
            className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1"
          >
            From Date
          </label>
          <input
            id="date-from"
            type="datetime-local"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-[var(--color-surface-primary)] dark:text-[var(--color-text-primary)]"
          />
        </div>

        {/* Date To */}
        <div>
          <label
            htmlFor="date-to"
            className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1"
          >
            To Date
          </label>
          <input
            id="date-to"
            type="datetime-local"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-[var(--color-surface-primary)] dark:text-[var(--color-text-primary)]"
          />
        </div>

        {/* Action Filter */}
        <div>
          <label
            htmlFor="action-filter"
            className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1"
          >
            Action
          </label>
          <select
            id="action-filter"
            value={filters.action}
            onChange={(e) =>
              handleFilterChange({ action: e.target.value as AuditLogFilters['action'] })
            }
            className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-[var(--color-surface-primary)] dark:text-[var(--color-text-primary)]"
          >
            <option value="all">All actions</option>
            {AUDIT_ACTIONS.map((action) => (
              <option key={action} value={action}>
                {action.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Resource Type Filter */}
        <div>
          <label
            htmlFor="resource-filter"
            className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1"
          >
            Resource
          </label>
          <select
            id="resource-filter"
            value={filters.resourceType}
            onChange={(e) => handleFilterChange({ resourceType: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-[var(--color-surface-primary)] dark:text-[var(--color-text-primary)]"
          >
            <option value="all">All resources</option>
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div>
          <label
            htmlFor="severity-filter"
            className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1"
          >
            Severity
          </label>
          <select
            id="severity-filter"
            value={filters.severity}
            onChange={(e) =>
              handleFilterChange({ severity: e.target.value as AuditLogFilters['severity'] })
            }
            className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-[var(--color-surface-primary)] dark:text-[var(--color-text-primary)]"
          >
            <option value="all">All severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        {/* Outcome Filter */}
        <div>
          <label
            htmlFor="outcome-filter"
            className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1"
          >
            Outcome
          </label>
          <select
            id="outcome-filter"
            value={filters.outcome}
            onChange={(e) =>
              handleFilterChange({ outcome: e.target.value as AuditLogFilters['outcome'] })
            }
            className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-[var(--color-surface-primary)] dark:text-[var(--color-text-primary)]"
          >
            <option value="all">All outcomes</option>
            <option value="success">Success</option>
            <option value="failure">Failure</option>
          </select>
        </div>

        {/* User ID Filter */}
        <div>
          <label
            htmlFor="user-id"
            className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1"
          >
            User ID
          </label>
          <input
            id="user-id"
            type="text"
            placeholder="Filter by user ID..."
            value={filters.userId}
            onChange={(e) => handleFilterChange({ userId: e.target.value })}
            className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-[var(--color-surface-primary)] dark:text-[var(--color-text-primary)]"
          />
        </div>

        {/* Sort Order */}
        <div>
          <label
            htmlFor="sort-order"
            className="block text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)] mb-1"
          >
            Sort Order
          </label>
          <select
            id="sort-order"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
            className="w-full px-3 py-2 border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md shadow-sm focus:ring-[color:var(--color-primary)] focus:border-[color:var(--color-primary)] dark:bg-[var(--color-surface-primary)] dark:text-[var(--color-text-primary)]"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-4 pt-4 border-t border-[var(--color-border)] dark:border-[var(--color-border)]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            Quick filters:
          </span>
          <button
            type="button"
            onClick={() =>
              handleFilterChange({
                dateFrom: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                dateTo: new Date().toISOString().slice(0, 16),
              })
            }
            className="px-3 py-1 text-sm border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md hover:bg-[color:var(--color-background-secondary)] dark:hover:bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
          >
            Last 24 hours
          </button>
          <button
            type="button"
            onClick={() =>
              handleFilterChange({
                dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
                dateTo: new Date().toISOString().slice(0, 16),
              })
            }
            className="px-3 py-1 text-sm border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md hover:bg-[color:var(--color-background-secondary)] dark:hover:bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
          >
            Last 7 days
          </button>
          <button
            type="button"
            onClick={() =>
              handleFilterChange({
                dateFrom: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .slice(0, 16),
                dateTo: new Date().toISOString().slice(0, 16),
              })
            }
            className="px-3 py-1 text-sm border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md hover:bg-[color:var(--color-background-secondary)] dark:hover:bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange({ outcome: 'failure' })}
            className="px-3 py-1 text-sm border border-[var(--color-border)] dark:border-[var(--color-border)] rounded-md hover:bg-[color:var(--color-background-secondary)] dark:hover:bg-[var(--color-surface-primary)] text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]"
          >
            Failures only
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange({ severity: 'CRITICAL' })}
            className="px-3 py-1 text-sm border border-[var(--color-error)] dark:border-[var(--color-error)] rounded-md hover:bg-[color:var(--color-error-50)] dark:hover:bg-[var(--color-error)]/20 text-[var(--color-error)] dark:text-[var(--color-error)]"
          >
            Critical only
          </button>
        </div>
      </div>
    </div>
  );
}
