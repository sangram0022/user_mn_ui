/**
 * Admin Users Management Page
 *
 * Comprehensive user management interface with:
 * - Advanced filtering (role, status, verified, approved, sorting)
 * - CSV export functionality
 * - Real-time search
 * - User approval/rejection
 * - User activation/deactivation
 * - Responsive design with dark mode support
 *
 * Uses React 19 best practices and AWS deployment patterns.
 *
 * @author Backend Integration - October 2025
 */

import { CheckCircle, Download, RefreshCw, UserCheck, UserX, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { UserListFilters, type UserFilters } from '@domains/admin/components/UserListFilters';
import { downloadUsersAsCSV, useUserListFilters } from '@domains/admin/hooks/useUserListFilters';
import { useAuth } from '@domains/auth/context/AuthContext';
import { useApiCall } from '@hooks/useApiCall';
import { apiClient } from '@lib/api/client';
import { PageMetadata } from '@shared/components/PageMetadata';
import { Skeleton } from '@shared/components/ui/Skeleton';
import type { AdminUserListResponse, AdminUsersQuery, UserSummary } from '@shared/types';
import Breadcrumb from '@shared/ui/Breadcrumb';
import { formatDateTime } from '@shared/utils';

// ============================================================================
// Main Component
// ============================================================================

export default function AdminUsersPage() {
  const { hasPermission } = useAuth();
  const [users, setUsers] = useState<AdminUserListResponse[]>([]);

  // Filter state
  const [filters, setFilters] = useState<UserFilters>({
    searchText: '',
    role: 'all',
    status: 'all',
    verified: 'all',
    approved: 'all',
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  // API calls with built-in error handling
  const { loading, execute } = useApiCall<UserSummary[]>();
  const { loading: actionLoading, execute: executeAction } = useApiCall<unknown>();

  // Client-side filtering
  const { filteredUsers, filteredCount, totalCount } = useUserListFilters({
    users,
    filters,
  });

  // Load users from API
  const loadUsers = async () => {
    const params: AdminUsersQuery = {
      page: 1,
      limit: 1000, // Load all users for client-side filtering
    };

    const response = await execute(() => apiClient.getUsers(params), {
      showErrorToast: true,
    });

    if (response) {
      // Convert UserSummary[] to AdminUserListResponse[]
      const adminUsers: AdminUserListResponse[] = response.map((user) => ({
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role as AdminUserListResponse['role'],
        is_active: user.is_active,
        is_verified: user.is_verified,
        is_approved: user.is_approved ?? true,
        approved_by: null,
        approved_at: null,
        created_at: user.created_at,
        last_login_at: user.last_login_at ?? null,
      }));
      setUsers(adminUsers);
    }
  };

  // Initial load
  useEffect(() => {
    if (hasPermission('admin') || hasPermission('user:read')) {
      loadUsers();
    }
  }, []);

  // Handle user approval
  const handleApproveUser = async (userId: string) => {
    const result = await executeAction(() => apiClient.approveUser(userId), {
      showErrorToast: true,
      showSuccessToast: true,
      successMessage: 'User approved successfully',
    });

    if (result) {
      // Reload users to get updated data
      await loadUsers();
    }
  };

  // Handle user rejection
  const handleRejectUser = async (userId: string) => {
    const result = await executeAction(() => apiClient.rejectUser(userId), {
      showErrorToast: true,
      showSuccessToast: true,
      successMessage: 'User rejected successfully',
    });

    if (result) {
      await loadUsers();
    }
  };

  // Handle user activation
  const handleActivateUser = async (userId: string) => {
    const result = await executeAction(() => apiClient.activateUser(userId), {
      showErrorToast: true,
      showSuccessToast: true,
      successMessage: 'User activated successfully',
    });

    if (result) {
      await loadUsers();
    }
  };

  // Handle user deactivation
  const handleDeactivateUser = async (userId: string) => {
    const result = await executeAction(
      () => apiClient.deactivateUser(userId, 'Deactivated by admin'),
      {
        showErrorToast: true,
        showSuccessToast: true,
        successMessage: 'User deactivated successfully',
      }
    );

    if (result) {
      await loadUsers();
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    downloadUsersAsCSV(filteredUsers);
  };

  // Permission check
  if (!hasPermission('admin') && !hasPermission('user:read')) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageMetadata title="Admin Users" description="User management interface" />
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">
            You don&apos;t have permission to view this page
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageMetadata title="Admin Users" description="Manage users, approvals, and permissions" />

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Manage users, approve registrations, and control access
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <UserListFilters
          onFilterChange={setFilters}
          totalCount={totalCount}
          filteredCount={filteredCount}
        />
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading...' : 'Refresh'}
        </button>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={filteredUsers.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          Export to CSV ({filteredCount})
        </button>

        <div className="ml-auto flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>
            Showing {filteredCount} of {totalCount} users
          </span>
        </div>
      </div>

      {/* Loading State */}
      {loading && users.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <Skeleton className="h-96" />
        </div>
      )}

      {/* Users Table */}
      {!loading || users.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Approved
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No users found matching your filters
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.user_id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {/* User Info */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            user.is_active
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Verified */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </td>

                      {/* Approved */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.is_approved ? (
                          <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span>Yes</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-sm text-yellow-600 dark:text-yellow-400">
                            <XCircle className="w-4 h-4" />
                            <span>Pending</span>
                          </div>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDateTime(user.created_at)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {/* Approval Actions */}
                          {!user.is_approved && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleApproveUser(user.user_id)}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                                title="Approve User"
                              >
                                <UserCheck className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectUser(user.user_id)}
                                disabled={actionLoading}
                                className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                                title="Reject User"
                              >
                                <UserX className="w-3 h-3" />
                                Reject
                              </button>
                            </>
                          )}

                          {/* Activation Actions */}
                          {user.is_approved && (
                            <>
                              {user.is_active ? (
                                <button
                                  type="button"
                                  onClick={() => handleDeactivateUser(user.user_id)}
                                  disabled={actionLoading}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 transition-colors"
                                  title="Deactivate User"
                                >
                                  <UserX className="w-3 h-3" />
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleActivateUser(user.user_id)}
                                  disabled={actionLoading}
                                  className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                  title="Activate User"
                                >
                                  <UserCheck className="w-3 h-3" />
                                  Activate
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
