// ========================================
// Role Permissions Hook
// ========================================

import { useState, useEffect } from 'react';
import type { AdminRole, RolePermission } from '../../types';
import { RESOURCE_ACTIONS, RESOURCES } from './constants';

export interface RoleFormData {
  display_name: string;
  description: string;
  level: number;
  permissions: Map<string, Set<string>>;
}

export function useRolePermissions(role: AdminRole | undefined) {
  const [formData, setFormData] = useState<RoleFormData>({
    display_name: '',
    description: '',
    level: 1,
    permissions: new Map<string, Set<string>>(),
  });

  // Initialize form data when role loads
  useEffect(() => {
    if (role) {
      const permissionsMap = new Map<string, Set<string>>();
      
      role.permissions.forEach((perm: RolePermission) => {
        permissionsMap.set(perm.resource, new Set(perm.actions));
      });

      setFormData({
        display_name: role.display_name,
        description: role.description || '',
        level: role.level,
        permissions: permissionsMap,
      });
    }
  }, [role]);

  const togglePermission = (resource: string, action: string) => {
    setFormData((prev) => {
      const newPermissions = new Map(prev.permissions);
      const resourceActions = newPermissions.get(resource) || new Set<string>();
      
      if (resourceActions.has(action)) {
        resourceActions.delete(action);
      } else {
        resourceActions.add(action);
      }
      
      if (resourceActions.size === 0) {
        newPermissions.delete(resource);
      } else {
        newPermissions.set(resource, resourceActions);
      }
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const selectAllForResource = (resource: string) => {
    const availableActions = RESOURCE_ACTIONS[resource] || [];
    setFormData((prev) => {
      const newPermissions = new Map(prev.permissions);
      newPermissions.set(resource, new Set(availableActions));
      return { ...prev, permissions: newPermissions };
    });
  };

  const deselectAllForResource = (resource: string) => {
    setFormData((prev) => {
      const newPermissions = new Map(prev.permissions);
      newPermissions.delete(resource);
      return { ...prev, permissions: newPermissions };
    });
  };

  const selectAllForAction = (action: string) => {
    setFormData((prev) => {
      const newPermissions = new Map(prev.permissions);
      
      RESOURCES.forEach((resource) => {
        const availableActions = RESOURCE_ACTIONS[resource] || [];
        if (availableActions.includes(action)) {
          const resourceActions = newPermissions.get(resource) || new Set<string>();
          resourceActions.add(action);
          newPermissions.set(resource, resourceActions);
        }
      });
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const deselectAllForAction = (action: string) => {
    setFormData((prev) => {
      const newPermissions = new Map(prev.permissions);
      
      RESOURCES.forEach((resource) => {
        const resourceActions = newPermissions.get(resource);
        if (resourceActions) {
          resourceActions.delete(action);
          if (resourceActions.size === 0) {
            newPermissions.delete(resource);
          }
        }
      });
      
      return { ...prev, permissions: newPermissions };
    });
  };

  const hasPermission = (resource: string, action: string): boolean => {
    return formData.permissions.get(resource)?.has(action) || false;
  };

  const isResourceFullySelected = (resource: string): boolean => {
    const availableActions = RESOURCE_ACTIONS[resource] || [];
    const selectedActions = formData.permissions.get(resource);
    return availableActions.length > 0 && selectedActions?.size === availableActions.length;
  };

  const isActionFullySelected = (action: string): boolean => {
    let hasAll = true;
    RESOURCES.forEach((resource) => {
      const availableActions = RESOURCE_ACTIONS[resource] || [];
      if (availableActions.includes(action)) {
        if (!hasPermission(resource, action)) {
          hasAll = false;
        }
      }
    });
    return hasAll;
  };

  const getTotalPermissions = () => {
    return Array.from(formData.permissions.values()).reduce(
      (sum, actions) => sum + actions.size,
      0
    );
  };

  return {
    formData,
    setFormData,
    togglePermission,
    selectAllForResource,
    deselectAllForResource,
    selectAllForAction,
    deselectAllForAction,
    hasPermission,
    isResourceFullySelected,
    isActionFullySelected,
    getTotalPermissions,
  };
}
