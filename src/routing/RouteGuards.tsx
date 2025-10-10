import type { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { useAuth } from '../domains/auth/context/AuthContext';
import Loading from '@shared/ui/Loading';

interface RouteGuardProps { children: ReactNode;
 }

const FullScreenLoader: FC = () => (
  <Loading fullScreen overlay text="Loading..." />
);

export const ProtectedRoute: FC<RouteGuardProps> = ({ children }) => { const { user, isLoading } = useAuth();

  if (isLoading) { return <FullScreenLoader />;
  }

  if (!user) { return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const PublicRoute: FC<RouteGuardProps> = ({ children }) => { const { user, isLoading } = useAuth();

  if (isLoading) { return <FullScreenLoader />;
  }

  if (user) { return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
