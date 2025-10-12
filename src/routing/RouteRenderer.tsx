import type { ComponentType, FC, ReactNode } from 'react';
import { Suspense, useEffect, useState, useTransition } from 'react';
import { useLocation } from 'react-router-dom';

import AppLayout from '@layouts/AppLayout';
import AuthLayout from '@layouts/AuthLayout';
import { PageErrorBoundary as ErrorBoundary } from '@shared/errors/ErrorBoundary';
import type { RouteConfig } from './config';
import { routePreloader } from './routePreloader';

const PlainLayout: FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

const layoutComponents: Record<RouteConfig['layout'], ComponentType<{ children: ReactNode }>> = {
  default: AppLayout,
  auth: AuthLayout,
  none: PlainLayout,
};

const RouteRenderer: FC<{ route: RouteConfig }> = ({ route }) => {
  const {
    component: Component,
    layout,
    title,
    description,
    suspenseFallback,
    documentTitleFormatter,
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

  useEffect(() => {
    if (title) {
      const formattedTitle = documentTitleFormatter
        ? documentTitleFormatter(title)
        : `${title} | User Management UI`;
      document.title = formattedTitle;
    }

    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description, documentTitleFormatter]);

  const LayoutComponent = layoutComponents[layout] ?? PlainLayout;

  // Optimized fallback - minimal, non-blocking
  const optimizedFallback = suspenseFallback || (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
