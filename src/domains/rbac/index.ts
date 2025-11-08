// ========================================
// RBAC Index - Centralized exports
// ========================================
// Use this for easier imports throughout the app
// ========================================

// Export contexts (optimized)
export { RbacContext } from './context/RbacContext';
export { RbacProvider } from './context/OptimizedRbacProvider';
export type { RbacContextValue } from './types/rbac.types';

// Export hooks
export { usePermissions, useRole, usePermission, useUserRoles, useUserPermissions } from './hooks/usePermissions';

// Export utilities
export {
  ROLE_HIERARCHY,
  ROLE_PERMISSIONS,
  PERMISSION_CONSTANTS,
  RoleLevel,
  getEffectivePermissions,
  getEffectivePermissionsForRoles,
  checkPermissionMatch,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  hasMinimumRoleLevel,
  hasAnyRole,
  getRoleDisplayName,
  getRoleLevelName,
  getAllRoles,
  getAllPermissions,
} from './utils/rolePermissionMap';

export {
  API_ENDPOINTS,
  getEndpointRoles,
  isEndpointPublic,
  getAccessibleEndpoints,
} from './utils/apiRoleMapping';

// AWS CloudWatch handles performance utilities

// Export types
export type { UserRole, Permission, AccessCheckOptions, PermissionCheckResult, ApiEndpointConfig, RoleBasedButtonProps, CanAccessProps, RolePermissionMapping } from './types/rbac.types';
