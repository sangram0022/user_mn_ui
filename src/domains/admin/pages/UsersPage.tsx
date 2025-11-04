/**
 * Users Management Page - Real API Integration
 * Clean, production-ready implementation with zero errors
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../../shared/components/ui/Button';
import Badge from '../../../shared/components/ui/Badge';
import ErrorAlert from '../../../shared/components/ui/ErrorAlert';
import { formatShortDate } from '../../../shared/utils/dateFormatters';
import { formatUserRole } from '../../../shared/utils/textFormatters';
import { buildRoute } from '../../../core/routing/config';
import { 
  useUserList, 
  useDeleteUser, 
  useBulkDeleteUsers,
  useExportUsers 
} from '../hooks';
import type { UserStatus } from '../types';

export default function UsersPage() {
  // State Management
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Search state - separate input from applied search
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'first_name' | 'last_name' | 'email' | 'created_at'>('first_name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // API Hooks - use appliedSearch instead of searchInput
  const { data: usersData, isLoading, isError, error } = useUserList({
    page: currentPage,
    page_size: itemsPerPage,
    search: appliedSearch || undefined,
    role: roleFilter !== 'all' ? [roleFilter] : undefined,
    status: statusFilter !== 'all' ? [statusFilter as UserStatus] : undefined,
    sort_by: sortField,
    sort_order: sortDirection,
  });

  const deleteUser = useDeleteUser();
  const bulkDelete = useBulkDeleteUsers();
  const exportUsers = useExportUsers();

  // Derived State
  const users = usersData?.users || [];
  const pagination = usersData?.pagination;
  const totalPages = pagination?.total_pages || 1;
  const totalCount = pagination?.total_items || 0;
  const startIndex = ((pagination?.page || 1) - 1) * (pagination?.page_size || itemsPerPage);
  const endIndex = startIndex + users.length;

  // Handlers
  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser.mutate({ 
        userId,
        options: { force: false }
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedUsers.size === 0) return;
    if (window.confirm(`Delete ${selectedUsers.size} users?`)) {
      bulkDelete.mutate({ 
        userIds: Array.from(selectedUsers),
        options: { force: false }
      });
      setSelectedUsers(new Set());
    }
  };

  const handleExport = (format: 'csv' | 'json' | 'xlsx') => {
    exportUsers.mutate({
      format,
      filters: {
        role: roleFilter !== 'all' ? [roleFilter] : undefined,
        status: statusFilter !== 'all' ? [statusFilter as UserStatus] : undefined,
        search: appliedSearch || undefined,
      },
    });
  };

  const handleSearch = () => {
    setAppliedSearch(searchInput);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleSort = (field: 'first_name' | 'last_name' | 'email' | 'created_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.user_id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage users, roles, and permissions</p>
        </div>
        <Button variant="primary" size="md">
          + Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Search & Filter Users
          </h3>
          {(appliedSearch || roleFilter !== 'all' || statusFilter !== 'all') && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearFilters}
            >
              🔄 Clear All Filters
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search - Takes 4 columns */}
          <div className="md:col-span-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Users
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Name, email, username..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button 
                variant="primary" 
                size="md"
                onClick={handleSearch}
                disabled={isLoading}
              >
                🔍 Search
              </Button>
            </div>
          </div>
          
          {/* Role Filter - Takes 3 columns */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="user">User</option>
            </select>
          </div>
          
          {/* Status Filter - Takes 3 columns */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          
          {/* Export Buttons - Takes 2 columns */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export
            </label>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('csv')}
                disabled={exportUsers.isPending}
              >
                CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('json')}
                disabled={exportUsers.isPending}
              >
                JSON
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExport('xlsx')}
                disabled={exportUsers.isPending}
              >
                Excel
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(appliedSearch || roleFilter !== 'all' || statusFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Active filters:</span>
              {appliedSearch && (
                <Badge variant="info">
                  Search: "{appliedSearch}"
                  <button 
                    onClick={() => {
                      setSearchInput('');
                      setAppliedSearch('');
                      setCurrentPage(1);
                    }} 
                    className="ml-2 hover:text-red-600 font-bold"
                    type="button"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {roleFilter !== 'all' && (
                <Badge variant="info">
                  Role: {roleFilter}
                  <button 
                    onClick={() => {
                      setRoleFilter('all');
                      setCurrentPage(1);
                    }} 
                    className="ml-2 hover:text-red-600 font-bold"
                    type="button"
                    aria-label="Clear role filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {statusFilter !== 'all' && (
                <Badge variant="info">
                  Status: {statusFilter}
                  <button 
                    onClick={() => {
                      setStatusFilter('all');
                      setCurrentPage(1);
                    }} 
                    className="ml-2 hover:text-red-600 font-bold"
                    type="button"
                    aria-label="Clear status filter"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Loading users...</p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <ErrorAlert
          message={error?.message || 'Failed to load users. Please try again.'}
          title="Error Loading Users"
          variant="danger"
        />
      )}

      {/* Stats Cards */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Total Users</div>
            <div className="text-3xl font-bold text-gray-900">{totalCount}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-3xl font-bold text-green-600">
              {users.filter(u => u.is_active).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Inactive</div>
            <div className="text-3xl font-bold text-gray-600">
              {users.filter(u => !u.is_active).length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-1">Pending Approval</div>
            <div className="text-3xl font-bold text-yellow-600">
              {users.filter(u => !u.is_approved).length}
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {!isLoading && !isError && selectedUsers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <span className="text-blue-800 font-medium">
            {selectedUsers.size} user(s) selected
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedUsers(new Set())}>
              Clear Selection
            </Button>
            <Button 
              variant="danger" 
              size="sm" 
              onClick={handleBulkDelete}
              disabled={bulkDelete.isPending}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && !isError && (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.size === users.length && users.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('first_name')}
              >
                First Name {sortField === 'first_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('last_name')}
              >
                Last Name {sortField === 'last_name' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('email')}
              >
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Approved
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                Created {sortField === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.user_id)}
                    onChange={() => toggleUserSelection(user.user_id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.first_name}</div>
                  <div className="text-sm text-gray-500">{user.username || user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.last_name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="info">{formatUserRole(user.roles[0] || 'user')}</Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant={user.is_active ? 'success' : 'danger'}
                  >
                    {user.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge 
                    variant={user.is_approved ? 'success' : 'warning'}
                  >
                    {user.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatShortDate(user.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    to={buildRoute.adminUserView(user.user_id)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </Link>
                  <Link 
                    to={buildRoute.adminUserEdit(user.user_id)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDeleteUser(user.user_id)}
                    className="text-red-600 hover:text-red-900"
                    disabled={deleteUser.isPending}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-700">
              Showing {startIndex + 1} to {endIndex} of {totalCount} users
            </span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="px-4 py-2 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
