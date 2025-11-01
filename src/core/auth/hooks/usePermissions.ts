/**
 * usePermissions Hook
 * 
 * Provides permission checking utilities for role-based access control in UI.
 * Use this hook to show/hide UI elements based on user permissions.
 * 
 * IMPORTANT: This is UI-level protection only. Backend must ALWAYS validate permissions.
 * 
 * @example
 * ```tsx
 * const { can, canAny } = usePermissions();
 * 
 * return (
 *   <div>
 *     {can(PERMISSIONS.USER_CREATE) && (
 *       <Button onClick={handleCreate}>Create User</Button>
 *     )}
 *     
 *     {canAny([PERMISSIONS.USER_UPDATE, PERMISSIONS.USER_DELETE]) && (
 *       <ActionsMenu />
 *     )}
 *   </div>
 * );
 * ```
 */

import { useAuth } from '../../../hooks/useAuth';
import { 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  ROLE_PERMISSIONS,
  type Permission,
  type Role 
} from '../roles';

export interface UsePermissionsReturn {
  /**
   * Check if user has a specific permission
   * @param permission - Permission to check
   * @returns true if user has the permission
   */
  can: (permission: Permission) => boolean;
  
  /**
   * Check if user has any of the specified permissions
   * @param permissions - Array of permissions to check
   * @returns true if user has at least one permission
   */
  canAny: (permissions: Permission[]) => boolean;
  
  /**
   * Check if user has all of the specified permissions
   * @param permissions - Array of permissions to check
   * @returns true if user has all permissions
   */
  canAll: (permissions: Permission[]) => boolean;
  
  /**
   * Get all permissions for the current user
   * @returns Array of all user permissions
   */
  getPermissions: () => Permission[];
  
  /**
   * Get all roles for the current user
   * @returns Array of user roles
   */
  getRoles: () => Role[];
  
  /**
   * Check if user has a specific role
   * @param role - Role to check
   * @returns true if user has the role
   */
  hasRole: (role: Role) => boolean;
  
  /**
   * Check if user is an admin
   * @returns true if user has admin role
   */
  isAdmin: () => boolean;
  
  /**
   * Check if user is a moderator
   * @returns true if user has moderator role
   */
  isModerator: () => boolean;
}

/**
 * Hook for checking user permissions in the UI
 */
export const usePermissions = (): UsePermissionsReturn => {
  const { user } = useAuth();
  const userRoles = (user?.roles as Role[]) || [];
  
  return {
    can: (permission: Permission): boolean => {
      return hasPermission(userRoles, permission);
    },
    
    canAny: (permissions: Permission[]): boolean => {
      return hasAnyPermission(userRoles, permissions);
    },
    
    canAll: (permissions: Permission[]): boolean => {
      return hasAllPermissions(userRoles, permissions);
    },
    
    getPermissions: (): Permission[] => {
      return userRoles.flatMap(role => ROLE_PERMISSIONS[role] || []);
    },
    
    getRoles: (): Role[] => {
      return userRoles;
    },
    
    hasRole: (role: Role): boolean => {
      return userRoles.includes(role);
    },
    
    isAdmin: (): boolean => {
      return userRoles.includes('admin');
    },
    
    isModerator: (): boolean => {
      return userRoles.includes('moderator');
    },
  };
};

export default usePermissions;
