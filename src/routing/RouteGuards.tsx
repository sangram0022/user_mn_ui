import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../domains/auth/context/AuthContext';

interface RouteGuardProps {
  children: ReactNode;
}

export const ProtectedRoute: FC<RouteGuardProps> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const PublicRoute: FC<RouteGuardProps> = ({ children }) => {
  const { user } = useAuth();

  // For public routes (login/register), don't show full-screen loader
  // The page itself will handle loading states (e.g., button spinner)
  // Only redirect if user is already authenticated
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
