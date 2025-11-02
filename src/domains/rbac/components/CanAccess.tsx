/**
 * ========================================
 * CanAccess Component
 * ========================================
 * Conditionally renders children based on role/permission checks
 * Used to show/hide UI elements based on user permissions
 *
 * @example
 * <CanAccess requiredRole="admin">
 *   <AdminPanel />
 * </CanAccess>
 * ========================================
 */

import type { ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import type { UserRole, Permission } from '../types/rbac.types';

interface CanAccessProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: Permission | Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * CanAccess - Conditional rendering wrapper for RBAC
 *
 * Props:
 * - requiredRole: Single role or array of roles (ANY match required by default)
 * - requiredPermission: Single permission or array (ANY match required by default)
 * - requireAll: If true, user must have ALL roles/permissions (default: false)
 * - fallback: Component to show if user doesn't have access (default: null)
 */
export function CanAccess({
  children,
  requiredRole,
  requiredPermission,
  requireAll = false,
  fallback = null,
}: CanAccessProps) {
  const { hasRole, hasPermission } = usePermissions();

  // Check role access
  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const roleCheck = requireAll
      ? rolesArray.every((role) => hasRole([role]))
      : rolesArray.some((role) => hasRole([role]));

    if (!roleCheck) {
      return fallback;
    }
  }

  // Check permission access
  if (requiredPermission) {
    const permArray = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    const permCheck = requireAll
      ? permArray.every((perm) => hasPermission(perm))
      : permArray.some((perm) => hasPermission(perm));

    if (!permCheck) {
      return fallback;
    }
  }

  // User has required access
  return children;
}
