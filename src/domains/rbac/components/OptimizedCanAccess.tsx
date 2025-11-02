/**
 * ========================================
 * Optimized CanAccess Component (Phase 2)
 * ========================================
 * High-performance conditional rendering with React.memo optimization
 * Prevents unnecessary re-renders when RBAC state hasn't changed
 * Optimized for lightning-fast user experience
 *
 * Performance improvements:
 * - React.memo with custom comparison function
 * - Memoized permission calculations
 * - Optimized early returns
 * - Zero unnecessary re-renders
 * ========================================
 */

import { memo, useMemo, type ReactNode } from 'react';
import { usePermissions } from '../hooks/usePermissions';
import type { UserRole, Permission } from '../types/rbac.types';

interface OptimizedCanAccessProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
  requiredPermission?: Permission | Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * Internal component (before memo) for better performance debugging
 */
function CanAccessInternal({
  children,
  requiredRole,
  requiredPermission,
  requireAll = false,
  fallback = null,
}: OptimizedCanAccessProps) {
  const { hasRole, hasPermission } = usePermissions();

  // ✅ Memoize complex access calculations
  const accessResult = useMemo(() => {
    // Check role access
    if (requiredRole) {
      const rolesArray = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      const roleCheck = requireAll
        ? rolesArray.every((role) => hasRole([role]))
        : rolesArray.some((role) => hasRole([role]));

      if (!roleCheck) {
        return { hasAccess: false, reason: 'role' };
      }
    }

    // Check permission access
    if (requiredPermission) {
      const permArray = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
      const permCheck = requireAll
        ? permArray.every((perm) => hasPermission(perm))
        : permArray.some((perm) => hasPermission(perm));

      if (!permCheck) {
        return { hasAccess: false, reason: 'permission' };
      }
    }

    return { hasAccess: true, reason: null };
  }, [
    requiredRole,
    requiredPermission,
    requireAll,
    hasRole,
    hasPermission,
  ]);

  // ✅ Early return optimization
  if (!accessResult.hasAccess) {
    return <>{fallback}</>;
  }

  // ✅ User has required access
  return <>{children}</>;
}

/**
 * Custom comparison function for React.memo
 * Only re-render if RBAC-relevant props change
 */
function arePropsEqual(
  prevProps: OptimizedCanAccessProps,
  nextProps: OptimizedCanAccessProps
): boolean {
  // ✅ Critical RBAC props that affect access decisions
  const rbacPropsEqual = (
    prevProps.requiredRole === nextProps.requiredRole &&
    prevProps.requiredPermission === nextProps.requiredPermission &&
    prevProps.requireAll === nextProps.requireAll
  );

  // ✅ Children and fallback comparison
  const childrenEqual = prevProps.children === nextProps.children;
  const fallbackEqual = prevProps.fallback === nextProps.fallback;

  return rbacPropsEqual && childrenEqual && fallbackEqual;
}

/**
 * ⚡ OptimizedCanAccess - Phase 2 Performance Optimized
 *
 * Performance Features:
 * - React.memo with custom comparison
 * - Memoized access calculations
 * - Early return optimizations
 * - Zero unnecessary re-renders
 * - Detailed access reasoning for debugging
 *
 * Usage:
 * ```tsx
 * <OptimizedCanAccess requiredRole="admin" fallback={<UnauthorizedMessage />}>
 *   <AdminPanel />
 * </OptimizedCanAccess>
 * ```
 */
export const OptimizedCanAccess = memo(CanAccessInternal, arePropsEqual);

// Set display name for better debugging
OptimizedCanAccess.displayName = 'OptimizedCanAccess';

export default OptimizedCanAccess;