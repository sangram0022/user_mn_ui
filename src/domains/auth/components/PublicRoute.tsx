// ========================================
// Public Route Component
// Redirects to dashboard if already authenticated
// ========================================

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Public Route wrapper component
 * Redirects authenticated users away from auth pages
 * Useful for login/register pages
 * 
 * @example
 * ```tsx
 * <Route path="/login" element={
 *   <PublicRoute redirectTo="/dashboard">
 *     <LoginPage />
 *   </PublicRoute>
 * } />
 * ```
 */
export function PublicRoute({ 
  children, 
  redirectTo = '/dashboard' 
}: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Get the intended destination from location state
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || redirectTo;

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  // Render children if not authenticated
  return <>{children}</>;
}
