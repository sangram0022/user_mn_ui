/**
 * User List Filters Hook
 *
 * Client-side filtering logic for user lists
 * Filters users by search text, role, status, verified, approved
 * Supports sorting by multiple columns
 *
 * Performance optimized with useMemo for large datasets
 */

import { useMemo } from 'react';
import type { AdminUserListResponse } from '../../../shared/types/api-backend.types';
import type { UserFilters } from '../components/UserListFilters';

export interface UseUserListFiltersProps {
  users: AdminUserListResponse[];
  filters: UserFilters;
}

export interface UseUserListFiltersReturn {
  filteredUsers: AdminUserListResponse[];
  filteredCount: number;
  totalCount: number;
}

/**
 * Apply client-side filtering and sorting to user list
 *
 * @param users - Original unfiltered user list from backend
 * @param filters - Current filter state
 * @returns Filtered and sorted user list with counts
 *
 * @example
 * ```typescript
 * const { filteredUsers, filteredCount, totalCount } = useUserListFilters({
 *   users: allUsers,
 *   filters: currentFilters
 * });
 * ```
 */
export function useUserListFilters({
  users,
  filters,
}: UseUserListFiltersProps): UseUserListFiltersReturn {
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Text search filter (name or email)
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      result = result.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const email = user.email.toLowerCase();
        return fullName.includes(searchLower) || email.includes(searchLower);
      });
    }

    // Role filter
    if (filters.role !== 'all') {
      result = result.filter((user) => user.role === filters.role);
    }

    // Status filter (active/inactive)
    if (filters.status !== 'all') {
      const isActive = filters.status === 'active';
      result = result.filter((user) => user.is_active === isActive);
    }

    // Verified filter
    if (filters.verified !== 'all') {
      const isVerified = filters.verified === 'verified';
      result = result.filter((user) => user.is_verified === isVerified);
    }

    // Approved filter
    if (filters.approved !== 'all') {
      const isApproved = filters.approved === 'approved';
      result = result.filter((user) => user.is_approved === isApproved);
    }

    // Sorting
    result.sort((a, b) => {
      let aValue: string | number | null;
      let bValue: string | number | null;

      switch (filters.sortBy) {
        case 'email':
          aValue = a.email;
          bValue = b.email;
          break;
        case 'first_name':
          aValue = a.first_name;
          bValue = b.first_name;
          break;
        case 'last_name':
          aValue = a.last_name;
          bValue = b.last_name;
          break;
        case 'created_at':
          aValue = a.created_at;
          bValue = b.created_at;
          break;
        case 'last_login_at':
          aValue = a.last_login_at ?? '';
          bValue = b.last_login_at ?? '';
          break;
        default:
          aValue = a.created_at;
          bValue = b.created_at;
      }

      // Handle null values
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return filters.sortOrder === 'asc' ? comparison : -comparison;
      }

      // Number comparison
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [users, filters]);

  return {
    filteredUsers,
    filteredCount: filteredUsers.length,
    totalCount: users.length,
  };
}

/**
 * Export user list to CSV format
 * Includes all filtered users with selected fields
 *
 * @param users - Filtered user list to export
 * @returns CSV content as string
 *
 * @example
 * ```typescript
 * const csvContent = exportUsersToCSV(filteredUsers);
 * const blob = new Blob([csvContent], { type: 'text/csv' });
 * saveAs(blob, 'users.csv');
 * ```
 */
export function exportUsersToCSV(users: AdminUserListResponse[]): string {
  const headers = [
    'User ID',
    'Email',
    'First Name',
    'Last Name',
    'Role',
    'Active',
    'Verified',
    'Approved',
    'Created At',
    'Last Login',
  ];

  const rows = users.map((user) => [
    user.user_id,
    user.email,
    user.first_name,
    user.last_name,
    user.role,
    user.is_active ? 'Yes' : 'No',
    user.is_verified ? 'Yes' : 'No',
    user.is_approved ? 'Yes' : 'No',
    user.created_at,
    user.last_login_at ?? 'Never',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download filtered users as CSV file
 *
 * @param users - Filtered user list to download
 * @param filename - Output filename (default: 'users.csv')
 *
 * @example
 * ```typescript
 * downloadUsersAsCSV(filteredUsers, 'active-admins.csv');
 * ```
 */
export function downloadUsersAsCSV(users: AdminUserListResponse[], filename = 'users.csv'): void {
  const csvContent = exportUsersToCSV(users);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
