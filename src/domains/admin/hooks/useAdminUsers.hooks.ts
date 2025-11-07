/**
 * Admin User Management Hooks
 * React Query hooks for user CRUD operations, bulk actions, and export
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../services/api/queryClient';
import { adminService } from '../services';
import type {
  ListUsersFilters,
  CreateUserRequest,
  AdminUser,
  UpdateUserRequest,
  DeleteUserOptions,
  BulkUserAction,
  ExportUsersRequest,
} from '../types';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch paginated and filtered user list
 */
export const useUserList = (filters?: ListUsersFilters) => {
  return useQuery({
    queryKey: queryKeys.users.list(filters),
    queryFn: () => adminService.listUsers(filters),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Fetch single user details with stats
 */
export const useUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.users.detail(userId ?? ''),
    queryFn: () => adminService.getUser(userId!),
    enabled: !!userId,
    staleTime: 60000, // 1 minute
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create new user
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, CreateUserRequest>({
    mutationFn: async (data: CreateUserRequest) => {
      const response = await adminService.createUser(data);
      return response.user;
    },
    onSuccess: (user: AdminUser) => {
      // Invalidate user lists to refetch with new user
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
      
      // Optimistically add to cache
      queryClient.setQueryData(
        queryKeys.users.detail(user.user_id),
        user
      );
    },
  });
};

/**
 * Update existing user
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, { userId: string; data: UpdateUserRequest }>({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserRequest }) => {
      const response = await adminService.updateUser(userId, data);
      return response.user;
    },
    onMutate: async ({ userId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<AdminUser>(
        queryKeys.users.detail(userId)
      );

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData<AdminUser>(
          queryKeys.users.detail(userId),
          { ...previousUser, ...data }
        );
      }

      return { previousUser };
    },
    onError: (_err, { userId }, context) => {
      // Rollback on error
      const typedContext = context as { previousUser?: AdminUser } | undefined;
      if (typedContext?.previousUser) {
        queryClient.setQueryData(
          queryKeys.users.detail(userId),
          typedContext.previousUser
        );
      }
    },
    onSuccess: (user: AdminUser, { userId }) => {
      // Update cache with server response
      queryClient.setQueryData(
        queryKeys.users.detail(userId),
        user
      );
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

/**
 * Delete user (soft or hard delete)
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, options }: { userId: string; options?: DeleteUserOptions }) =>
      adminService.deleteUser(userId, options),
    onSuccess: (_response, { userId }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

/**
 * Safe delete user (prevents self-deletion)
 */
export const useSafeDeleteUser = (currentUserId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, options }: { userId: string; options?: DeleteUserOptions }) =>
      adminService.safeDeleteUser(userId, currentUserId, options),
    onSuccess: (_response, { userId }) => {
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });
};

// ============================================================================
// Bulk Operation Hooks
// ============================================================================

/**
 * Bulk user actions (approve, delete, etc.)
 */
export const useBulkUserAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkUserAction) =>
      adminService.bulkUserAction(request),
    onSuccess: () => {
      // Invalidate all user queries after bulk action
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Bulk delete users
 */
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, options }: { userIds: string[]; options?: DeleteUserOptions }) =>
      adminService.bulkDeleteUsers(userIds, options),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

// ============================================================================
// Export Hook
// ============================================================================

/**
 * Export users to file (CSV, JSON, XLSX)
 */
export const useExportUsers = () => {
  return useMutation({
    mutationFn: async (request: ExportUsersRequest) => {
      const blob = await adminService.exportUsers(request);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = request.format === 'xlsx' ? 'xlsx' : request.format;
      const filename = `users-export-${timestamp}.${extension}`;
      
      // Download blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true, filename };
    },
  });
};
