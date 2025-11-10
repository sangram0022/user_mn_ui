/**
 * Users Management Page - Real API Integration
 * Clean, production-ready implementation with zero errors
 */

import { useState } from 'react';
import Button from '@/shared/components/ui/Button';
import ErrorAlert from '@/shared/components/ui/ErrorAlert';
import { 
  useUserList, 
  useDeleteUser, 
  useBulkDeleteUsers,
  useExportUsers 
} from '../hooks';
import type { UserStatus } from '../types';
import {
  UserFilters,
  UserStatsCards,
  BulkActionsBar,
  UsersTable,
  Pagination,
} from './components/users';

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
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setAppliedSearch('');
    setRoleFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setCurrentPage(1);
  };

  const handleClearRoleFilter = () => {
    setRoleFilter('all');
    setCurrentPage(1);
  };

  const handleClearStatusFilter = () => {
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

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
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
      <UserFilters
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        appliedSearch={appliedSearch}
        roleFilter={roleFilter}
        setRoleFilter={handleRoleFilterChange}
        statusFilter={statusFilter}
        setStatusFilter={handleStatusFilterChange}
        onSearch={handleSearch}
        onClearFilters={handleClearFilters}
        onClearSearch={handleClearSearch}
        onClearRoleFilter={handleClearRoleFilter}
        onClearStatusFilter={handleClearStatusFilter}
        onExport={handleExport}
        isLoading={isLoading}
        isExporting={exportUsers.isPending}
      />

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
        <UserStatsCards totalCount={totalCount} users={users} />
      )}

      {/* Bulk Actions */}
      {!isLoading && !isError && (
        <BulkActionsBar
          selectedCount={selectedUsers.size}
          onClearSelection={() => setSelectedUsers(new Set())}
          onBulkDelete={handleBulkDelete}
          isDeleting={bulkDelete.isPending}
        />
      )}

      {/* Users Table with Pagination */}
      {!isLoading && !isError && (
        <div>
          <UsersTable
            users={users}
            selectedUsers={selectedUsers}
            sortField={sortField}
            sortDirection={sortDirection}
            onToggleSelection={toggleUserSelection}
            onToggleSelectAll={toggleSelectAll}
            onSort={handleSort}
            onDeleteUser={handleDeleteUser}
            isDeleting={deleteUser.isPending}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      )}
    </div>
  );
}
