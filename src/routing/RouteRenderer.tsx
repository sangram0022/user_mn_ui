import { Suspense, useEffect } from 'react';
import type { ComponentType, FC, ReactNode } from 'react';

import AppLayout from '@layouts/AppLayout';
import AuthLayout from '@layouts/AuthLayout';
import { PageErrorBoundary as ErrorBoundary } from '@shared/errors/ErrorBoundary';
import Loading from '@shared/ui/Loading';
import type { RouteConfig } from './config';

const PlainLayout: FC<{ children: ReactNode }> = ({ children }) => <>{children}</>;

const layoutComponents: Record<RouteConfig['layout'], ComponentType<{ children: ReactNode }>> = { default: AppLayout,
  auth: AuthLayout,
  none: PlainLayout, };

const RouteRenderer: FC<{ route: RouteConfig }> = ({ route }) => { const {
    component: Component,
    layout,
    title,
    description,
    suspenseFallback,
    documentTitleFormatter,
  } = route;

  useEffect(() => {
    if (title) {
      const formattedTitle = documentTitleFormatter
        ? documentTitleFormatter(title)
        : `${title} | User Management UI`;
      document.title = formattedTitle;
    }

    if (description) { const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [title, description, documentTitleFormatter]);

  const LayoutComponent = layoutComponents[layout] ?? PlainLayout;

  return (
    <ErrorBoundary>
      <Suspense fallback={suspenseFallback ?? <Loading fullScreen overlay text="Loading page..." />}>
        <LayoutComponent>
          <Component />
        </LayoutComponent>
      </Suspense>
    </ErrorBoundary>
  );
};

export default RouteRenderer;
