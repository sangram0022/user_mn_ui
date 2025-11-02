// RbacWrapper - Bridges AuthContext and RbacProvider
import { use } from 'react';
import type { ReactNode } from 'react';
import { RbacProvider } from '../domains/rbac/context/RbacProvider';
import { AuthContext } from '../domains/auth/context/AuthContext';
import type { UserRole } from '../domains/rbac/types/rbac.types';

interface RbacWrapperProps {
  children: ReactNode;
}

/**
 * RbacWrapper bridges the gap between AuthContext and RbacProvider.
 * It uses the React 19 'use()' hook to access auth context and passes
 * user roles and permissions to RbacProvider.
 *
 * This pattern ensures:
 * 1. RbacProvider is inside AuthProvider (can access auth context)
 * 2. Permissions are computed and available before RBAC checks
 * 3. Clean separation between Auth and RBAC concerns
 */
export function RbacWrapper({ children }: RbacWrapperProps) {
  // Access auth context to get user roles and permissions
  const auth = use(AuthContext);

  return (
    <RbacProvider
      userRoles={(auth.user?.roles as UserRole[]) || []}
      permissions={auth.permissions || []}
    >
      {children}
    </RbacProvider>
  );
}
