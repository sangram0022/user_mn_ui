/* eslint-disable react-refresh/only-export-components */
/**
 * Simplified Routing Configuration
 * Expert-level React routing with security and performance
 */

import React, { Suspense } from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import { PageErrorBoundary } from '../errors/ErrorBoundary';
import { SkeletonLoader } from '../performance/lazyLoading';

// Lazy load the only existing component
const DesignSystemDemo = React.lazy(() => import('../../components/DesignSystemDemo'));

// Simple layout component
function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">User Management System</h1>
              </div>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Suspense fallback={<SkeletonLoader />}>{children}</Suspense>
        </main>
      </div>
    </PageErrorBoundary>
  );
}

// Route definitions
const routes: RouteObject[] = [
  {
    path: '/',
    element: (
      <Layout>
        <DesignSystemDemo />
      </Layout>
    ),
  },
  {
    path: '/design-system',
    element: (
      <Layout>
        <DesignSystemDemo />
      </Layout>
    ),
  },
  {
    path: '*',
    element: (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
          <a
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            Go Home
          </a>
        </div>
      </Layout>
    ),
  },
];

// Create router with performance optimizations
export const appRouter = createBrowserRouter(routes);

export default appRouter;
