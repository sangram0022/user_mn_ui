/**
 * Admin Role Management Hooks
 * React Query hooks for RBAC role and permission operations
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
// Query Keys
// ============================================================================

export const adminRoleKeys = {
  all: ['admin', 'roles'] as const,
  lists: () => [...adminRoleKeys.all, 'list'] as const,
  list: (params?: ListRolesParams) => [...adminRoleKeys.lists(), params] as const,
  details: () => [...adminRoleKeys.all, 'detail'] as const,
  detail: (name: string, params?: GetRoleParams) => [...adminRoleKeys.details(), name, params] as const,
};

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all roles with optional permissions/user counts
 */
export const useRoleList = (params?: ListRolesParams) => {
  return useQuery({
    queryKey: adminRoleKeys.list(params),
    queryFn: () => adminRoleService.listRoles(params),
    staleTime: 60000, // 1 minute - roles don't change often
  });
};

/**
 * Fetch single role details
 */
export const useRole = (roleName: string | undefined, params?: GetRoleParams) => {
  return useQuery({
    queryKey: adminRoleKeys.detail(roleName ?? '', params),
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
    queryKey: [...adminRoleKeys.all, 'byLevel', minLevel, maxLevel] as const,
    queryFn: () => adminRoleService.getRolesByLevel(minLevel, maxLevel),
    staleTime: 60000,
  });
};

/**
 * Check if user has specific role
 */
export const useCheckUserRole = (userId: string | undefined, roleName: string | undefined) => {
  return useQuery({
    queryKey: ['admin', 'roles', 'check', userId, roleName] as const,
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
      queryClient.invalidateQueries({ queryKey: adminRoleKeys.lists() });
      
      // Add to cache
      queryClient.setQueryData(
        adminRoleKeys.detail(role.role_name),
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
      await queryClient.cancelQueries({ queryKey: adminRoleKeys.detail(roleName) });

      // Snapshot previous value
      const previousRole = queryClient.getQueryData<AdminRole>(
        adminRoleKeys.detail(roleName)
      );

      // Optimistically update
      if (previousRole) {
        queryClient.setQueryData<AdminRole>(
          adminRoleKeys.detail(roleName),
          { ...previousRole, ...data }
        );
      }

      return { previousRole };
    },
    onError: (_err, { roleName }, context) => {
      // Rollback on error
      if (context?.previousRole) {
        queryClient.setQueryData(
          adminRoleKeys.detail(roleName),
          context.previousRole
        );
      }
    },
    onSuccess: (_response: UpdateRoleResponse, { roleName }) => {
      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: adminRoleKeys.detail(roleName) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: adminRoleKeys.lists() });
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
      queryClient.removeQueries({ queryKey: adminRoleKeys.detail(roleName) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: adminRoleKeys.lists() });
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
      queryClient.removeQueries({ queryKey: adminRoleKeys.detail(roleName) });
      queryClient.invalidateQueries({ queryKey: adminRoleKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'detail', userId] });
      
      // Invalidate role queries if include_users was set
      queryClient.invalidateQueries({ queryKey: adminRoleKeys.all });
    },
  });
};
