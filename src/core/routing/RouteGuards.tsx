// ========================================
// Route Guards - Authentication & Authorization
// ========================================
// Following industry-standard patterns for:
// - Protected routes (authentication required)
// - Public routes (redirect if authenticated)
// - Role-based access control (admin routes)
// - Type-safe with React Router v6
// ========================================

import type { FC, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { use } from 'react';
import { AuthContext } from '../../domains/auth/context/AuthContext';
import { usePermissions } from '../../domains/rbac/hooks/usePermissions';
import type { UserRole } from '../../domains/rbac/types/rbac.types';
import { ROUTES } from './config';

// ========================================
// Types
// ========================================

interface RouteGuardProps {
  children: ReactNode;
  requiredRoles?: UserRole[];
}

// ========================================
// Loading Component
// ========================================

const LoadingScreen: FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-primary border-r-transparent"></div>
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

// ========================================
// Protected Route Guard
// ========================================
// Requires authentication
// Redirects to login if not authenticated

export const ProtectedRoute: FC<RouteGuardProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = use(AuthContext);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Redirect to login, preserving the attempted location
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// ========================================
// Public Route Guard
// ========================================
// For auth pages (login, register, etc.)
// Redirects to dashboard if already authenticated

export const PublicRoute: FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = use(AuthContext);

  if (isLoading) {
    // For public routes, show content immediately
    // Don't block with loading screen
    return <>{children}</>;
  }

  if (isAuthenticated) {
    // Already logged in, redirect to user dashboard
    return <Navigate to={ROUTES.USER_DASHBOARD} replace />;
  }

  return <>{children}</>;
};

// ========================================
// Admin Route Guard
// ========================================
// Requires authentication + admin role
// Redirects to login if not authenticated
// Redirects to home if authenticated but not admin

export const AdminRoute: FC<RouteGuardProps> = ({ children, requiredRoles = ['admin', 'super_admin'] }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading } = use(AuthContext);
  const { hasRole } = usePermissions();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    // Not authenticated, redirect to login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Check if user has required role using centralized permission hook
  if (!hasRole(requiredRoles)) {
    // Authenticated but not authorized
    // Redirect to home page
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return <>{children}</>;
};

// ========================================
// No Guard (Public Route)
// ========================================
// No authentication required
// No redirect logic

export const NoGuard: FC<RouteGuardProps> = ({ children }) => {
  return <>{children}</>;
};
