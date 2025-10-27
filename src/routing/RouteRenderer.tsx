import type { ComponentType, FC, ReactNode } from 'react';
import { Suspense, useEffect, useState, useTransition } from 'react';
import { useLocation } from 'react-router-dom';

import AdminLayout from '@domains/admin/layouts/AdminLayout';
import AppLayout from '@layouts/AppLayout';
import AuthLayout from '@layouts/AuthLayout';
import { PageErrorBoundary as ErrorBoundary } from '@shared/errors/ErrorBoundary';
import type { RouteConfig } from './config';
import { routePreloader } from './routePreloader';

const PlainLayout: FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

const layoutComponents: Record<RouteConfig['layout'], ComponentType<{ children: ReactNode }>> = {
  default: AppLayout,
  auth: AuthLayout,
  admin: AdminLayout,
  none: PlainLayout,
};

const RouteRenderer: FC<{ route: RouteConfig }> = ({ route }) => {
  const {
    component: Component,
    layout,
    suspenseFallback,
    // title, description, documentTitleFormatter - deprecated, use PageMetadata in components
  } = route;

  const location = useLocation();
  const [isPending, startTransition] = useTransition();
  const [isReady, setIsReady] = useState(false);

  // Preload likely next routes based on current location
  useEffect(() => {
    routePreloader.preloadLikelyNextRoutes(location.pathname);
  }, [location.pathname]);

  // Mark route as ready after first render
  useEffect(() => {
    startTransition(() => {
      setIsReady(true);
    });
  }, []);

  // [DONE] React 19: No longer need manual document.title manipulation
  // Components now use <PageMetadata> for declarative metadata
  // Keeping route config for backward compatibility, but metadata is now handled by components

  const LayoutComponent = layoutComponents[layout] ?? PlainLayout;

  // Optimized fallback - minimal, non-blocking
  const optimizedFallback = suspenseFallback || (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="spinner spinner-lg spinner-primary" />
    </div>
  );

  return (
    <ErrorBoundary>
      <Suspense fallback={optimizedFallback}>
        <LayoutComponent>
          <div className={isPending && !isReady ? 'opacity-70 transition-opacity' : ''}>
            <Component />
          </div>
        </LayoutComponent>
      </Suspense>
    </ErrorBoundary>
  );
};

export default RouteRenderer;
