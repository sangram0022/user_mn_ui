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

import { CheckCircle, Download, UserCheck, UserX, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

import { UserListFilters, type UserFilters } from '@domains/admin/components/UserListFilters';
import { downloadUsersAsCSV, useUserListFilters } from '@domains/admin/hooks/useUserListFilters';
import { useAuth } from '@domains/auth/context/AuthContext';
import { useApiCall } from '@hooks/useApiCall';
import { PageMetadata } from '@shared/components/PageMetadata';
import { Skeleton } from '@shared/components/ui/Skeleton';
import type { AdminUserListResponse, AdminUsersQuery } from '@shared/types';
import type { AdminUsersResponse } from '@shared/types/api-complete.types';
import Breadcrumb from '@shared/ui/Breadcrumb';
import { formatDateTime } from '@shared/utils';
import { adminService } from '../../../services/api';

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
  const { loading, execute } = useApiCall<AdminUsersResponse>();
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

    const response = await execute(() => adminService.getUsers(params), {
      showErrorToast: true,
    });

    if (response) {
      // Convert AdminUserSummary[] to AdminUserListResponse[]
      const adminUsers: AdminUserListResponse[] = response.items.map((user) => ({
        user_id: user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.roles as AdminUserListResponse['roles'],
        is_active: user.is_active,
        is_verified: user.is_verified,
        is_approved: user.is_approved ?? true,
        approved_by: user.approved_by,
        approved_at: user.approved_at,
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
    const result = await executeAction(() => adminService.approveUser(userId), {
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
    const result = await executeAction(() => adminService.rejectUser(userId), {
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
    const result = await executeAction(() => adminService.activateUser(userId), {
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
      () => adminService.deactivateUser(userId, 'Deactivated by admin'),
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
      <div className="page-wrapper">
        <div className="container-narrow">
          <PageMetadata title="Admin Users" description="User management interface" />
          <div className="bg-[var(--color-error-light)] dark:bg-[var(--color-error)]/20 border border-[var(--color-error)] dark:border-[var(--color-error)] rounded-lg p-4">
            <p className="text-[var(--color-error)] dark:text-[var(--color-error)]">
              You don&apos;t have permission to view this page
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="container-full">
        <PageMetadata title="Admin Users" description="Manage users, approvals, and permissions" />

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
            User Management
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
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
            onClick={handleExportCSV}
            disabled={filteredUsers.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-success)] text-[var(--color-text-primary)] rounded-lg hover:bg-[var(--color-success)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="icon-sm" />
            Export to CSV ({filteredCount})
          </button>

          <div className="ml-auto flex items-center gap-2 text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-text-tertiary)]">
            <span>
              Showing {filteredCount} of {totalCount} users
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && users.length === 0 && (
          <div className="bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-primary)] rounded-lg shadow">
            <Skeleton className="h-96" />
          </div>
        )}

        {/* Users Table */}
        {!loading || users.length > 0 ? (
          <div className="bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-primary)] rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--color-border)] dark:divide-[var(--color-border)]">
                <thead className="bg-[var(--color-surface-secondary)] dark:bg-[var(--color-surface-primary)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Approved
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--color-surface-primary)] dark:bg-[var(--color-surface-primary)] divide-y divide-[var(--color-border)] dark:divide-[var(--color-border)]">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]"
                      >
                        No users found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.user_id}
                        className="hover:bg-[color:var(--color-background-secondary)] dark:hover:bg-[var(--color-surface-primary)] transition-colors"
                      >
                        {/* User Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <div className="text-sm font-medium text-[var(--color-text-primary)] dark:text-[var(--color-text-primary)]">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]">
                              {user.email}
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full font-medium bg-[var(--color-primary)] text-[var(--color-primary)] dark:bg-[var(--color-primary)]/20 dark:text-[var(--color-primary)]">
                            {user.roles?.join(', ') || 'N/A'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              user.is_active
                                ? 'bg-[var(--color-success-light)] text-[var(--color-success)] dark:bg-[var(--color-success)]/20 dark:text-[var(--color-success)]'
                                : 'bg-[var(--color-error-light)] text-[var(--color-error)] dark:bg-[var(--color-error)]/20 dark:text-[var(--color-error)]'
                            }`}
                          >
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        {/* Verified */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_verified ? (
                            <CheckCircle className="icon-md text-[var(--color-success)] dark:text-[var(--color-success)]" />
                          ) : (
                            <XCircle className="icon-md text-[var(--color-text-tertiary)]" />
                          )}
                        </td>

                        {/* Approved */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {user.is_approved ? (
                            <div className="flex items-center gap-1 text-sm text-[var(--color-success)] dark:text-[var(--color-success)]">
                              <CheckCircle className="icon-sm" />
                              <span>Yes</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-sm text-[var(--color-warning)] dark:text-[var(--color-warning)]">
                              <XCircle className="icon-sm" />
                              <span>Pending</span>
                            </div>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-tertiary)] dark:text-[var(--color-text-tertiary)]">
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
                                  className="inline-flex items-center gap-1 max-md:gap-2 px-3 py-2 max-md:px-4 max-md:py-3 text-xs max-md:text-sm bg-[var(--color-success)] text-[var(--color-text-primary)] rounded hover:bg-[var(--color-success)] disabled:opacity-50 transition-colors min-h-[32px] max-md:min-h-[44px]"
                                  title="Approve User"
                                  aria-label={`Approve user ${user.email}`}
                                >
                                  <UserCheck className="icon-xs max-md:icon-md" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectUser(user.user_id)}
                                  disabled={actionLoading}
                                  className="inline-flex items-center gap-1 max-md:gap-2 px-3 py-2 max-md:px-4 max-md:py-3 text-xs max-md:text-sm bg-[var(--color-error)] text-[var(--color-text-primary)] rounded hover:bg-[var(--color-error)] disabled:opacity-50 transition-colors min-h-[32px] max-md:min-h-[44px]"
                                  title="Reject User"
                                  aria-label={`Reject user ${user.email}`}
                                >
                                  <UserX className="icon-xs max-md:icon-md" />
                                  <span>Reject</span>
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
                                    className="inline-flex items-center gap-1 max-md:gap-2 px-3 py-2 max-md:px-4 max-md:py-3 text-xs max-md:text-sm bg-[var(--color-warning)] text-[var(--color-text-primary)] rounded hover:bg-[var(--color-warning)] disabled:opacity-50 transition-colors min-h-[32px] max-md:min-h-[44px]"
                                    title="Deactivate User"
                                    aria-label={`Deactivate user ${user.email}`}
                                  >
                                    <UserX className="icon-xs max-md:icon-md" />
                                    <span>Deactivate</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleActivateUser(user.user_id)}
                                    disabled={actionLoading}
                                    className="inline-flex items-center gap-1 max-md:gap-2 px-3 py-2 max-md:px-4 max-md:py-3 text-xs max-md:text-sm bg-[var(--color-primary)] text-[var(--color-text-primary)] rounded hover:bg-[var(--color-primary-hover)] disabled:opacity-50 transition-colors min-h-[32px] max-md:min-h-[44px]"
                                    title="Activate User"
                                    aria-label={`Activate user ${user.email}`}
                                  >
                                    <UserCheck className="icon-xs max-md:icon-md" />
                                    <span>Activate</span>
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
    </div>
  );
}
