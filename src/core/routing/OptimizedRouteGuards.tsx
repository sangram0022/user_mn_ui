/**
 * ========================================
 * Optimized Route Guards (Phase 2)
 * ========================================
 * High-performance route protection with React.memo optimization
 * Prevents unnecessary re-renders during navigation
 * Optimized for lightning-fast user experience
 *
 * Performance improvements:
 * - React.memo with custom comparison function
 * - Memoized authentication and authorization checks
 * - Optimized early returns
 * - Zero unnecessary re-renders during navigation
 * ========================================
 */

import { memo, useMemo, type FC, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { use } from 'react';
import { AuthContext } from '../../domains/auth/context/AuthContext';
import { usePermissions } from '../../domains/rbac/hooks/usePermissions';
import type { UserRole } from '../../domains/rbac/types/rbac.types';
import { ROUTES } from './config';

// ========================================
// Types
// ========================================

interface OptimizedRouteGuardProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

// ========================================
// Optimized Loading Component
// ========================================

const OptimizedLoadingScreen: FC = memo(() => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-primary border-r-transparent"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
));

OptimizedLoadingScreen.displayName = 'OptimizedLoadingScreen';

// ========================================
// Optimized Protected Route Guard
// ========================================

function ProtectedRouteInternal({ children }: OptimizedRouteGuardProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = use(AuthContext);

  // Kept: useMemo for complex navigation state computation with multiple branches
  // React Compiler can't optimize conditional returns with Navigate components
  const navigationState = useMemo(() => {
    if (isLoading) {
      return { type: 'loading' as const };
    }
    
    if (!isAuthenticated) {
      return { 
        type: 'redirect' as const,
        to: ROUTES.LOGIN,
        state: { from: location }
      };
    }
    
    return { type: 'render' as const };
  }, [isAuthenticated, isLoading, location]);

  switch (navigationState.type) {
    case 'loading':
      return <OptimizedLoadingScreen />;
    
    case 'redirect':
      return (
        <Navigate 
          to={navigationState.to} 
          state={navigationState.state} 
          replace 
        />
      );
    
    case 'render':
    default:
      return <>{children}</>;
  }
}

/**
 * Custom comparison for ProtectedRoute
 */
function protectedRoutePropsEqual(
  prevProps: OptimizedRouteGuardProps,
  nextProps: OptimizedRouteGuardProps
): boolean {
  return prevProps.children === nextProps.children;
}

export const OptimizedProtectedRoute = memo(ProtectedRouteInternal, protectedRoutePropsEqual);
OptimizedProtectedRoute.displayName = 'OptimizedProtectedRoute';

// ========================================
// Optimized Public Route Guard
// ========================================

function PublicRouteInternal({ children }: OptimizedRouteGuardProps) {
  const { isAuthenticated, isLoading } = use(AuthContext);

  // Kept: useMemo for navigation state computation - prevents unnecessary Navigate renders
  const navigationState = useMemo(() => {
    if (isLoading) {
      return { type: 'render' as const }; // Show content immediately for public routes
    }
    
    if (isAuthenticated) {
      return { 
        type: 'redirect' as const,
        to: ROUTES.USER_DASHBOARD
      };
    }
    
    return { type: 'render' as const };
  }, [isAuthenticated, isLoading]);

  if (navigationState.type === 'redirect') {
    return <Navigate to={navigationState.to} replace />;
  }

  return <>{children}</>;
}

/**
 * Custom comparison for PublicRoute
 */
function publicRoutePropsEqual(
  prevProps: OptimizedRouteGuardProps,
  nextProps: OptimizedRouteGuardProps
): boolean {
  return prevProps.children === nextProps.children;
}

export const OptimizedPublicRoute = memo(PublicRouteInternal, publicRoutePropsEqual);
OptimizedPublicRoute.displayName = 'OptimizedPublicRoute';

// ========================================
// Optimized Admin Route Guard
// ========================================

function AdminRouteInternal({ 
  children, 
  requiredRoles = ['admin', 'super_admin'] 
}: OptimizedRouteGuardProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = use(AuthContext);
  const { hasRole } = usePermissions();

  // Kept: useMemo for complex authorization logic with role checking
  // Multiple conditional branches prevent compiler optimization
  const authorizationState = useMemo(() => {
    if (isLoading) {
      return { type: 'loading' as const };
    }
    
    if (!isAuthenticated) {
      return { 
        type: 'redirect' as const,
        to: ROUTES.LOGIN,
        state: { from: location }
      };
    }
    
    if (!hasRole(requiredRoles)) {
      return { 
        type: 'redirect' as const,
        to: ROUTES.HOME
      };
    }
    
    return { type: 'render' as const };
  }, [isAuthenticated, isLoading, hasRole, requiredRoles, location]);

  switch (authorizationState.type) {
    case 'loading':
      return <OptimizedLoadingScreen />;
    
    case 'redirect':
      return (
        <Navigate 
          to={authorizationState.to} 
          state={authorizationState.state} 
          replace 
        />
      );
    
    case 'render':
    default:
      return <>{children}</>;
  }
}

/**
 * Custom comparison for AdminRoute
 */
function adminRoutePropsEqual(
  prevProps: OptimizedRouteGuardProps,
  nextProps: OptimizedRouteGuardProps
): boolean {
  const childrenEqual = prevProps.children === nextProps.children;
  
  // Deep compare required roles array
  const rolesEqual = Boolean(
    (!prevProps.requiredRoles && !nextProps.requiredRoles) ||
    (prevProps.requiredRoles?.length === nextProps.requiredRoles?.length &&
     prevProps.requiredRoles?.every((role, index) => role === nextProps.requiredRoles?.[index]))
  );
  
  return childrenEqual && rolesEqual;
}

export const OptimizedAdminRoute = memo(AdminRouteInternal, adminRoutePropsEqual);
OptimizedAdminRoute.displayName = 'OptimizedAdminRoute';

// ========================================
// Optimized No Guard Route
// ========================================

function NoGuardInternal({ children }: OptimizedRouteGuardProps) {
  return <>{children}</>;
}

/**
 * Custom comparison for NoGuard
 */
function noGuardPropsEqual(
  prevProps: OptimizedRouteGuardProps,
  nextProps: OptimizedRouteGuardProps
): boolean {
  return prevProps.children === nextProps.children;
}

export const OptimizedNoGuard = memo(NoGuardInternal, noGuardPropsEqual);
OptimizedNoGuard.displayName = 'OptimizedNoGuard';

