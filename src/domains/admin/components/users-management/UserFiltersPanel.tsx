// ========================================
// User Filters Panel Component
// ========================================

import { useLiveRegion } from '@/shared/hooks/accessibility';
import type { UserFilters } from './types';

interface UserFiltersPanelProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  userCount: number;
}

export default function UserFiltersPanel({ 
  filters, 
  onFiltersChange, 
  userCount 
}: UserFiltersPanelProps) {
  const { announce } = useLiveRegion();

  const updateFilter = (key: keyof UserFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
    announce(`Filter updated: ${key} set to ${value}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
        <div className="text-sm text-gray-600">
          {userCount.toLocaleString()} users total
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <label htmlFor="user-search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Users
        </label>
        <input
          id="user-search"
          type="text"
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          placeholder="Search by name or email..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Role Filter */}
        <div>
          <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            id="role-filter"
            value={filters.role}
            onChange={(e) => updateFilter('role', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Sort By */}
        <div>
          <label htmlFor="sort-by" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sort-by"
            value={filters.sortBy}
            onChange={(e) => updateFilter('sortBy', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="lastLogin">Last Login</option>
            <option value="createdAt">Created Date</option>
          </select>
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sort-order" className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <select
            id="sort-order"
            value={filters.sortOrder}
            onChange={(e) => updateFilter('sortOrder', e.target.value as 'asc' | 'desc')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => {
            onFiltersChange({
              search: '',
              role: '',
              status: '',
              sortBy: 'name',
              sortOrder: 'asc'
            });
            announce('Filters cleared');
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
