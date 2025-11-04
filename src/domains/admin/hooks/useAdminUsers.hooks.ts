/**
 * Admin User Management Hooks
 * React Query hooks for user CRUD operations, bulk actions, and export
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
// Query Keys
// ============================================================================

export const adminUserKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (filters?: ListUsersFilters) => [...adminUserKeys.lists(), filters] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (id: string) => [...adminUserKeys.details(), id] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch paginated and filtered user list
 */
export const useUserList = (filters?: ListUsersFilters) => {
  return useQuery({
    queryKey: adminUserKeys.list(filters),
    queryFn: () => adminService.listUsers(filters),
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Fetch single user details with stats
 */
export const useUser = (userId: string | undefined) => {
  return useQuery({
    queryKey: adminUserKeys.detail(userId ?? ''),
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
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      
      // Optimistically add to cache
      queryClient.setQueryData(
        adminUserKeys.detail(user.user_id),
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
      await queryClient.cancelQueries({ queryKey: adminUserKeys.detail(userId) });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<AdminUser>(
        adminUserKeys.detail(userId)
      );

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData<AdminUser>(
          adminUserKeys.detail(userId),
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
          adminUserKeys.detail(userId),
          typedContext.previousUser
        );
      }
    },
    onSuccess: (user: AdminUser, { userId }) => {
      // Update cache with server response
      queryClient.setQueryData(
        adminUserKeys.detail(userId),
        user
      );
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
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
      queryClient.removeQueries({ queryKey: adminUserKeys.detail(userId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
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
      queryClient.removeQueries({ queryKey: adminUserKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
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
      queryClient.invalidateQueries({ queryKey: adminUserKeys.all });
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
    mutationFn: (request: ExportUsersRequest) =>
      adminService.exportUsers(request),
  });
};
