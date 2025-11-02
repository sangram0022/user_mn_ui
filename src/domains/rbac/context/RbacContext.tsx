// ========================================
// RBAC Context - Separated for React Fast Refresh
// ========================================

import { createContext } from 'react';
import type { RbacContextValue } from '../types/rbac.types';
import { RoleLevel } from '../types/rbac.types';

/**
 * RBAC Context - Central permission state
 * Separated for React Fast Refresh compatibility
 */
export const RbacContext = createContext<RbacContextValue>({
  permissions: [],
  userRoles: [],
  hasRole: () => false,
  hasPermission: () => false,
  hasAllPermissions: () => false,
  hasAnyPermission: () => false,
  hasAccess: () => false,
  getRoleLevel: () => RoleLevel.PUBLIC,
  hasRoleLevel: () => false,
  canAccessEndpoint: () => false,
  getEndpointPermissions: () => null,
});


