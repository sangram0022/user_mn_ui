/**
 * React 19 Optimistic Updates for Role Management
 *
 * Provides optimistic CRUD operations for roles and permissions
 * with instant UI feedback and automatic rollback on errors
 */

import { useOptimisticCRUD, type OptimisticListItem } from '@shared/hooks/useReact19Features';

export interface OptimisticRole extends OptimisticListItem {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count?: number;
  created_at?: string;
  updated_at?: string;
  isOptimistic?: boolean;
}

export interface OptimisticPermission extends OptimisticListItem {
  id: string;
  name: string;
  description: string;
  category: string;
  isOptimistic?: boolean;
}

export interface RoleFormData {
  role_name: string;
  description: string;
  permissions: string[];
}

/**
 * Custom hook for role management with optimistic updates
 *
 * @example
 * ```tsx
 * const {
 *   roles,
 *   createRole,
 *   updateRole,
 *   deleteRole,
 *   isOptimistic
 * } = useOptimisticRoleManagement(initialRoles);
 *
 * // Instant UI update
 * await createRole({ role_name: 'Editor', description: 'Content Editor', permissions: [] });
 * ```
 */
export function useOptimisticRoleManagement(
  initialRoles: OptimisticRole[],
  apiService: {
    createRole: (data: RoleFormData) => Promise<OptimisticRole>;
    updateRole: (id: string, data: Partial<RoleFormData>) => Promise<OptimisticRole>;
    deleteRole: (id: string) => Promise<void>;
    assignRole: (userId: string, roleId: string) => Promise<void>;
    revokeRole: (userId: string, roleId: string) => Promise<void>;
  }
) {
  const crud = useOptimisticCRUD<OptimisticRole>(initialRoles);

  return {
    roles: crud.items,
    setRoles: crud.setItems,

    createRole: async (roleData: RoleFormData) => {
      const optimisticRole: OptimisticRole = {
        id: `temp-${Date.now()}`,
        name: roleData.role_name,
        description: roleData.description,
        permissions: roleData.permissions,
        user_count: 0,
        created_at: new Date().toISOString(),
        isOptimistic: true,
      };

      await crud.create(optimisticRole, async () => {
        const created = await apiService.createRole(roleData);
        return {
          ...created,
          id: String(created.id || created.role_id),
          name: created.role_name || created.name,
          isOptimistic: false,
        } as OptimisticRole;
      });
    },

    updateRole: async (roleId: string, updates: Partial<RoleFormData>) => {
      const updatePayload: Record<string, unknown> = {};
      if (updates.role_name) updatePayload.name = updates.role_name;
      if (updates.description) updatePayload.description = updates.description;
      if (updates.permissions) updatePayload.permissions = updates.permissions;

      await crud.update(roleId, updatePayload, async () => {
        const updated = await apiService.updateRole(roleId, updates);
        return {
          ...updated,
          id: String(updated.id || updated.role_id),
          name: updated.role_name || updated.name,
          isOptimistic: false,
        } as OptimisticRole;
      });
    },

    deleteRole: async (roleId: string) => {
      await crud.delete(roleId, async () => {
        await apiService.deleteRole(roleId);
      });
    },

    assignRole: async (userId: string, roleId: string) => {
      // This would be tracked separately in a user-role junction
      await apiService.assignRole(userId, roleId);
    },

    revokeRole: async (userId: string, roleId: string) => {
      await apiService.revokeRole(userId, roleId);
    },

    isOptimistic: crud.isOptimistic,
  };
}

/**
 * Integration example for RoleManagementPage.tsx:
 *
 * ```tsx
 * import { useOptimisticRoleManagement } from '@domains/admin/hooks/useOptimisticRoleManagement';
 * import { adminService } from '@services/admin-backend.service';
 *
 * // Inside component
 * const {
 *   roles,
 *   createRole,
 *   updateRole,
 *   deleteRole,
 *   isOptimistic
 * } = useOptimisticRoleManagement(initialRoles, {
 *   createRole: adminService.createRole.bind(adminService),
 *   updateRole: adminService.updateRole.bind(adminService),
 *   deleteRole: adminService.deleteRole.bind(adminService),
 *   assignRole: adminService.assignRole.bind(adminService),
 *   revokeRole: adminService.revokeRole.bind(adminService),
 * });
 *
 * // Use in action handlers
 * const handleCreateRole = async (formData: FormData) => {
 *   const roleData = {
 *     role_name: formData.get('role_name') as string,
 *     description: formData.get('description') as string,
 *     permissions: formData.getAll('permissions') as string[],
 *   };
 *
 *   try {
 *     await createRole(roleData); // Instant UI update!
 *     onClose();
 *   } catch (error) {
 *     showError('Failed to create role');
 *     // UI automatically rolled back
 *   }
 * };
 *
 * // Visual indicator
 * {roles.map((role) => (
 *   <div
 *     key={role.id}
 *     className={isOptimistic(role) ? 'opacity-60 animate-pulse' : ''}
 *   >
 *     <h3>{role.name}</h3>
 *     {isOptimistic(role) && <span className="text-xs">Saving...</span>}
 *   </div>
 * ))}
 * ```
 */

export default useOptimisticRoleManagement;
