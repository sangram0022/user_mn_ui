// ========================================
// CanAccess Component
// ========================================
// Conditionally renders content based on permissions
// ✅ Minimal, DRY implementation
// ========================================

import type { CanAccessProps } from '../domains/rbac/types/rbac.types';
import { usePermissions } from '../domains/rbac/hooks/usePermissions';

/**
 * Conditional rendering component
 * Shows children if user has required permissions
 * Shows fallback otherwise
 *
 * Example:
 * ```tsx
 * <CanAccess requiredRole="admin" fallback={<p>No access</p>}>
 *   <AdminPanel />
 * </CanAccess>
 *
 * <CanAccess
 *   requiredPermissions={['users:delete', 'users:edit']}
 *   requireAllPermissions={false}
 * >
 *   <DeleteButton />
 * </CanAccess>
 * ```
 */
export function CanAccess({
  children,
  requiredRole,
  requiredPermissions,
  requireAllPermissions = false,
  fallback = null,
  className,
}: CanAccessProps) {
  const { hasAccess } = usePermissions();

  const allowed = hasAccess({
    requiredRole,
    requiredPermissions,
    requireAllPermissions,
  });

  if (!allowed) {
    return fallback ? <div className={className}>{fallback}</div> : null;
  }

  return <div className={className}>{children}</div>;
}

// ✅ Export for convenience
export default CanAccess;
