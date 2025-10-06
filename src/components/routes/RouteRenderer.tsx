import React, { Suspense, useEffect } from 'react';
import ErrorBoundary from '../ErrorBoundary';
import Loading from '../Loading';
import AppLayout from '../layout/AppLayout';
import AuthLayout from '../layout/AuthLayout';
import type { RouteConfig } from '../../config/routes';

const PlainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => <>{children}</>;

const layoutComponents: Record<RouteConfig['layout'], React.ComponentType<{ children: React.ReactNode }>> = {
  default: AppLayout,
  auth: AuthLayout,
  none: PlainLayout,
};

const RouteRenderer: React.FC<{ route: RouteConfig }> = ({ route }) => {
  const {
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

    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
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
