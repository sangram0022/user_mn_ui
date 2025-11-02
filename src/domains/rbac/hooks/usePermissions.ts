// ========================================
// usePermissions Hook
// ========================================
// Central hook for permission checking
// Provides all RBAC checking methods
// ========================================

import { use } from 'react';
import { RbacContext } from '../context/RbacContext';

/**
 * Main hook for permission checking
 * Use this in any component to check permissions
 *
 * Example:
 * ```tsx
 * const { hasRole, hasPermission, hasAccess } = usePermissions();
 *
 * if (hasRole('admin')) {
 *   // Render admin features
 * }
 *
 * if (hasAccess({ requiredRole: 'manager', requiredPermissions: 'users:*' })) {
 *   // Render manager features
 * }
 * ```
 */
export function usePermissions() {
  const context = use(RbacContext);

  if (!context) {
    throw new Error('usePermissions must be used within RbacProvider');
  }

  return context;
}

/**
 * Hook to check single role
 * ✅ Simpler API for common use case
 */
export function useRole(role: string): boolean {
  const { hasRole } = usePermissions();
  return hasRole(role as any); // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Hook to check single permission
 * ✅ Simpler API for common use case
 */
export function usePermission(permission: string): boolean {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
}

/**
 * Hook to get user roles
 */
export function useUserRoles() {
  const { userRoles } = usePermissions();
  return userRoles;
}

/**
 * Hook to get user permissions
 */
export function useUserPermissions() {
  const { permissions } = usePermissions();
  return permissions;
}
