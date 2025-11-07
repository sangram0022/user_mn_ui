/**
 * Admin Role Management Hooks
 * React Query hooks for RBAC role and permission operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../services/api/queryClient';
import { adminRoleService } from '../services';
import type {
  ListRolesParams,
  GetRoleParams,
  CreateRoleRequest,
  UpdateRoleRequest,
  UpdateRoleResponse,
  DeleteRoleOptions,
  DeleteRoleResponse,
  AssignRolesRequest,
  AssignRolesResponse,
  AdminRole,
} from '../types';

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all roles with optional permissions/user counts
 */
export const useRoleList = (params?: ListRolesParams) => {
  return useQuery({
    queryKey: queryKeys.rbac.roles.list(params),
    queryFn: () => adminRoleService.listRoles(params),
    staleTime: 60000, // 1 minute - roles don't change often
  });
};

/**
 * Fetch single role details
 */
export const useRole = (roleName: string | undefined, params?: GetRoleParams) => {
  return useQuery({
    queryKey: queryKeys.rbac.roles.detail(roleName ?? ''),
    queryFn: () => adminRoleService.getRole(roleName!, params),
    enabled: !!roleName,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Get roles by hierarchy level
 */
export const useRolesByLevel = (minLevel?: number, maxLevel?: number) => {
  return useQuery({
    queryKey: [...queryKeys.rbac.roles.all, 'byLevel', minLevel, maxLevel] as const,
    queryFn: () => adminRoleService.getRolesByLevel(minLevel, maxLevel),
    staleTime: 60000,
  });
};

/**
 * Check if user has specific role
 */
export const useCheckUserRole = (userId: string | undefined, roleName: string | undefined) => {
  return useQuery({
    queryKey: queryKeys.rbac.roles.check(userId || '', roleName || ''),
    queryFn: () => adminRoleService.checkUserRole(userId!, roleName!),
    enabled: !!userId && !!roleName,
    staleTime: 30000, // 30 seconds
  });
};

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create custom role
 */
export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation<AdminRole, Error, CreateRoleRequest>({
    mutationFn: (data: CreateRoleRequest) => adminRoleService.createRole(data),
    onSuccess: (role: AdminRole) => {
      // Invalidate role lists
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.lists() });
      
      // Add to cache
      queryClient.setQueryData(
        queryKeys.rbac.roles.detail(role.role_name),
        role
      );
    },
  });
};

/**
 * Update role
 */
export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleName, data }: { roleName: string; data: UpdateRoleRequest }) =>
      adminRoleService.updateRole(roleName, data),
    onMutate: async ({ roleName, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.rbac.roles.detail(roleName) });

      // Snapshot previous value
      const previousRole = queryClient.getQueryData<AdminRole>(
        queryKeys.rbac.roles.detail(roleName)
      );

      // Optimistically update
      if (previousRole) {
        queryClient.setQueryData<AdminRole>(
          queryKeys.rbac.roles.detail(roleName),
          { ...previousRole, ...data }
        );
      }

      return { previousRole };
    },
    onError: (_err, { roleName }, context) => {
      // Rollback on error
      if (context?.previousRole) {
        queryClient.setQueryData(
          queryKeys.rbac.roles.detail(roleName),
          context.previousRole
        );
      }
    },
    onSuccess: (_response: UpdateRoleResponse, { roleName }) => {
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.detail(roleName) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.lists() });
    },
  });
};

/**
 * Delete role
 */
export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleName, options }: { roleName: string; options?: DeleteRoleOptions }) =>
      adminRoleService.deleteRole(roleName, options),
    onSuccess: (_response: DeleteRoleResponse, { roleName }) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: queryKeys.rbac.roles.detail(roleName) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.lists() });
    },
  });
};

/**
 * Safe delete role (prevents system role deletion)
 */
export const useSafeDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleName, options }: { roleName: string; options?: DeleteRoleOptions }) =>
      adminRoleService.safeDeleteRole(roleName, options),
    onSuccess: (_response: DeleteRoleResponse, { roleName }) => {
      queryClient.removeQueries({ queryKey: queryKeys.rbac.roles.detail(roleName) });
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.lists() });
    },
  });
};

/**
 * Assign roles to user
 */
export const useAssignRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AssignRolesRequest }) =>
      adminRoleService.assignRolesToUser(userId, data),
    onSuccess: (_response: AssignRolesResponse, { userId }) => {
      // Invalidate user queries to reflect new roles
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(userId) });
      
      // Invalidate role queries if include_users was set
      queryClient.invalidateQueries({ queryKey: queryKeys.rbac.roles.all });
    },
  });
};

// ============================================================================
// Export Hooks
// ============================================================================

/**
 * Export roles in various formats
 */
export const useExportRoles = () => {
  return useMutation({
    mutationFn: async (request: {
      format: 'csv' | 'json' | 'xlsx';
      filters?: { include_permissions?: boolean; include_users_count?: boolean };
    }) => {
      const blob = await adminRoleService.exportRoles(request.format, request.filters);
      
      // Generate filename
      const timestamp = new Date().toISOString().split('T')[0];
      const extension = request.format === 'xlsx' ? 'xlsx' : request.format;
      const filename = `roles-export-${timestamp}.${extension}`;
      
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
