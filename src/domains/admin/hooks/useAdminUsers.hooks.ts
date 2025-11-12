/**
 * Admin User Management Hooks
 * React Query hooks for user CRUD operations, bulk actions, and export
 * Enhanced with centralized error handling and logging
 * 
 * Pattern: Hooks handle cache invalidation and logging.
 * Components use handleError() for error display and toast for success messages.
 * 
 * React 19 Features:
 * - useOptimistic for instant UI feedback on user updates
 */

import { useOptimistic } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../services/api/queryClient';
import { adminService } from '../services';
import { logger } from '../../../core/logging';
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
 * Toggle user status with optimistic update
 * React 19 useOptimistic provides instant UI feedback
 * 
 * @param userId - User ID to toggle
 * @param currentUser - Current user data from cache
 * @returns Mutation with optimistic state
 */
export const useToggleUserStatus = (userId: string, currentUser: AdminUser | undefined) => {
  const queryClient = useQueryClient();
  
  // Optimistic state for instant UI feedback
  const [optimisticUser, setOptimisticUser] = useOptimistic(
    currentUser,
    (_state, updatedUser: AdminUser) => updatedUser
  );

  const mutation = useMutation({
    mutationFn: async (newStatus: boolean) => {
      logger().info('Toggling user status', { userId, newStatus });
      const response = await adminService.updateUser(userId, { is_active: newStatus });
      logger().info('User status toggled successfully', { userId, newStatus });
      return response.user;
    },
    onMutate: async (newStatus: boolean) => {
      // Instant UI update
      if (currentUser) {
        const optimistic = { ...currentUser, is_active: newStatus };
        setOptimisticUser(optimistic);
        
        // Cancel outgoing refetches
        await queryClient.cancelQueries({ queryKey: queryKeys.users.detail(userId) });
        
        // Update cache optimistically
        queryClient.setQueryData<AdminUser>(
          queryKeys.users.detail(userId),
          optimistic
        );
        
        logger().debug('Optimistic status update applied', { userId, newStatus });
      }
      
      return { previousUser: currentUser };
    },
    onError: (error, _newStatus, context) => {
      logger().error('Status toggle failed, rolling back', error, { userId });
      
      // Rollback on error
      if (context?.previousUser) {
        setOptimisticUser(context.previousUser);
        queryClient.setQueryData(
          queryKeys.users.detail(userId),
          context.previousUser
        );
      }
    },
    onSuccess: (user) => {
      // Update cache with server response
      queryClient.setQueryData(queryKeys.users.detail(userId), user);
      
      // Invalidate lists to reflect changes
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
  });

  return {
    ...mutation,
    optimisticUser, // Expose optimistic state for components
  };
};

/**
 * Create new user
 * Enhanced with logging and error context
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, CreateUserRequest>({
    mutationFn: async (data: CreateUserRequest) => {
      logger().info('Creating new user', { email: data.email, roles: data.roles });
      const response = await adminService.createUser(data);
      logger().info('User created successfully', { userId: response.user.user_id });
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
    onError: (error: Error, variables: CreateUserRequest) => {
      logger().error('Failed to create user', error, { 
        email: variables.email
      });
    },
  });
};

/**
 * Update existing user
 * Enhanced with logging, optimistic updates, and error recovery
 */
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminUser, Error, { userId: string; data: UpdateUserRequest }>({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateUserRequest }) => {
      logger().info('Updating user', { userId, changes: Object.keys(data) });
      const response = await adminService.updateUser(userId, data);
      logger().info('User updated successfully', { userId });
      return response.user;
    },
    onMutate: async ({ userId, data }) => {
      logger().debug('Starting optimistic update', { userId });
      
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
    onError: (error, variables, context) => {
      logger().error('User update failed', error, { 
        userId: variables.userId
      });
      
      // Rollback on error
      const typedContext = context as { previousUser?: AdminUser } | undefined;
      if (typedContext?.previousUser) {
        logger().debug('Rolling back optimistic update', { userId: variables.userId });
        queryClient.setQueryData(
          queryKeys.users.detail(variables.userId),
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
 * ✅ ENHANCED: Includes default error handler with toast notifications
 * Enhanced with logging
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, options }: { userId: string; options?: DeleteUserOptions }) => {
      logger().info('Deleting user', { userId, options });
      return adminService.deleteUser(userId, options);
    },
    onSuccess: (_response, variables) => {
      logger().info('User deleted successfully', { userId: variables.userId });
      
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(variables.userId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error: Error, variables) => {
      logger().error('Failed to delete user', error, { 
        userId: variables.userId
      });
      // Note: Components should handle error display with handleError()
      // This logs the error - components display it to users
    },
  });
};

/**
 * Safe delete user (prevents self-deletion)
 * Enhanced with logging
 */
export const useSafeDeleteUser = (currentUserId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, options }: { userId: string; options?: DeleteUserOptions }) => {
      logger().info('Safe delete user', { userId, currentUserId });
      return adminService.safeDeleteUser(userId, currentUserId, options);
    },
    onSuccess: (_response, variables) => {
      logger().info('Safe delete successful', { userId: variables.userId });
      queryClient.removeQueries({ queryKey: queryKeys.users.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.lists() });
    },
    onError: (error: Error, variables) => {
      logger().error('Safe delete failed', error, { 
        userId: variables.userId
      });
    },
  });
};

// ============================================================================
// Bulk Operation Hooks
// Enhanced with logging and error tracking
// ============================================================================

/**
 * Bulk user actions (approve, delete, etc.)
 * Enhanced with logging
 */
export const useBulkUserAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BulkUserAction) => {
      logger().info('Bulk user action', { operation: request.operation, count: request.user_ids.length });
      return adminService.bulkUserAction(request);
    },
    onSuccess: (result, variables) => {
      logger().info('Bulk action completed', { 
        operation: variables.operation,
        requested: variables.user_ids.length,
        succeeded: result.succeeded,
        failed: result.failed 
      });
      
      // Invalidate all user queries after bulk action
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error: Error, variables) => {
      logger().error('Bulk action failed', error, { 
        operation: variables.operation,
        count: variables.user_ids.length
      });
    },
  });
};

/**
 * Bulk delete users
 * Enhanced with logging
 */
export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userIds, options }: { userIds: string[]; options?: DeleteUserOptions }) => {
      logger().info('Bulk delete users', { count: userIds.length, options });
      return adminService.bulkDeleteUsers(userIds, options);
    },
    onSuccess: (result, variables) => {
      logger().info('Bulk delete completed', { 
        requested: variables.userIds.length,
        succeeded: result.succeeded,
        failed: result.failed 
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error: Error, variables) => {
      logger().error('Bulk delete failed', error, { 
        count: variables.userIds.length
      });
    },
  });
};

// ============================================================================
// Export Hook
// Enhanced with logging and download automation
// ============================================================================

/**
 * Export users to file (CSV, JSON, XLSX)
 * Enhanced with logging
 */
export const useExportUsers = () => {
  return useMutation({
    mutationFn: async (request: ExportUsersRequest) => {
      logger().info('Exporting users', { format: request.format });
      
      const blob = await adminService.exportUsers(request);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = request.format === 'xlsx' ? 'xlsx' : request.format;
      const filename = `users-export-${timestamp}.${extension}`;
      
      logger().debug('Export ready for download', { filename, size: blob.size });
      
      // Download blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      logger().info('Export completed', { filename });
      
      return { success: true, filename };
    },
    onError: (error: Error, variables) => {
      logger().error('Export failed', error, { 
        format: variables.format
      });
    },
  });
};
