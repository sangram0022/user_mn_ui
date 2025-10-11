import React, { Suspense, lazy } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingSpinner from './components/common/LoadingSpinner';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { GlobalStyles, theme } from './styles/global';

// Lazy load components for code splitting
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const AuditLogsPage = lazy(() => import('./pages/admin/AuditLogsPage'));
const BulkOperationsPage = lazy(() => import('./pages/admin/BulkOperationsPage'));
const HealthDashboardPage = lazy(() => import('./pages/admin/HealthDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/common/NotFoundPage'));

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, hasAnyRole } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !hasAnyRole(['admin', 'super_admin'])) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Public Route Component
 * Redirects to dashboard if user is already authenticated
 */
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * App Routes Component
 * Defines all application routes with proper protection
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit"
        element={
          <ProtectedRoute adminOnly>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bulk"
        element={
          <ProtectedRoute adminOnly>
            <BulkOperationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/health"
        element={
          <ProtectedRoute adminOnly>
            <HealthDashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Default Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

/**
 * Main App Component
 * Sets up providers, routing, and global error handling
 */
const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AuthProvider>
          <Router>
            <Suspense fallback={<LoadingSpinner />}>
              <AppRoutes />
            </Suspense>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
