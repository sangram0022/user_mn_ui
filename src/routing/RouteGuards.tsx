import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../domains/auth/context/AuthContext';

interface RouteGuardProps {
  children: ReactNode;
}

const FullScreenLoader: FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

export const ProtectedRoute: FC<RouteGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const PublicRoute: FC<RouteGuardProps> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
