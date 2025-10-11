import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
}) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Auto-refresh token if needed
    if (requireAuth && !isLoading && !isAuthenticated) {
      const token = localStorage.getItem('access_token');
      if (token) {
        // Try to restore session
        useAuthStore.getState().refreshToken?.();
      }
    }
  }, [requireAuth, isLoading, isAuthenticated]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && user && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // If not requiring auth but user is authenticated, redirect appropriately
  if (!requireAuth && isAuthenticated) {
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
