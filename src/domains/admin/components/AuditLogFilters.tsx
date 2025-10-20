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
import type {
  AuditAction,
  AuditOutcome,
  AuditSeverity,
} from '../../../shared/types/api-backend.types';

export interface AuditLogFilters {
  dateFrom: string;
  dateTo: string;
  action: AuditAction | 'all';
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
const AUDIT_ACTIONS: AuditAction[] = [
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
];

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Log Filters</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCount} of {totalCount} logs
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            From Date
          </label>
          <input
            id="date-from"
            type="datetime-local"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Date To */}
        <div>
          <label
            htmlFor="date-to"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            To Date
          </label>
          <input
            id="date-to"
            type="datetime-local"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Action Filter */}
        <div>
          <label
            htmlFor="action-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Action
          </label>
          <select
            id="action-filter"
            value={filters.action}
            onChange={(e) =>
              handleFilterChange({ action: e.target.value as AuditLogFilters['action'] })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Resource
          </label>
          <select
            id="resource-filter"
            value={filters.resourceType}
            onChange={(e) => handleFilterChange({ resourceType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Severity
          </label>
          <select
            id="severity-filter"
            value={filters.severity}
            onChange={(e) =>
              handleFilterChange({ severity: e.target.value as AuditLogFilters['severity'] })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Outcome
          </label>
          <select
            id="outcome-filter"
            value={filters.outcome}
            onChange={(e) =>
              handleFilterChange({ outcome: e.target.value as AuditLogFilters['outcome'] })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            User ID
          </label>
          <input
            id="user-id"
            type="text"
            placeholder="Filter by user ID..."
            value={filters.userId}
            onChange={(e) => handleFilterChange({ userId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Sort Order */}
        <div>
          <label
            htmlFor="sort-order"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Sort Order
          </label>
          <select
            id="sort-order"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange({ sortOrder: e.target.value as 'asc' | 'desc' })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Buttons */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
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
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
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
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Last 30 days
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange({ outcome: 'failure' })}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
          >
            Failures only
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange({ severity: 'critical' })}
            className="px-3 py-1 text-sm border border-red-300 dark:border-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-700 dark:text-red-400"
          >
            Critical only
          </button>
        </div>
      </div>
    </div>
  );
}
