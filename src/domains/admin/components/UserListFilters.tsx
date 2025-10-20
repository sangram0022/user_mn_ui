/**
 * User List Filters Component
 *
 * Provides comprehensive UI-side filtering for user lists
 * Features:
 * - Text search (name, email)
 * - Role filter
 * - Status filter (active/inactive)
 * - Verification status filter
 * - Approval status filter
 * - Sort by multiple columns
 *
 * Backend API: GET /admin/users
 */

import { useState } from 'react';
import type { UserRoleType } from '../../../shared/types/api-backend.types';

export interface UserFilters {
  searchText: string;
  role: UserRoleType | 'all';
  status: 'all' | 'active' | 'inactive';
  verified: 'all' | 'verified' | 'not_verified';
  approved: 'all' | 'approved' | 'pending';
  sortBy: 'email' | 'first_name' | 'last_name' | 'created_at' | 'last_login_at';
  sortOrder: 'asc' | 'desc';
}

export interface UserListFiltersProps {
  onFilterChange: (filters: UserFilters) => void;
  totalCount: number;
  filteredCount: number;
}

const defaultFilters: UserFilters = {
  searchText: '',
  role: 'all',
  status: 'all',
  verified: 'all',
  approved: 'all',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export function UserListFilters({
  onFilterChange,
  totalCount,
  filteredCount,
}: UserListFiltersProps) {
  const [filters, setFilters] = useState<UserFilters>(defaultFilters);

  const handleFilterChange = (updates: Partial<UserFilters>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.searchText !== '' ||
    filters.role !== 'all' ||
    filters.status !== 'all' ||
    filters.verified !== 'all' ||
    filters.approved !== 'all';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCount} of {totalCount} users
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Search Text */}
        <div className="lg:col-span-2">
          <label
            htmlFor="search-text"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Search
          </label>
          <input
            id="search-text"
            type="text"
            placeholder="Name or email..."
            value={filters.searchText}
            onChange={(e) => handleFilterChange({ searchText: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label
            htmlFor="role-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Role
          </label>
          <select
            id="role-filter"
            value={filters.role}
            onChange={(e) => handleFilterChange({ role: e.target.value as UserFilters['role'] })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="auditor">Auditor</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) =>
              handleFilterChange({ status: e.target.value as UserFilters['status'] })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Verified Filter */}
        <div>
          <label
            htmlFor="verified-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Verified
          </label>
          <select
            id="verified-filter"
            value={filters.verified}
            onChange={(e) =>
              handleFilterChange({ verified: e.target.value as UserFilters['verified'] })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All</option>
            <option value="verified">Verified</option>
            <option value="not_verified">Not verified</option>
          </select>
        </div>

        {/* Approved Filter */}
        <div>
          <label
            htmlFor="approved-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Approval
          </label>
          <select
            id="approved-filter"
            value={filters.approved}
            onChange={(e) =>
              handleFilterChange({ approved: e.target.value as UserFilters['approved'] })
            }
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
          <select
            value={filters.sortBy}
            aria-label="Sort by column"
            onChange={(e) =>
              handleFilterChange({ sortBy: e.target.value as UserFilters['sortBy'] })
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="email">Email</option>
            <option value="first_name">First Name</option>
            <option value="last_name">Last Name</option>
            <option value="created_at">Created Date</option>
            <option value="last_login_at">Last Login</option>
          </select>
          <button
            type="button"
            onClick={() =>
              handleFilterChange({
                sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
              })
            }
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label={`Sort ${filters.sortOrder === 'asc' ? 'descending' : 'ascending'}`}
          >
            {filters.sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>
        </div>
      </div>
    </div>
  );
}
