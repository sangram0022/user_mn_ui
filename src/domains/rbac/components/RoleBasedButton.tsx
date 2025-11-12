/**
 * ========================================
 * RoleBasedButton Component
 * ========================================
 * Button that renders based on user role/permission checks
 * Automatically disables or hides if user lacks required permissions
 *
 * @example
 * <RoleBasedButton requiredRole="admin">
 *   Delete User
 * </RoleBasedButton>
 * ========================================
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { Button } from '../../../components';
import type { UserRole, Permission } from '../types/rbac.types';

interface RoleBasedButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: Permission | Permission[];
  requireAll?: boolean;
  disabledBehavior?: 'hide' | 'disable';
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

/**
 * RoleBasedButton - Button with built-in RBAC checks
 *
 * Props:
 * - requiredRole: Single role or array (ANY by default, or ALL if requireAll=true)
 * - requiredPermission: Single permission or array
 * - requireAll: If true, user must have ALL roles/permissions (default: false)
 * - disabledBehavior: 'hide' removes button, 'disable' grays it out (default: 'hide')
 * - variant, size: Standard button styling (passed to Button component)
 * - All standard button props (onClick, className, etc.)
 */
export function RoleBasedButton({
  children,
  requiredRole,
  requiredPermission,
  requireAll = false,
  disabledBehavior = 'hide',
  variant = 'primary',
  size = 'md',
  disabled = false,
  ...buttonProps
}: RoleBasedButtonProps) {
  const { hasRole, hasPermission } = usePermissions();

  // Check role access
  let hasRoleAccess = true;
  if (requiredRole) {
    const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    hasRoleAccess = requireAll
      ? rolesArray.every((role) => hasRole([role]))
      : rolesArray.some((role) => hasRole([role]));
  }

  // Check permission access
  let hasPermAccess = true;
  if (requiredPermission) {
    const permArray = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
    hasPermAccess = requireAll
      ? permArray.every((perm) => hasPermission(perm))
      : permArray.some((perm) => hasPermission(perm));
  }

  const hasAccess = hasRoleAccess && hasPermAccess;

  // Hide button if access denied and behavior is 'hide'
  if (!hasAccess && disabledBehavior === 'hide') {
    return null;
  }

  // Render button (disabled if no access and behavior is 'disable')
  return (
    <Button
      {...buttonProps}
      variant={variant}
      size={size}
      disabled={disabled || (!hasAccess && disabledBehavior === 'disable')}
    >
      {children}
    </Button>
  );
}
