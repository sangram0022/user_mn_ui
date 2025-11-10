/**
 * AuditLogFilters Component
 * Advanced filtering controls for audit logs
 */

import type { AuditLogFilters as Filters, AuditSeverity } from '../types';

const SEVERITY_OPTIONS: AuditSeverity[] = ['low', 'medium', 'high', 'critical'];

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

interface AuditLogFiltersProps {
  filters: Filters;
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  onFilterChange: (key: keyof Filters, value: string | undefined) => void;
}

export default function AuditLogFilters({
  filters,
  searchInput,
  onSearchInputChange,
  onSearch,
  onFilterChange,
}: AuditLogFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search logs..."
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-sm"
        />
        <button
          onClick={onSearch}
          className="rounded-md bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>

      {/* Advanced Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Advanced Filters
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {/* Date Range */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="datetime-local"
              value={filters.start_date?.slice(0, 16) || ''}
              onChange={(e) =>
                onFilterChange(
                  'start_date',
                  e.target.value ? new Date(e.target.value).toISOString() : undefined
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="datetime-local"
              value={filters.end_date?.slice(0, 16) || ''}
              onChange={(e) =>
                onFilterChange(
                  'end_date',
                  e.target.value ? new Date(e.target.value).toISOString() : undefined
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Action */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Action
            </label>
            <select
              value={filters.action || ''}
              onChange={(e) =>
                onFilterChange('action', e.target.value || undefined)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Resource
            </label>
            <select
              value={filters.resource || ''}
              onChange={(e) =>
                onFilterChange('resource', e.target.value || undefined)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
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
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Severity
            </label>
            <select
              value={filters.severity || ''}
              onChange={(e) =>
                onFilterChange(
                  'severity',
                  e.target.value ? (e.target.value as AuditSeverity) : undefined
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">All Severities</option>
              {SEVERITY_OPTIONS.map((severity) => (
                <option key={severity} value={severity}>
                  {severity.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Actor ID */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Actor ID
            </label>
            <input
              type="text"
              placeholder="Enter actor ID..."
              value={filters.actor_id || ''}
              onChange={(e) =>
                onFilterChange('actor_id', e.target.value || undefined)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          {/* Target ID */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Target ID
            </label>
            <input
              type="text"
              placeholder="Enter target ID..."
              value={filters.target_id || ''}
              onChange={(e) =>
                onFilterChange('target_id', e.target.value || undefined)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
